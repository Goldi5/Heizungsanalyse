"""Konstanten der Integration. Bewusst frei von Logik und HA-Aufrufen."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Final


def _read_version() -> str:
    """Version aus der manifest.json neben diesem Modul."""
    try:
        raw = (Path(__file__).parent / "manifest.json").read_text(encoding="utf-8")
        return str(json.loads(raw).get("version") or "0")
    except (OSError, ValueError):  # pragma: no cover - nur bei kaputter Installation
        return "0"


DOMAIN: Final = "heizungsanalyse"
NAME: Final = "Heizungsanalyse"
VERSION: Final = _read_version()

PLATFORMS: Final[list[str]] = ["sensor"]

# Aktualisierung und Auswertungsfenster
UPDATE_INTERVAL_MINUTES: Final = 5
HISTORY_DAYS: Final = 31
DEVIATION_DAYS: Final = 7
COP_SHORT_DAYS: Final = 7
COP_LONG_DAYS: Final = 30

# Kennzahlen (Sensor-Keys / translation_key)
SENSOR_COP_SHORT: Final = "cop_7_days"
SENSOR_COP_LONG: Final = "cop_30_days"
SENSOR_STARTS_PER_DAY: Final = "starts_per_day"
SENSOR_RUNTIME_PER_CYCLE: Final = "runtime_per_cycle"
SENSOR_FLOW_DEVIATION: Final = "flow_deviation"
SENSOR_DATA_DAYS: Final = "data_days"

# Stromquellen-Kennzeichnung
POWER_SOURCE_PRIMARY: Final = "primary"
POWER_SOURCE_FALLBACK: Final = "fallback"

# --- Pflichtquellen (entry.data) -------------------------------------------------
CONF_POWER_ENTITY: Final = "power_entity"
CONF_HEAT_ENTITY: Final = "heat_entity"
CONF_OUTDOOR_ENTITY: Final = "outdoor_entity"
CONF_COMPRESSOR_ENTITY: Final = "compressor_entity"

MANDATORY_SOURCES: Final = (
    CONF_POWER_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_COMPRESSOR_ENTITY,
)

# --- Optionale Quellen (entry.options) -------------------------------------------
CONF_POWER_FALLBACK_ENTITY: Final = "power_fallback_entity"
CONF_DHW_HEAT_ENTITY: Final = "dhw_heat_entity"
CONF_FLOW_ENTITY: Final = "flow_entity"
CONF_TARGET_FLOW_ENTITY: Final = "target_flow_entity"
CONF_RETURN_ENTITY: Final = "return_entity"
CONF_BUFFER_ENTITY: Final = "buffer_entity"
CONF_DEFROST_ENTITY: Final = "defrost_entity"
CONF_AUX_HEATER_ENTITY: Final = "aux_heater_entity"
CONF_COMPRESSOR_STARTS_ENTITY: Final = "compressor_starts_entity"
CONF_COMPRESSOR_RUNTIME_ENTITY: Final = "compressor_runtime_entity"

OPTIONAL_SOURCES: Final = (
    CONF_POWER_FALLBACK_ENTITY,
    CONF_DHW_HEAT_ENTITY,
    CONF_FLOW_ENTITY,
    CONF_TARGET_FLOW_ENTITY,
    CONF_RETURN_ENTITY,
    CONF_BUFFER_ENTITY,
    CONF_DEFROST_ENTITY,
    CONF_AUX_HEATER_ENTITY,
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_COMPRESSOR_RUNTIME_ENTITY,
)

# --- Heizkreise und Raeume -------------------------------------------------------
CONF_CIRCUITS: Final = "circuits"
CONF_ROOMS: Final = "rooms"

CONF_NAME: Final = "name"
CONF_ID: Final = "id"
CONF_TYPE: Final = "type"
CONF_TEMPERATURE_ENTITY: Final = "temperature_entity"
CONF_PUMP_ENTITY: Final = "pump_entity"
CONF_MIXER_OPEN_ENTITY: Final = "mixer_open_entity"
CONF_MIXER_CLOSE_ENTITY: Final = "mixer_close_entity"
CONF_CIRCUIT: Final = "circuit"
CONF_CLIMATE_ENTITY: Final = "climate_entity"
CONF_VALVE_POSITION_ENTITY: Final = "valve_position_entity"

CIRCUIT_TYPES: Final = ("buffer", "radiators", "underfloor", "dhw")

# --- Inventar und Dienste --------------------------------------------------------
INVENTORY_FIELDS: Final = {
    "pumps": ("manufacturer", "model", "control_mode", "setting", "power_w", "notes"),
    "thermostats": ("model", "valve_preset", "room", "notes"),
    "hydraulics": ("buffer_volume_l", "hydraulic_separator", "bypass_valve", "notes"),
}

SERVICE_UPDATE_INVENTORY: Final = "update_inventory"
SERVICE_LOG_CHANGE: Final = "log_change"
SERVICE_COMPARE_PERIODS: Final = "compare_periods"
SERVICE_EXPORT_REPORT: Final = "export_report"

EVENT_INVENTORY_CHANGED: Final = f"{DOMAIN}_inventory_changed"
EVENT_PERIOD_COMPARISON: Final = f"{DOMAIN}_period_comparison"

DEFAULT_COMPARE_DAYS: Final = 14
REPORT_CHANGE_LIMIT: Final = 20
