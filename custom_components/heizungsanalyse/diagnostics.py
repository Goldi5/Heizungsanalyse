"""Diagnose als Download und als Websocket-Abfrage.

Die Diagnose ist ausführlicher als die alten Zähler: Sie enthält
Konfiguration mit Entity-IDs, einen Quellen-Check, Kennzahlen, Raum- und
Kreisdetails, Speicherstand, Laufzeit sowie Protokoll und Debug-Spur.
Personenbezogene Felder werden geschwärzt.
"""

from __future__ import annotations

from datetime import datetime
import logging
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN, __version__ as HA_VERSION
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .analysis.periods import merge_samples, samples_from_rollups
from .const import (
    CARD_URL,
    CONF_CIRCUITS,
    CONF_ROOMS,
    CONF_THRESHOLDS,
    MANDATORY_SOURCES,
    OPTIONAL_SOURCES,
    VERSION,
)
from .coordinator import ENERGY_UNITS, POWER_UNITS, TEMPERATURE_UNITS
from .data_access import async_read_metadata, async_read_raw
from .debug_log import get_trace
from .summary import build_summary, local_day

_LOGGER = logging.getLogger(__name__)

TO_REDACT = (
    "latitude",
    "longitude",
    "email",
    "token",
    "access_token",
    "refresh_token",
    "password",
    "api_key",
    "person",
    "persons",
)

SOURCE_ADVICE = {
    "ok": "",
    "not_found": "Entity existiert nicht mehr. Unter Konfigurieren eine andere Quelle wählen.",
    "unavailable": "Quelle ist nicht verfügbar. Gerät prüfen; die Auswertung pausiert, bis sie wieder liefert.",
    "no_statistics": "Keine Langzeitstatistik. Recorder und state_class prüfen; ohne Statistik rechnet die Integration nicht.",
    "unit_mismatch": "Einheit passt nicht zur Quelle. Sensor mit passender Einheit wählen.",
    "state_class_mismatch": "state_class passt nicht. Bei Zählern total oder total_increasing verwenden.",
    "format": "Format der Statistikzeilen unerwartet. Recorder-Version prüfen.",
}


def _domain(entity_id: str | None) -> str | None:
    return entity_id.split(".", 1)[0] if entity_id else None


def _start_format(value: Any) -> str:
    if isinstance(value, datetime):
        return "datetime"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return "timestamp"
    return "other"


def _iso(value: Any) -> str | None:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        seconds = float(value) / 1000 if value > 1e11 else float(value)
        return datetime.fromtimestamp(seconds).isoformat()
    return None


async def source_checks(hass: HomeAssistant, coordinator: Any) -> list[dict[str, Any]]:
    """Quellen-Check für alle zugeordneten Quellen (Entity → erwartete Art)."""
    return await _source_checks(hass, coordinator.source_kinds())


async def _source_checks(hass: HomeAssistant, entities: dict[str, str]) -> list[dict[str, Any]]:
    """Je Quelle: Zustand, Einheit, Statistikmenge, Format und Bewertung."""
    rows_daily = await async_read_raw(
        hass,
        entities,
        days=31,
        period="day",
        types={"change", "mean", "state"},
    )
    rows_hourly = await async_read_raw(hass, entities, days=7, period="hour", types={"mean"})
    metadata = await async_read_metadata(hass, entities)
    result: list[dict[str, Any]] = []
    for entity_id, kind in sorted(entities.items()):
        state = hass.states.get(entity_id)
        daily = rows_daily.get(entity_id) or []
        hourly = rows_hourly.get(entity_id) or []
        meta = metadata.get(entity_id)
        unit = None
        statistic_unit = None
        statistic_source = None
        has_mean = has_sum = False
        if meta is not None:
            _, data = meta
            unit = getattr(data, "unit_of_measurement", None)
            statistic_unit = getattr(data, "unit_of_measurement", None)
            statistic_source = getattr(data, "source", None)
            has_mean = bool(getattr(data, "has_mean", False))
            has_sum = bool(getattr(data, "has_sum", False))
        formats = sorted({_start_format(row.get("start")) for row in daily + hourly})
        types = sorted({key for row in daily for key in ("change", "state", "mean") if row.get(key) is not None})

        status = "ok"
        if state is None:
            status = "not_found"
        elif state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            status = "unavailable"
        elif kind == "binary" and not daily:
            # An/Aus-Sensoren haben keine Langzeitstatistik; ausgewertet wird der Zustandsverlauf
            status = "history"
        elif not daily and not hourly:
            status = "no_statistics"
        else:
            expected = {"energy": ENERGY_UNITS, "power": POWER_UNITS, "temperature": TEMPERATURE_UNITS}.get(kind)
            state_unit = state.attributes.get("unit_of_measurement")
            if expected and state_unit and state_unit not in expected:
                status = "unit_mismatch"
            elif kind == "energy" and state.attributes.get("state_class") not in ("total", "total_increasing"):
                status = "state_class_mismatch"
            elif formats and formats != ["datetime"] and formats != ["timestamp"]:
                status = "format"

        result.append(
            {
                "entity": entity_id,
                "kind": kind,
                "state": None if state is None else state.state,
                "unit": unit,
                "device_class": None if state is None else state.attributes.get("device_class"),
                "state_class": None if state is None else state.attributes.get("state_class"),
                "last_updated": None if state is None else state.last_updated.isoformat(),
                "statistic_unit": statistic_unit,
                "statistic_source": statistic_source,
                "has_mean": has_mean,
                "has_sum": has_sum,
                "daily_rows": len(daily),
                "daily_first": _iso(daily[0].get("start")) if daily else None,
                "daily_last": _iso(daily[-1].get("start")) if daily else None,
                "hourly_rows": len(hourly),
                "hourly_first": _iso(hourly[0].get("start")) if hourly else None,
                "hourly_last": _iso(hourly[-1].get("start")) if hourly else None,
                "start_format": formats,
                "statistic_types": types,
                "status": status,
                "advice": SOURCE_ADVICE.get(status, ""),
            }
        )
    return result


def _card_version(hass: HomeAssistant) -> dict[str, Any]:
    """Version der Karte aus der eingetragenen Ressourcen-URL."""
    data = hass.data.get("lovelace")
    resources = getattr(data, "resources", None)
    mode = "yaml" if resources is None or getattr(data, "resource_mode", "storage") != "storage" else "storage"
    url = None
    if resources is not None and mode == "storage":
        try:
            for item in resources.async_items():
                if str(item.get("url", "")).split("?")[0] == CARD_URL:
                    url = str(item.get("url"))
                    break
        except Exception:  # noqa: BLE001 - Diagnose darf nicht abstürzen
            url = None
    version = None
    if url and "?v=" in url:
        version = url.split("?v=", 1)[1].split("-", 1)[0]
    return {
        "url": url,
        "mode": mode,
        "version": version,
        "backend": VERSION,
        "matches": version == VERSION if version else None,
    }


async def async_build_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Diagnose für Download und Websocket (gleicher Inhalt)."""
    runtime = entry.runtime_data
    snapshot = runtime.coordinator.data
    rollups = await runtime.store.async_rollups()
    changes = await runtime.store.async_change_log(limit=50)
    inventory = await runtime.store.async_inventory()
    dashboard = await runtime.store.async_dashboard()
    history = merge_samples(samples_from_rollups(rollups), snapshot.samples)

    sources = {key: entry.data.get(key) for key in MANDATORY_SOURCES}
    sources |= {key: entry.options.get(key) for key in OPTIONAL_SOURCES}

    def _to_day(value):
        parsed = dt_util.parse_datetime(value)
        return None if parsed is None else dt_util.as_local(parsed).date()

    summary = build_summary(
        snapshot,
        version=VERSION,
        title=entry.title,
        language=hass.config.language,
        rooms=list(entry.options.get(CONF_ROOMS) or []),
        circuits=list(entry.options.get(CONF_CIRCUITS) or []),
        sources=sources,
        history=history,
        changes=changes,
        inventory=inventory,
        to_local_day=lambda value: local_day(value, _to_day),
        generated=dt_util.now(),
    )

    trace = get_trace()
    trace_rows = await trace.async_entries(limit=1000) if trace is not None else []
    log_rows = await runtime.log.async_last_hours(48)
    thresholds = entry.options.get(CONF_THRESHOLDS) or {}
    rollup_days = sorted(rollups)

    return {
        "version": VERSION,
        "versions": {
            "integration": VERSION,
            "homeassistant": HA_VERSION,
            "card": _card_version(hass),
        },
        "config": {
            "title": entry.title,
            "sources": {key: value for key, value in sources.items() if value},
            "circuits": [dict(item) for item in entry.options.get(CONF_CIRCUITS) or []],
            "rooms": [
                {
                    "id": room.get("id"),
                    "circuit": room.get("circuit"),
                    "climate_entity": room.get("climate_entity"),
                    "valve_position_entity": room.get("valve_position_entity"),
                }
                for room in entry.options.get(CONF_ROOMS) or []
            ],
            "thresholds": thresholds,
        },
        "sources": {key: _domain(value) for key, value in sources.items() if value},
        "source_checks": await source_checks(hass, runtime.coordinator),
        "counts": {
            "circuits": len(entry.options.get(CONF_CIRCUITS) or []),
            "rooms": len(entry.options.get(CONF_ROOMS) or []),
            "inventory_objects": len(inventory or {}),
            "change_log_entries": len(await runtime.store.async_change_log(limit=2000)),
        },
        "metrics": {
            "cop_7_days": snapshot.cop_short.cop,
            "cop_30_days": snapshot.cop_long.cop,
            "days_with_data": snapshot.days_with_data,
            "starts_per_day": snapshot.starts_per_day,
            "runtime_per_cycle": snapshot.runtime_per_cycle,
            "flow_deviation_median": snapshot.deviation.median,
            "power_source": snapshot.power_source,
            "room_samples": {room_id: stats.samples for room_id, stats in snapshot.rooms.items()},
            "circuit_samples": {circuit_id: stats.samples for circuit_id, stats in snapshot.circuits.items()},
        },
        "thresholds": snapshot.thresholds.as_dict(),
        "findings": [
            {"id": finding.id, "severity": finding.severity, "key": finding.key, "evidence": dict(finding.evidence)}
            for finding in snapshot.findings
        ],
        "summary": summary,
        "series_31": summary["series"][-31:],
        "cop_bins": summary["cop_bins"],
        "curve_bins": summary["curve_bins"],
        "flow_hours": {
            "count": len(getattr(runtime.coordinator, "_flow_hours", []) or []),
            "compressor_filtered": runtime.coordinator.runtime_diagnostics().get("compressor_filtered"),
            "median": snapshot.deviation.median,
            "p90": snapshot.deviation.p90,
        },
        "rooms_detail": runtime.coordinator.room_diagnostics(),
        "circuits_detail": runtime.coordinator.circuit_diagnostics(),
        "storage": {
            "rollups": len(rollup_days),
            "rollup_first": rollup_days[0].isoformat() if rollup_days else None,
            "rollup_last": rollup_days[-1].isoformat() if rollup_days else None,
            "change_log": changes,
            "inventory": inventory,
            "dashboard": dashboard,
            "log_entries": len(log_rows),
        },
        "runtime": runtime.coordinator.runtime_diagnostics(),
        "log": log_rows,
        "trace": trace_rows,
    }


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Einstieg für den Diagnose-Download von Home Assistant."""
    data = await async_build_diagnostics(hass, entry)
    return async_redact_data(data, TO_REDACT)
