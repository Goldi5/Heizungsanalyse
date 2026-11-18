"""Prüfung und Metadaten der Einstellungen (Quellen, Kreise, Räume, Schwellen).

Die Oberfläche bekommt hier ihre Beschriftungen und Grenzen; ``config/save``
liefert feldbezogene Fehler statt eines pauschalen Fehlschlags.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

from homeassistant.core import HomeAssistant

from .const import (
    CIRCUIT_TYPES,
    CONF_AUX_HEATER_ENTITY,
    CONF_BUFFER_ENTITY,
    CONF_CIRCUIT,
    CONF_CIRCUITS,
    CONF_CLIMATE_ENTITY,
    CONF_CO2_FACTOR,
    CONF_COMPRESSOR_ENTITY,
    CONF_COMPRESSOR_RUNTIME_ENTITY,
    CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY,
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_DEFROST_ENTITY,
    CONF_DHW_HEAT_ENTITY,
    CONF_DHW_OPERATION_ENTITY,
    CONF_DHW_POWER_ENTITY,
    CONF_ENERGY_PRICE,
    CONF_FLOW_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_HP_FLOW_ENTITY,
    CONF_ID,
    CONF_MIXER_CLOSE_ENTITY,
    CONF_MIXER_OPEN_ENTITY,
    CONF_NAME,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_POWER_FALLBACK_ENTITY,
    CONF_POWER_NOW_ENTITY,
    CONF_PUMP_ENTITY,
    CONF_RETURN_ENTITY,
    CONF_ROOM_TYPE,
    CONF_ROOMS,
    CONF_TARGET_FLOW_ENTITY,
    CONF_TEMPERATURE_ENTITY,
    CONF_THRESHOLDS,
    CONF_TYPE,
    CONF_VALVE_POSITION_ENTITY,
    CONF_VOLUME_FLOW_ENTITY,
    MANDATORY_SOURCES,
    OPTIONAL_SOURCES,
    ROOM_TYPES,
)


def _label(de: str, en: str) -> dict[str, str]:
    return {"de": de, "en": en}


ENERGY_UNITS = ("Wh", "kWh", "MWh")
TEMPERATURE_UNITS = ("°C",)
POWER_UNITS = ("W", "kW")
FLOW_UNITS = ("l/min", "L/min", "m³/h")

_SOURCE_DEFS: tuple[tuple[str, str, str, str, tuple[str, ...] | None, bool], ...] = (
    (CONF_POWER_ENTITY, "data", "Strombezug der Wärmepumpe", "Heat pump electricity", ("sensor",), ENERGY_UNITS, True),
    (CONF_HEAT_ENTITY, "data", "Wärmemenge der Wärmepumpe", "Heat pump heat output", ("sensor",), ENERGY_UNITS, True),
    (CONF_OUTDOOR_ENTITY, "data", "Außentemperatur", "Outdoor temperature", ("sensor",), TEMPERATURE_UNITS, True),
    (CONF_COMPRESSOR_ENTITY, "data", "Verdichter läuft", "Compressor running", ("binary_sensor", "sensor"), None, True),
    (
        CONF_POWER_FALLBACK_ENTITY,
        "options",
        "Strombezug Ersatzquelle",
        "Electricity fallback source",
        ("sensor",),
        ENERGY_UNITS,
        False,
    ),
    (CONF_DHW_HEAT_ENTITY, "options", "Wärmemenge Warmwasser", "DHW heat output", ("sensor",), ENERGY_UNITS, False),
    (CONF_FLOW_ENTITY, "options", "Vorlauftemperatur", "Flow temperature", ("sensor",), TEMPERATURE_UNITS, False),
    (CONF_TARGET_FLOW_ENTITY, "options", "Vorlauf-Sollwert", "Flow setpoint", ("sensor",), TEMPERATURE_UNITS, False),
    (CONF_RETURN_ENTITY, "options", "Rücklauftemperatur", "Return temperature", ("sensor",), TEMPERATURE_UNITS, False),
    (CONF_BUFFER_ENTITY, "options", "Puffertemperatur", "Buffer temperature", ("sensor",), TEMPERATURE_UNITS, False),
    (CONF_DEFROST_ENTITY, "options", "Abtauung", "Defrost", ("binary_sensor", "sensor"), None, False),
    (CONF_AUX_HEATER_ENTITY, "options", "Heizstab", "Auxiliary heater", ("binary_sensor", "sensor"), None, False),
    (CONF_COMPRESSOR_STARTS_ENTITY, "options", "Verdichterstarts", "Compressor starts", ("sensor",), None, False),
    (CONF_COMPRESSOR_RUNTIME_ENTITY, "options", "Verdichterlaufzeit", "Compressor runtime", ("sensor",), None, False),
    (CONF_HP_FLOW_ENTITY, "options", "Durchfluss Wärmepumpe", "Heat pump flow", ("sensor",), FLOW_UNITS, False),
    (CONF_VOLUME_FLOW_ENTITY, "options", "Volumenstrom", "Volume flow", ("sensor",), FLOW_UNITS, False),
    (CONF_POWER_NOW_ENTITY, "options", "Leistung aktuell", "Current power", ("sensor",), POWER_UNITS, False),
    (CONF_DHW_POWER_ENTITY, "options", "Strom Warmwasser", "DHW electricity", ("sensor",), ENERGY_UNITS, False),
    (CONF_DHW_OPERATION_ENTITY, "options", "Warmwasserbetrieb", "DHW operation", ("binary_sensor", "sensor"), None, False),
    (
        CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY,
        "options",
        "Verdichterlaufzeit zusätzlich",
        "Compressor runtime (extra)",
        ("sensor",),
        None,
        False,
    ),
)

SOURCE_FIELDS: list[dict[str, Any]] = [
    {
        "key": key,
        "scope": scope,
        "label": _label(label_de, label_en),
        "domain": list(domains),
        "units": list(units or ()),
        "required": required,
    }
    for key, scope, label_de, label_en, domains, units, required in _SOURCE_DEFS
]

_THRESHOLD_DEFS: tuple[tuple[str, str, str, str, float, float, float, float], ...] = (
    ("flow_deviation_k", "Vorlauf-Abweichung", "Flow deviation", "K", 2.0, 0, 20, 0.5),
    ("starts_per_day", "Starts pro Tag", "Starts per day", "", 12.0, 0, 100, 1),
    ("runtime_minutes", "Laufzeit pro Start", "Runtime per start", "min", 20.0, 0, 240, 1),
    ("pump_idle_share", "Pumpen-Leerlaufanteil", "Pump idle share", "", 0.4, 0, 1, 0.05),
    ("room_deviation_k", "Raum-Abweichung", "Room deviation", "K", 1.0, 0, 10, 0.5),
    ("aux_hours_per_day", "Heizstab-Stunden pro Tag", "Aux heater hours per day", "h", 1.0, 0, 24, 0.5),
    ("defrost_hours_per_day", "Abtau-Stunden pro Tag", "Defrost hours per day", "h", 2.0, 0, 24, 0.5),
    ("cop_curve_deviation", "COP-Abweichung", "COP deviation", "", 0.15, 0, 1, 0.05),
    ("mixer_pulses_per_day", "Mischer-Pulse pro Tag", "Mixer pulses per day", "", 12.0, 0, 200, 1),
    ("power_source_deviation", "Abweichung der Stromquellen", "Power source deviation", "", 0.15, 0, 1, 0.05),
    ("spread_min_k", "Spreizung minimal", "Spread minimum", "K", 3.0, 0, 10, 0.5),
    ("spread_max_k", "Spreizung maximal", "Spread maximum", "K", 8.0, 0, 20, 0.5),
    ("return_temp_max_c", "Rücklauf maximal", "Return maximum", "°C", 45.0, 0, 80, 1),
)

THRESHOLD_FIELDS: list[dict[str, Any]] = [
    {
        "key": key,
        "label": _label(label_de, label_en),
        "unit": unit,
        "default": default,
        "min": minimum,
        "max": maximum,
        "step": step,
    }
    for key, label_de, label_en, unit, default, minimum, maximum, step in _THRESHOLD_DEFS
]


def settings_schema() -> dict[str, Any]:
    """Metadaten für die Einstellungsseite."""
    return {
        "sources": SOURCE_FIELDS,
        "thresholds": THRESHOLD_FIELDS,
        "circuit_types": list(CIRCUIT_TYPES),
        "room_types": list(ROOM_TYPES),
    }


def _check_entity(hass: HomeAssistant, value: Any, units: Sequence[str] | None) -> str | None:
    if value in (None, ""):
        return None
    state = hass.states.get(str(value))
    if state is None:
        return "not_found"
    unit = state.attributes.get("unit_of_measurement")
    if units and unit and unit not in units:
        return "unit"
    return None


def _as_number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None


def _validate_circuits(hass: HomeAssistant, circuits: Any, errors: dict[str, str]) -> set[str]:
    ids: set[str] = set()
    if circuits in (None, ""):
        return ids
    if not isinstance(circuits, list):
        errors[CONF_CIRCUITS] = "format"
        return ids
    for index, circuit in enumerate(circuits):
        prefix = f"{CONF_CIRCUITS}.{index}"
        if not isinstance(circuit, Mapping):
            errors[prefix] = "format"
            continue
        identifier = str(circuit.get(CONF_ID) or "").strip()
        if not identifier:
            errors[f"{prefix}.{CONF_ID}"] = "required"
        elif identifier in ids:
            errors[f"{prefix}.{CONF_ID}"] = "duplicate"
        ids.add(identifier)
        if not str(circuit.get(CONF_NAME) or "").strip():
            errors[f"{prefix}.{CONF_NAME}"] = "required"
        if not circuit.get(CONF_TYPE):
            errors[f"{prefix}.{CONF_TYPE}"] = "required"
        elif circuit.get(CONF_TYPE) not in CIRCUIT_TYPES:
            errors[f"{prefix}.{CONF_TYPE}"] = "option"
        for key in (CONF_TEMPERATURE_ENTITY, CONF_PUMP_ENTITY, CONF_MIXER_OPEN_ENTITY, CONF_MIXER_CLOSE_ENTITY):
            reason = _check_entity(hass, circuit.get(key), TEMPERATURE_UNITS if key == CONF_TEMPERATURE_ENTITY else None)
            if reason:
                errors[f"{prefix}.{key}"] = reason
    return ids


def _validate_rooms(hass: HomeAssistant, rooms: Any, circuit_ids: set[str], errors: dict[str, str]) -> None:
    if rooms in (None, ""):
        return
    if not isinstance(rooms, list):
        errors[CONF_ROOMS] = "format"
        return
    seen: set[str] = set()
    for index, room in enumerate(rooms):
        prefix = f"{CONF_ROOMS}.{index}"
        if not isinstance(room, Mapping):
            errors[prefix] = "format"
            continue
        identifier = str(room.get(CONF_ID) or "").strip()
        if not identifier:
            errors[f"{prefix}.{CONF_ID}"] = "required"
        elif identifier in seen:
            errors[f"{prefix}.{CONF_ID}"] = "duplicate"
        seen.add(identifier)
        if not str(room.get(CONF_NAME) or "").strip():
            errors[f"{prefix}.{CONF_NAME}"] = "required"
        room_type = room.get(CONF_ROOM_TYPE)
        if room_type and room_type not in ROOM_TYPES:
            errors[f"{prefix}.{CONF_ROOM_TYPE}"] = "option"
        circuit = room.get(CONF_CIRCUIT)
        if not circuit:
            errors[f"{prefix}.{CONF_CIRCUIT}"] = "required"
        elif circuit_ids and str(circuit) not in circuit_ids:
            errors[f"{prefix}.{CONF_CIRCUIT}"] = "reference"
        for key in (CONF_CLIMATE_ENTITY, CONF_VALVE_POSITION_ENTITY):
            reason = _check_entity(hass, room.get(key), None)
            if reason:
                errors[f"{prefix}.{key}"] = reason


def _validate_thresholds(thresholds: Any, errors: dict[str, str]) -> None:
    if thresholds in (None, ""):
        return
    if not isinstance(thresholds, Mapping):
        errors[CONF_THRESHOLDS] = "format"
        return
    known = {spec["key"]: spec for spec in THRESHOLD_FIELDS}
    for key, value in thresholds.items():
        if key not in known:
            continue
        spec = known[key]
        number = _as_number(value)
        if number is None:
            errors[f"{CONF_THRESHOLDS}.{key}"] = "number"
        elif number < spec["min"] or number > spec["max"]:
            errors[f"{CONF_THRESHOLDS}.{key}"] = "range"


def validate_config(
    data: Mapping[str, Any],
    options: Mapping[str, Any],
    hass: HomeAssistant,
    previous: Mapping[str, Any] | None = None,
) -> dict[str, str]:
    """Feldbezogene Fehler für Quellen, Kreise, Räume und Schwellen.

    Unveränderte Werte werden nicht erneut geprüft: Eine gerade nicht geladene
    Quelle darf das Speichern anderer Felder nicht blockieren.
    """
    errors: dict[str, str] = {}
    merged = {**data, **options}
    before = dict(previous or {})

    for spec in SOURCE_FIELDS:
        value = merged.get(spec["key"])
        if spec["key"] in before and before[spec["key"]] == value:
            continue
        reason = _check_entity(hass, value, spec["units"] or None)
        if reason:
            errors[spec["key"]] = reason
        elif not value and spec["required"]:
            errors[spec["key"]] = "required"

    circuits = options.get(CONF_CIRCUITS)
    if CONF_CIRCUITS not in before or before[CONF_CIRCUITS] != circuits:
        circuit_ids = _validate_circuits(hass, circuits, errors)
    else:
        circuit_ids = {str(item.get(CONF_ID)) for item in (circuits or []) if isinstance(item, Mapping)}
    rooms = options.get(CONF_ROOMS)
    if CONF_ROOMS not in before or before[CONF_ROOMS] != rooms:
        _validate_rooms(hass, rooms, circuit_ids, errors)
    thresholds = options.get(CONF_THRESHOLDS)
    if CONF_THRESHOLDS not in before or before[CONF_THRESHOLDS] != thresholds:
        _validate_thresholds(thresholds, errors)

    for key in (CONF_ENERGY_PRICE, CONF_CO2_FACTOR):
        value = merged.get(key)
        if value in (None, ""):
            continue
        number = _as_number(value)
        if number is None:
            errors[key] = "number"
        elif number < 0:
            errors[key] = "range"

    return errors


def coverage(data: Mapping[str, Any], options: Mapping[str, Any]) -> dict[str, int]:
    """Wie viele Pflicht- und Quellfelder belegt sind (für die Anzeige)."""
    merged = {**data, **options}
    required = [spec for spec in SOURCE_FIELDS if spec["required"]]
    filled_required = sum(1 for spec in required if merged.get(spec["key"]))
    filled_optional = sum(1 for spec in SOURCE_FIELDS if not spec["required"] and merged.get(spec["key"]))
    return {
        "required": len(required),
        "required_filled": filled_required,
        "optional": len(SOURCE_FIELDS) - len(required),
        "optional_filled": filled_optional,
        "mandatory_known": len(MANDATORY_SOURCES),
        "optional_known": len(OPTIONAL_SOURCES),
    }


__all__ = [
    "SOURCE_FIELDS",
    "THRESHOLD_FIELDS",
    "coverage",
    "settings_schema",
    "validate_config",
]
