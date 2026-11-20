"""Geräte der Anlage aus dem Geräteregister (nur lesend).

Statt leerer Inventarlisten zeigt das Dashboard, was Home Assistant schon weiß:
Hersteller und Modell der Wärmepumpe, der Pumpen und der Thermostate, Batterie
und Ventilöffnung aus Raumklima, gelernte Aufheizzeit.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import (
    CONF_CIRCUITS,
    CONF_COMPRESSOR_ENTITY,
    CONF_DHW_PUMP_ENTITY,
    CONF_POWER_ENTITY,
    CONF_PUMP_ENTITY,
    CONF_ROOMS,
)


def _device_of(hass: HomeAssistant, entity_id: str | None) -> dict[str, Any] | None:
    if not entity_id:
        return None
    entry = er.async_get(hass).async_get(entity_id)
    if entry is None or not entry.device_id:
        return None
    device = dr.async_get(hass).async_get(entry.device_id)
    if device is None:
        return None
    return {
        "name": device.name_by_user or device.name,
        "manufacturer": device.manufacturer,
        "model": device.model,
        "model_id": getattr(device, "model_id", None),
        "sw_version": device.sw_version,
        "platform": entry.platform,
    }


def _number(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def build_devices(hass: HomeAssistant, data: dict[str, Any], options: dict[str, Any]) -> dict[str, Any]:
    """Wärmepumpe, Pumpen, Thermostate – vorbelegt aus dem Register."""
    heat_pump = _device_of(hass, data.get(CONF_COMPRESSOR_ENTITY)) or _device_of(hass, data.get(CONF_POWER_ENTITY))

    pumps: list[dict[str, Any]] = []
    for circuit in options.get(CONF_CIRCUITS) or []:
        pump_id = circuit.get(CONF_PUMP_ENTITY)
        if not pump_id:
            continue
        state = hass.states.get(pump_id)
        pumps.append(
            {
                "circuit": circuit.get("id"),
                "name": circuit.get("name"),
                "entity": pump_id,
                "on": None if state is None else state.state == "on",
                "device": _device_of(hass, pump_id),
            }
        )
    dhw_pump = options.get(CONF_DHW_PUMP_ENTITY)
    if dhw_pump:
        state = hass.states.get(dhw_pump)
        pumps.append(
            {
                "circuit": "dhw",
                "name": "Warmwasser",
                "entity": dhw_pump,
                "on": None if state is None else state.state == "on",
                "device": _device_of(hass, dhw_pump),
            }
        )

    thermostats: list[dict[str, Any]] = []
    for room in options.get(CONF_ROOMS) or []:
        climate_id = room.get("climate_entity")
        state = hass.states.get(climate_id) if climate_id else None
        attrs = dict(state.attributes) if state is not None else {}
        settings = attrs.get("settings") or {}
        trv_ids = [settings.get("trv")] if settings.get("trv") else []
        trv_ids += [item.get("entity_id") for item in settings.get("extra_trvs") or [] if item.get("entity_id")]
        if not trv_ids and climate_id and "plan_reason" not in attrs:
            trv_ids = [climate_id]  # direkt ein Thermostat
        battery = attrs.get("battery") if isinstance(attrs.get("battery"), dict) else {}
        heatup = settings.get("heatup") if isinstance(settings.get("heatup"), dict) else {}
        thermostats.append(
            {
                "room": room.get("id"),
                "name": room.get("name"),
                "raumklima": "plan_reason" in attrs,
                "monitor": bool(attrs.get("monitor")),
                "temperature_sensor": attrs.get("temperature_sensor"),
                "valve": _number(attrs.get("valve_position")),
                "battery": _number(battery.get("level")),
                "battery_low": bool(battery.get("low")),
                "battery_name": battery.get("name"),
                "heatup_minutes_2k": _number(heatup.get("minutes_2k")),
                "heatup_episodes": heatup.get("episodes"),
                "trvs": [{"entity": trv, "device": _device_of(hass, trv)} for trv in trv_ids],
            }
        )

    return {"heat_pump": heat_pump, "pumps": pumps, "thermostats": thermostats}
