"""Persistenz: Geräteinventar, Änderungsverlauf und Tages-Roll-ups."""

from __future__ import annotations

from collections.abc import Iterable
from datetime import date
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .analysis.types import DaySample
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
ROLLUP_RETENTION_DAYS = 400
CHANGE_LOG_LIMIT = 2000

EMPTY_INVENTORY: dict[str, dict[str, Any]] = {
    "pumps": {},
    "thermostats": {},
    "hydraulics": {},
}


def _split_object(object_id: str) -> tuple[str, str | None]:
    """``pumps.hk2`` -> (``pumps``, ``hk2``); ``hydraulics`` -> (``hydraulics``, None)."""
    section, separator, key = object_id.partition(".")
    if not separator:
        return object_id, None
    return section, key or None


class InventoryStore:
    """Hält Inventar, Änderungsverlauf und Tageswerte im HA-Speicher."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry_id}")
        self._data: dict[str, Any] | None = None

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


def rollup_days(rollups: dict[str, dict[str, Any]]) -> list[date]:
    """Tage, für die Roll-ups vorliegen."""
    return sorted(date.fromisoformat(day) for day in rollups)
