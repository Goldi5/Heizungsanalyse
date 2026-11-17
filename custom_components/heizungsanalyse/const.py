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

# Dashboard
CARD_URL: Final = "/heizungsanalyse_static/heizungsanalyse-card.js"
# Home Assistant verlangt einen Bindestrich im Pfad eines Dashboards
DASHBOARD_PATH: Final = "heizungs-analyse"
DASHBOARD_ICON: Final = "mdi:heat-pump"

# Aktualisierung und Auswertungsfenster
UPDATE_INTERVAL_MINUTES: Final = 5
HISTORY_DAYS: Final = 31
# Zustandsverlauf für Binärsensoren (Recorder hält ihn standardmäßig 10 Tage)
HISTORY_ONOFF_DAYS: Final = 10
HISTORY_REFRESH_MINUTES: Final = 30
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

# Raum- und Kreisanalyse
SENSOR_ROOM_DEVIATION: Final = "room_deviation"
SENSOR_ROOM_HEATING_UP: Final = "room_heating_up"
SENSOR_PUMP_IDLE: Final = "pump_idle_share"
SENSOR_MIXER_PULSES: Final = "mixer_pulses"
SENSOR_ROOM_RANKING: Final = "room_ranking"
SENSOR_FINDINGS: Final = "findings"

ROOM_WINDOW_DAYS: Final = 7
ROOM_TOLERANCE: Final = 1.0
# Soll darunter gilt als Frostschutz/aus – solche Stichproben zählen nicht
ROOM_MIN_TARGET: Final = 10.0
HEATING_UP_TRIGGER: Final = 0.3
HEATING_UP_TOLERANCE: Final = 0.5
HEATING_UP_MAX_MINUTES: Final = 360
MIXER_RESOLUTION_MINUTES: Final = UPDATE_INTERVAL_MINUTES

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

# Wärmepumpen-Hydraulik und Warmwasser-Strom (0.4.0)
CONF_HP_FLOW_ENTITY: Final = "hp_flow_entity"
CONF_VOLUME_FLOW_ENTITY: Final = "volume_flow_entity"
CONF_POWER_NOW_ENTITY: Final = "power_now_entity"
CONF_DHW_POWER_ENTITY: Final = "dhw_power_entity"
CONF_DHW_OPERATION_ENTITY: Final = "dhw_operation_entity"
CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY: Final = "compressor_runtime_extra_entity"

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
    CONF_HP_FLOW_ENTITY,
    CONF_VOLUME_FLOW_ENTITY,
    CONF_POWER_NOW_ENTITY,
    CONF_DHW_POWER_ENTITY,
    CONF_DHW_OPERATION_ENTITY,
    CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY,
)

# --- Heizkreise und Räume -------------------------------------------------------
CONF_CIRCUITS: Final = "circuits"
CONF_ROOMS: Final = "rooms"

CONF_NAME: Final = "name"
CONF_ID: Final = "id"
CONF_TYPE: Final = "type"
CONF_TEMPERATURE_ENTITY: Final = "temperature_entity"
CONF_ENERGY_PRICE: Final = "energy_price_eur_per_kwh"
CONF_CO2_FACTOR: Final = "co2_kg_per_kwh"
CONF_PUMP_ENTITY: Final = "pump_entity"
CONF_MIXER_OPEN_ENTITY: Final = "mixer_open_entity"
CONF_MIXER_CLOSE_ENTITY: Final = "mixer_close_entity"
CONF_CIRCUIT: Final = "circuit"
CONF_CLIMATE_ENTITY: Final = "climate_entity"
CONF_VALVE_POSITION_ENTITY: Final = "valve_position_entity"
CONF_ROOM_TYPE: Final = "room_type"

CIRCUIT_TYPES: Final = ("buffer", "radiators", "underfloor", "dhw")

# --- Inventar und Dienste --------------------------------------------------------
INVENTORY_FIELDS: Final = {
    "pumps": ("manufacturer", "model", "control_mode", "setting", "power_w", "notes"),
    "thermostats": ("model", "valve_preset", "room", "notes"),
    "hydraulics": ("buffer_volume_l", "hydraulic_separator", "bypass_valve", "pump_stage", "mixer_setting", "notes"),
    "radiators": ("circuit", "room", "valve_preset", "nominal_flow_l_min", "measured_flow_l_min", "measured_spread_k", "notes"),
}

SERVICE_UPDATE_INVENTORY: Final = "update_inventory"
SERVICE_LOG_CHANGE: Final = "log_change"
SERVICE_COMPARE_PERIODS: Final = "compare_periods"
SERVICE_EXPORT_REPORT: Final = "export_report"
SERVICE_EXPORT_PLANT_SHEET: Final = "export_plant_sheet"
SERVICE_SUGGEST_HEATING_CURVE: Final = "suggest_heating_curve"
SERVICE_REFRESH: Final = "refresh"

CONF_THRESHOLDS: Final = "thresholds"

EVENT_INVENTORY_CHANGED: Final = f"{DOMAIN}_inventory_changed"
EVENT_PERIOD_COMPARISON: Final = f"{DOMAIN}_period_comparison"
EVENT_FINDINGS: Final = f"{DOMAIN}_findings"
EVENT_ALERT: Final = f"{DOMAIN}_alert"

DEFAULT_COMPARE_DAYS: Final = 14
REPORT_CHANGE_LIMIT: Final = 20


ROOM_TYPES: Final = ("living", "kitchen", "bedroom", "bathroom", "office", "hallway", "guest", "child", "utility")
ROOM_TYPE_TARGETS: Final = {
    "living": (20.0, 17.0, 23.0),
    "kitchen": (19.0, 16.0, 22.0),
    "bedroom": (17.0, 15.0, 20.0),
    "bathroom": (22.0, 19.0, 24.0),
    "office": (20.0, 17.0, 23.0),
    "hallway": (18.0, 15.0, 21.0),
    "guest": (18.0, 16.0, 21.0),
    "child": (20.0, 18.0, 23.0),
    "utility": (17.0, 15.0, 20.0),
}
