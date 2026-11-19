"""Schmaler Adapter zur Langzeitstatistik des Recorders.

Nur dieses Modul kennt den Recorder. Die Analyseschicht bekommt neutrale
Werte und weiß nichts davon, woher sie stammen.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from datetime import UTC, datetime, timedelta
import logging
from typing import Any

from homeassistant.components.recorder import get_instance, statistics
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .analysis.types import DayValue, HourValue

_LOGGER = logging.getLogger(__name__)

DAILY_TYPES = {"change", "mean", "state"}
HOURLY_TYPES = {"mean"}


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    return None


def _start(value: Any) -> datetime | None:
    """Beginn einer Statistikzeile.

    Der Recorder liefert ``start`` je nach Version als ``datetime`` oder als
    Unix-Zeitstempel in Sekunden (aktuelle Versionen). Beides wird akzeptiert.
    """
    if isinstance(value, datetime):
        return value
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        seconds = float(value) / 1000 if value > 1e11 else float(value)
        return datetime.fromtimestamp(seconds, tz=UTC)
    return None


def parse_daily_rows(rows: Sequence[dict[str, Any]]) -> list[DayValue]:
    """Statistikzeilen (Tagesperiode) in neutrale Werte umwandeln."""
    result: list[DayValue] = []
    for row in rows:
        start = _start(row.get("start"))
        if start is None:
            continue
        result.append(
            DayValue(
                day=dt_util.as_local(start).date(),
                mean=_number(row.get("mean")),
                change=_number(row.get("change")),
                state=_number(row.get("state")),
            )
        )
    return sorted(result, key=lambda item: item.day)


def parse_hourly_rows(rows: Sequence[dict[str, Any]]) -> list[HourValue]:
    """Statistikzeilen (Stundenperiode) in neutrale Werte umwandeln."""
    result: list[HourValue] = []
    for row in rows:
        start = _start(row.get("start"))
        if start is None:
            continue
        result.append(HourValue(hour=start, mean=_number(row.get("mean"))))
    return sorted(result, key=lambda item: item.hour)


async def _read(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    *,
    start: datetime,
    period: str,
    types: set[str],
) -> dict[str, list[dict[str, Any]]]:
    wanted = {entity_id for entity_id in entity_ids if entity_id}
    if not wanted:
        return {}
    try:
        instance = get_instance(hass)
    except KeyError:
        _LOGGER.debug("Recorder nicht aktiv; keine Statistik verfuegbar")
        return {}

    rows_by_id = await instance.async_add_executor_job(
        statistics.statistics_during_period,
        hass,
        start,
        None,
        wanted,
        period,
        None,
        types,
    )
    return rows_by_id or {}


async def async_read_daily(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    days: int,
) -> dict[str, list[DayValue]]:
    """Tageswerte der letzten ``days`` Tage je Entity."""
    rows_by_id = await _read(
        hass,
        entity_ids,
        start=dt_util.utcnow() - timedelta(days=days),
        period="day",
        types=DAILY_TYPES,
    )
    return {entity_id: parse_daily_rows(rows) for entity_id, rows in rows_by_id.items()}


async def async_read_hourly(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    days: int,
) -> dict[str, list[HourValue]]:
    """Stundenwerte der letzten ``days`` Tage je Entity."""
    rows_by_id = await _read(
        hass,
        entity_ids,
        start=dt_util.utcnow() - timedelta(days=days),
        period="hour",
        types=HOURLY_TYPES,
    )
    return {entity_id: parse_hourly_rows(rows) for entity_id, rows in rows_by_id.items()}


async def async_read_hourly_change(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    start: datetime,
) -> dict[str, dict[datetime, float]]:
    """Stündliche Zuwächse von Zählern (kWh, m³) ab ``start`` je Entity."""
    rows_by_id = await _read(hass, entity_ids, start=start, period="hour", types={"change"})
    result: dict[str, dict[datetime, float]] = {}
    for entity_id, rows in rows_by_id.items():
        values: dict[datetime, float] = {}
        for row in rows:
            at = _start(row.get("start"))
            change = _number(row.get("change"))
            if at is not None and change is not None:
                values[at] = change
        result[entity_id] = values
    return result


async def async_read_energy_prefs(hass: HomeAssistant) -> dict[str, Any]:
    """Preise und Wasserzähler aus dem Energie-Dashboard (nur lesend).

    Liefert ``grid_price_entity`` / ``grid_price`` (€/kWh), ``water_entity`` und
    ``water_price`` (€/m³). Fehlt das Energie-Dashboard, bleibt das Ergebnis leer.
    """
    try:
        from homeassistant.components.energy.data import async_get_manager

        manager = await async_get_manager(hass)
    except Exception as err:  # noqa: BLE001 - Energie-Dashboard ist optional
        _LOGGER.debug("Energie-Dashboard nicht lesbar: %s", err)
        return {}
    data = getattr(manager, "data", None) or {}
    result: dict[str, Any] = {}
    for source in data.get("energy_sources") or []:
        kind = source.get("type")
        if kind == "grid" and "grid_price_entity" not in result and "grid_price" not in result:
            # Ältere Versionen: flow_from-Liste; neuere: Felder direkt an der Quelle
            flows = source.get("flow_from") or [source]
            for flow in flows:
                if flow.get("entity_energy_price"):
                    result["grid_price_entity"] = flow["entity_energy_price"]
                    break
                if flow.get("number_energy_price") is not None:
                    result["grid_price"] = float(flow["number_energy_price"])
                    break
            export = source.get("number_energy_price_export")
            if export is None:
                for flow in source.get("flow_to") or []:
                    export = flow.get("number_energy_price")
                    break
            if export is not None:
                result["feed_in_price"] = float(export)
        elif kind == "water" and "water_entity" not in result:
            result["water_entity"] = source.get("stat_energy_from")
            if source.get("entity_energy_price"):
                result["water_price_entity"] = source["entity_energy_price"]
            if source.get("number_energy_price") is not None:
                result["water_price"] = float(source["number_energy_price"])
    return result


async def async_read_raw(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    *,
    days: int,
    period: str,
    types: set[str],
) -> dict[str, list[dict[str, Any]]]:
    """Rohe Statistikzeilen für den Quellen-Check (Diagnose)."""
    return await _read(hass, entity_ids, start=dt_util.utcnow() - timedelta(days=days), period=period, types=types)


async def async_read_metadata(hass: HomeAssistant, entity_ids: Iterable[str]) -> dict[str, Any]:
    """Metadaten der Statistik (Einheit, Typ, Quelle) je Entity."""
    wanted = {entity_id for entity_id in entity_ids if entity_id}
    if not wanted:
        return {}
    try:
        instance = get_instance(hass)
    except KeyError:
        return {}
    return await instance.async_add_executor_job(statistics.get_metadata, hass, statistic_ids=wanted)


async def async_read_history(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    days: float,
    *,
    attributes: bool = False,
) -> dict[str, list[tuple[datetime, str, dict[str, Any]]]]:
    """Zustandsverlauf der letzten ``days`` Tage je Entity (nur lesend).

    Für Binärsensoren und Klima-Entities, die keine Langzeitstatistik haben.
    Der Zustand zu Fensterbeginn ist enthalten, damit Laufzeiten am Rand stimmen.
    """
    wanted = sorted({entity_id for entity_id in entity_ids if entity_id})
    if not wanted:
        return {}
    try:
        instance = get_instance(hass)
    except KeyError:
        _LOGGER.debug("Recorder nicht aktiv; kein Verlauf verfügbar")
        return {}
    from homeassistant.components.recorder import history

    start = dt_util.utcnow() - timedelta(days=days)

    def _load() -> dict[str, list]:
        return history.get_significant_states(
            hass,
            start,
            None,
            wanted,
            include_start_time_state=True,
            # auch reine Attributwechsel (Ist-/Soll-Temperatur eines Klima-Geräts)
            significant_changes_only=False,
            minimal_response=not attributes,
            no_attributes=not attributes,
        )

    try:
        raw = await instance.async_add_executor_job(_load)
    except Exception as err:  # noqa: BLE001 - Verlauf ist Zusatz, nie ein Abbruchgrund
        _LOGGER.debug("Verlauf nicht lesbar: %s", err)
        return {}
    result: dict[str, list[tuple[datetime, str, dict[str, Any]]]] = {}
    for entity_id, states in (raw or {}).items():
        rows: list[tuple[datetime, str, dict[str, Any]]] = []
        for item in states:
            if isinstance(item, dict):
                stamp = item.get("last_updated") or item.get("last_changed")
                when = dt_util.parse_datetime(stamp) if isinstance(stamp, str) else stamp
                state = item.get("state")
                attrs = item.get("attributes") or {}
            else:
                when = getattr(item, "last_updated", None) or getattr(item, "last_changed", None)
                state = getattr(item, "state", None)
                attrs = dict(getattr(item, "attributes", {}) or {})
            if isinstance(when, datetime) and state is not None:
                rows.append((when if when.tzinfo else when.replace(tzinfo=UTC), str(state), dict(attrs)))
        result[entity_id] = sorted(rows, key=lambda row: row[0])
    return result
