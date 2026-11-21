"""Persistenz: Geräteinventar, Änderungsverlauf, Tages-Roll-ups, Protokoll."""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .analysis.event_log import DEFAULT_LIMIT, DEFAULT_RETENTION_DAYS
from .analysis.types import DaySample
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 2
ROLLUP_RETENTION_DAYS = 400
CHANGE_LOG_LIMIT = 2000
LOG_SAVE_DELAY_SECONDS = 10
TRACE_LINES = 3000
TRACE_HOURS = 12

EMPTY_INVENTORY: dict[str, dict[str, Any]] = {
    "pumps": {},
    "thermostats": {},
    "hydraulics": {},
    "radiators": {},
}


class _VersionedStore(Store[dict[str, Any]]):
    """Store mit Migration: ältere Fassungen werden unverändert übernommen.

    Version 1 (bis 0.2.x) kennt nur Inventar, Änderungsverlauf und Roll-ups;
    fehlende Bereiche (Protokoll, Debug-Spur, Dashboard) ergänzt ``async_load``.
    Ohne diese Methode wirft Home Assistant ``NotImplementedError`` und die
    Integration startet nach dem Update nicht (0.3.0/0.3.1).
    """

    async def _async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: dict[str, Any]
    ) -> dict[str, Any]:
        return dict(old_data or {})


def _split_object(object_id: str) -> tuple[str, str | None]:
    """``pumps.hk2`` -> (``pumps``, ``hk2``); ``hydraulics`` -> (``hydraulics``, None)."""
    section, separator, key = object_id.partition(".")
    if not separator:
        return object_id, None
    return section, key or None


class InventoryStore:
    """Hält Inventar, Änderungsverlauf und Tageswerte im HA-Speicher."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = _VersionedStore(hass, STORAGE_VERSION, f"{DOMAIN}.{entry_id}")
        self._data: dict[str, Any] | None = None
        self._save_handle: Any = None
        self._trace_dirty = False

    async def async_load(self) -> dict[str, Any]:
        """Daten einmalig laden; fehlende Bereiche werden ergänzt."""
        if self._data is None:
            stored = await self._store.async_load() or {}
            self._data = {
                "inventory": {section: dict(values) for section, values in EMPTY_INVENTORY.items()}
                | dict(stored.get("inventory") or {}),
                "change_log": list(stored.get("change_log") or []),
                "rollups": dict(stored.get("rollups") or {}),
                "dashboard": dict(stored.get("dashboard") or {}),
                "log": list(stored.get("log") or []),
                "evaluations": list(stored.get("evaluations") or []),
                "trace": list(stored.get("trace") or []),
                "config_snapshot": dict(stored.get("config_snapshot") or {}),
                "controls": list(stored.get("controls") or []),
                "control_values": dict(stored.get("control_values") or {}),
            }
        return self._data

    async def async_save(self) -> None:
        if self._data is not None:
            await self._store.async_save(self._data)

    async def async_update_inventory(
        self,
        object_id: str,
        values: dict[str, Any],
        *,
        note: str | None = None,
    ) -> list[dict[str, Any]]:
        """Stammdaten setzen und jede echte Änderung protokollieren."""
        data = await self.async_load()
        section, key = _split_object(object_id)
        target = data["inventory"].setdefault(section, {})
        record: dict[str, Any] = target if key is None else target.setdefault(key, {})

        timestamp = dt_util.utcnow().isoformat()
        changes: list[dict[str, Any]] = []
        for field, new_value in values.items():
            old_value = record.get(field)
            if old_value == new_value:
                continue
            record[field] = new_value
            change = {
                "ts": timestamp,
                "object": object_id,
                "field": field,
                "old": old_value,
                "new": new_value,
                "note": note,
            }
            data["change_log"].append(change)
            changes.append(change)

        if changes:
            data["change_log"] = data["change_log"][-CHANGE_LOG_LIMIT:]
            await self.async_save()
        return changes

    async def async_remove_inventory_item(self, object_id: str, *, note: str | None = None) -> dict[str, Any] | None:
        """Ein Inventar-Objekt löschen und den Löschvorgang protokollieren."""
        data = await self.async_load()
        section, key = _split_object(object_id)
        target = data["inventory"].get(section)
        if not isinstance(target, dict):
            return None

        if key is None:
            if not target:
                return None
            old_value: Any = dict(target)
            data["inventory"][section] = {}
        else:
            old_value = target.pop(key, None)
            if old_value is None:
                return None

        change = {
            "ts": dt_util.utcnow().isoformat(),
            "object": object_id,
            "field": "*",
            "old": old_value,
            "new": None,
            "note": note,
        }
        data["change_log"].append(change)
        data["change_log"] = data["change_log"][-CHANGE_LOG_LIMIT:]
        await self.async_save()
        return change

    async def async_log_change(
        self,
        object_id: str,
        field: str,
        *,
        old_value: Any = None,
        new_value: Any = None,
        note: str | None = None,
    ) -> dict[str, Any]:
        """Freie Änderung dokumentieren, ohne Stammdaten zu setzen."""
        data = await self.async_load()
        change = {
            "ts": dt_util.utcnow().isoformat(),
            "object": object_id,
            "field": field,
            "old": old_value,
            "new": new_value,
            "note": note,
        }
        data["change_log"].append(change)
        data["change_log"] = data["change_log"][-CHANGE_LOG_LIMIT:]
        await self.async_save()
        return change

    async def async_add_control(self, record: dict[str, Any]) -> None:
        """Eine Reglerverstellung für „Rückgängig“ merken (die letzten 20)."""
        data = await self.async_load()
        data["controls"] = [*data["controls"], record][-20:]
        await self.async_save()

    async def async_watch_controls(self, current: dict[str, Any], labels: dict[str, str]) -> None:
        """Vergleich mit dem letzten Stand; Änderungen von außen protokollieren."""
        data = await self.async_load()
        known: dict[str, Any] = data["control_values"]
        ours = {
            (r.get("entity"), r.get("new") if not r.get("undone") else r.get("old"))
            for r in data["controls"][-5:]
        }
        changed = False
        for entity, value in current.items():
            before = known.get(entity)
            if before is not None and before != value and (entity, value) not in ours:
                data["change_log"].append(
                    {
                        "ts": dt_util.utcnow().isoformat(),
                        "object": "regler",
                        "field": labels.get(entity, entity),
                        "old": before,
                        "new": value,
                        "note": "außerhalb des Dashboards verstellt (Regler, ISG oder anderes System)",
                    }
                )
                data["change_log"] = data["change_log"][-CHANGE_LOG_LIMIT:]
            if before != value:
                known[entity] = value
                changed = True
        if changed:
            await self.async_save()

    async def async_controls(self) -> list[dict[str, Any]]:
        return list((await self.async_load())["controls"])

    async def async_mark_control_undone(self, record_id: str) -> None:
        data = await self.async_load()
        for record in data["controls"]:
            if record.get("id") == record_id:
                record["undone"] = True
        await self.async_save()

    async def async_change_log(self, *, limit: int = 50) -> list[dict[str, Any]]:
        data = await self.async_load()
        return list(reversed(data["change_log"][-limit:]))

    async def async_inventory(self) -> dict[str, Any]:
        return dict((await self.async_load())["inventory"])

    async def async_save_rollups(self, samples: Iterable[DaySample]) -> None:
        """Abgeschlossene Tage dauerhaft sichern.

        Der heutige Tag ist unvollständig und wird nicht gespeichert, damit
        Auswertungen nicht mit Teilwerten arbeiten.
        """
        data = await self.async_load()
        today = dt_util.now().date()
        rollups: dict[str, dict[str, Any]] = data["rollups"]
        changed = False

        for sample in samples:
            if sample.day >= today:
                continue
            values = {
                "heat_kwh": sample.heat_kwh,
                "power_kwh": sample.power_kwh,
                "outdoor_c": sample.outdoor_c,
                "starts": sample.starts,
                "runtime_h": sample.runtime_h,
                "flow_c": sample.flow_c,
                "target_flow_c": sample.target_flow_c,
                "dhw_heat_kwh": sample.dhw_heat_kwh,
                "dhw_power_kwh": sample.dhw_power_kwh,
            }
            if rollups.get(sample.day.isoformat()) != values:
                rollups[sample.day.isoformat()] = values
                changed = True

        if len(rollups) > ROLLUP_RETENTION_DAYS:
            keep = sorted(rollups)[-ROLLUP_RETENTION_DAYS:]
            data["rollups"] = {day: rollups[day] for day in keep}
            changed = True

        if changed:
            await self.async_save()

    async def async_dashboard(self) -> dict[str, Any]:
        """Merkzeichen für das automatisch angelegte Dashboard."""
        return dict((await self.async_load()).get("dashboard") or {})

    async def async_mark_dashboard(self, *, url_path: str | None, created: bool) -> None:
        """Einmal angelegt (oder vorhanden) - danach nie wieder automatisch anlegen."""
        data = await self.async_load()
        data["dashboard"] = {
            "handled": True,
            "url_path": url_path,
            "created": created,
            "ts": dt_util.utcnow().isoformat(),
        }
        await self.async_save()

    async def async_rollups(self) -> dict[str, dict[str, Any]]:
        return dict((await self.async_load())["rollups"])

    # ------------------------------------------------------------- Protokoll

    def _schedule_save(self) -> None:
        """Speichern verzögern: nicht bei jedem Eintrag auf die Platte."""
        if self._save_handle is not None:
            return
        self._save_handle = async_call_later(self._hass, LOG_SAVE_DELAY_SECONDS, self._save_later)

    async def _save_later(self, _now) -> None:
        self._save_handle = None
        await self.async_save()

    async def async_flush(self) -> None:
        """Ausstehendes sofort sichern (beim Entladen und bei HA-Stopp)."""
        if self._save_handle is not None:
            self._save_handle()
            self._save_handle = None
        await self.async_save()

    async def async_append_log(self, entries: Iterable[dict[str, Any]]) -> int:
        """Protokolleinträge anhängen, begrenzen und verzögert sichern."""
        data = await self.async_load()
        added = list(entries)
        if not added:
            return 0
        data["log"].extend(added)
        now = dt_util.utcnow()
        cutoff = now - timedelta(days=DEFAULT_RETENTION_DAYS)
        kept = [entry for entry in data["log"] if _parse_ts(entry.get("ts")) is None or _parse_ts(entry.get("ts")) >= cutoff]
        if len(kept) > DEFAULT_LIMIT:
            kept = sorted(kept, key=lambda entry: _parse_ts(entry.get("ts")) or now)[-DEFAULT_LIMIT:]
        data["log"] = kept
        self._schedule_save()
        return len(added)

    async def async_log_entries(self, *, limit: int = 500, newest_first: bool = True) -> list[dict[str, Any]]:
        data = await self.async_load()
        entries = data["log"][-limit:]
        return list(reversed(entries)) if newest_first else entries

    # ------------------------------------------------------------ Debug-Spur

    async def async_set_trace(self, records: list[dict[str, Any]]) -> None:
        """Debug-Spur als Ganzes übernehmen (beim Sichern)."""
        data = await self.async_load()
        data["trace"] = list(records)[-TRACE_LINES:]
        self._trace_dirty = True

    async def async_append_trace(self, records: Iterable[dict[str, Any]]) -> int:
        """Debug-Spur anhängen (im Speicher, keine sofortige Platte)."""
        data = await self.async_load()
        added = list(records)
        if not added:
            return 0
        data["trace"].extend(added)
        now = dt_util.utcnow()
        cutoff = now - timedelta(hours=TRACE_HOURS)
        kept = [
            record for record in data["trace"] if _parse_ts(record.get("ts")) is None or _parse_ts(record.get("ts")) >= cutoff
        ]
        if len(kept) > TRACE_LINES:
            kept = kept[-TRACE_LINES:]
        data["trace"] = kept
        self._trace_dirty = True
        return len(added)

    async def async_trace_entries(self, *, limit: int = 500) -> list[dict[str, Any]]:
        data = await self.async_load()
        return list(reversed(data["trace"][-limit:]))

    async def async_save_trace(self) -> None:
        if self._data is not None and self._trace_dirty:
            self._trace_dirty = False
            await self._store.async_save(self._data)

    # --------------------------------------------------- Konfigurations-Snapshot

    async def async_evaluations(self) -> list[dict[str, Any]]:
        return list((await self.async_load()).get("evaluations") or [])

    async def async_add_evaluation(self, entry: dict[str, Any]) -> None:
        data = await self.async_load()
        data.setdefault("evaluations", []).append(entry)
        data["evaluations"] = data["evaluations"][-200:]
        await self.async_save()

    async def async_config_snapshot(self) -> dict[str, Any]:
        return dict((await self.async_load())["config_snapshot"])

    async def async_set_config_snapshot(self, snapshot: dict[str, Any]) -> None:
        data = await self.async_load()
        if data["config_snapshot"] == snapshot:
            return
        data["config_snapshot"] = snapshot
        await self.async_save()


def _parse_ts(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value
    if not value:
        return None
    try:
        return dt_util.parse_datetime(str(value))
    except (TypeError, ValueError):
        return None


def rollup_days(rollups: dict[str, dict[str, Any]]) -> list[date]:
    """Tage, für die Roll-ups vorliegen."""
    return sorted(date.fromisoformat(day) for day in rollups)
