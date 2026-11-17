"""Prüfung der gemappten Quellen: Existenz, Verfügbarkeit, Einheit, Domain.

Die Integration rät nicht: Was nicht passt, wird mit einer Fehlermeldung im
Formular abgelehnt.
"""

from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import ATTR_DEVICE_CLASS, ATTR_UNIT_OF_MEASUREMENT, STATE_UNAVAILABLE, STATE_UNKNOWN

ENERGY_UNITS = frozenset({"Wh", "kWh", "MWh"})
TEMPERATURE_UNITS = frozenset({"°C", "K"})

ERROR_NOT_FOUND = "not_found"
ERROR_UNAVAILABLE = "unavailable"
ERROR_WRONG_UNIT = "wrong_unit"
ERROR_WRONG_DOMAIN = "wrong_domain"


def _availability(hass, entity_id: str) -> str | None:
    state = hass.states.get(entity_id)
    if state is None:
        return ERROR_NOT_FOUND
    if state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return ERROR_UNAVAILABLE
    return None


def _domain(entity_id: str) -> str:
    return entity_id.split(".", 1)[0]


def validate_energy(hass, entity_id: str) -> str | None:
    """Energiequelle: Sensor mit Energie-Geräteklasse oder Energie-Einheit."""
    error = _availability(hass, entity_id)
    if error:
        return error
    state = hass.states.get(entity_id)
    assert state is not None
    unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
    device_class = state.attributes.get(ATTR_DEVICE_CLASS)
    if unit is not None and unit not in ENERGY_UNITS:
        return ERROR_WRONG_UNIT
    if device_class is not None and device_class != SensorDeviceClass.ENERGY and unit not in ENERGY_UNITS:
        return ERROR_WRONG_UNIT
    return None


def validate_temperature(hass, entity_id: str) -> str | None:
    """Temperaturquelle: Sensor mit Temperatur-Geräteklasse oder °C/K."""
    error = _availability(hass, entity_id)
    if error:
        return error
    state = hass.states.get(entity_id)
    assert state is not None
    unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
    device_class = state.attributes.get(ATTR_DEVICE_CLASS)
    if unit is not None and unit not in TEMPERATURE_UNITS:
        return ERROR_WRONG_UNIT
    if device_class is not None and device_class != SensorDeviceClass.TEMPERATURE and unit not in TEMPERATURE_UNITS:
        return ERROR_WRONG_UNIT
    return None


def validate_status(hass, entity_id: str) -> str | None:
    """Statusquelle: Sensor oder Binary-Sensor, verfügbar."""
    if _domain(entity_id) not in ("sensor", "binary_sensor"):
        return ERROR_WRONG_DOMAIN
    return _availability(hass, entity_id)


def validate_climate(hass, entity_id: str) -> str | None:
    """Klimaquelle: climate-Entity, verfügbar."""
    if _domain(entity_id) != "climate":
        return ERROR_WRONG_DOMAIN
    return _availability(hass, entity_id)
