"""Diagnose ohne personenbezogene Daten.

Entity-IDs, Raumnamen und Wohnungsbezeichnungen können Namen enthalten und
bleiben deshalb draußen. Ausgegeben werden nur Zähler, Domänen und
Kennzahlen.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_CIRCUITS,
    CONF_COMPRESSOR_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_ROOMS,
    VERSION,
)


def _domain(entity_id: str | None) -> str | None:
    return entity_id.split(".", 1)[0] if entity_id else None


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Anonymisierte Diagnose eines Eintrags."""
    runtime = entry.runtime_data
    data = runtime.coordinator.data
    sources = {
        "power": _domain(entry.data.get(CONF_POWER_ENTITY)),
        "heat": _domain(entry.data.get(CONF_HEAT_ENTITY)),
        "outdoor": _domain(entry.data.get(CONF_OUTDOOR_ENTITY)),
        "compressor": _domain(entry.data.get(CONF_COMPRESSOR_ENTITY)),
        "optional_sources": sorted(key for key, value in entry.options.items() if value and key.endswith("_entity")),
    }
    return {
        "version": VERSION,
        "sources": sources,
        "counts": {
            "circuits": len(entry.options.get(CONF_CIRCUITS) or []),
            "rooms": len(entry.options.get(CONF_ROOMS) or []),
            "inventory_objects": len((await runtime.store.async_inventory()) or {}),
            "change_log_entries": len(await runtime.store.async_change_log(limit=2000)),
        },
        "metrics": {
            "cop_7_days": data.cop_short.cop,
            "cop_30_days": data.cop_long.cop,
            "days_with_data": data.days_with_data,
            "starts_per_day": data.starts_per_day,
            "runtime_per_cycle": data.runtime_per_cycle,
            "flow_deviation_median": data.deviation.median,
            "power_source": data.power_source,
            "room_samples": {room_id: stats.samples for room_id, stats in data.rooms.items()},
            "circuit_samples": {circuit_id: stats.samples for circuit_id, stats in data.circuits.items()},
        },
        "thresholds": data.thresholds.as_dict(),
        "findings": [{"id": finding.id, "severity": finding.severity, "key": finding.key} for finding in data.findings],
    }
