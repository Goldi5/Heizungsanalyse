"""Einrichtung über die Benutzeroberfläche."""

from __future__ import annotations

from homeassistant import config_entries, data_entry_flow
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.heizungsanalyse.const import (
    CONF_CIRCUIT,
    CONF_CIRCUITS,
    CONF_CLIMATE_ENTITY,
    CONF_COMPRESSOR_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_NAME,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_ROOMS,
    CONF_THRESHOLDS,
    CONF_TYPE,
    DOMAIN,
    NAME,
)

MANDATORY = {
    CONF_POWER_ENTITY: "sensor.wp_strom",
    CONF_HEAT_ENTITY: "sensor.wp_waerme",
    CONF_OUTDOOR_ENTITY: "sensor.aussentemperatur",
    CONF_COMPRESSOR_ENTITY: "binary_sensor.verdichter",
}

ENERGY = {"unit_of_measurement": "kWh", "device_class": "energy", "state_class": "total_increasing"}
TEMPERATURE = {"unit_of_measurement": "°C", "device_class": "temperature", "state_class": "measurement"}


def _seed_sources(hass: HomeAssistant) -> None:
    hass.states.async_set("sensor.wp_strom", "1000.0", ENERGY)
    hass.states.async_set("sensor.wp_waerme", "3000.0", ENERGY)
    hass.states.async_set("sensor.aussentemperatur", "6.2", TEMPERATURE)
    hass.states.async_set("binary_sensor.verdichter", "on")
    hass.states.async_set("sensor.hk2_temperatur", "34.5", TEMPERATURE)
    hass.states.async_set("binary_sensor.hk2_pumpe", "on")
    hass.states.async_set("climate.arbeitszimmer", "heat", {"current_temperature": 20.4, "temperature": 21.0})
    hass.states.async_set("sensor.ventilposition", "37", {"unit_of_measurement": "%"})


async def test_user_flow_creates_entry(hass: HomeAssistant) -> None:
    """Der Benutzerflow speichert die Pflichtquellen."""
    _seed_sources(hass)

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is data_entry_flow.FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(result["flow_id"], user_input=MANDATORY)

    assert result["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY
    assert result["title"] == NAME
    assert result["data"] == MANDATORY


async def test_wrong_unit_is_rejected(hass: HomeAssistant) -> None:
    """Eine Temperatur als Stromquelle wird mit wrong_unit abgelehnt."""
    _seed_sources(hass)

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        user_input={**MANDATORY, CONF_POWER_ENTITY: "sensor.aussentemperatur"},
    )

    assert result["type"] is data_entry_flow.FlowResultType.FORM
    assert result["errors"] == {CONF_POWER_ENTITY: "wrong_unit"}


async def test_unavailable_source_is_rejected(hass: HomeAssistant) -> None:
    """Eine nicht verfügbare Quelle wird abgelehnt."""
    _seed_sources(hass)
    hass.states.async_set("sensor.wp_strom", "unavailable", ENERGY)

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], user_input=MANDATORY)

    assert result["type"] is data_entry_flow.FlowResultType.FORM
    assert result["errors"] == {CONF_POWER_ENTITY: "unavailable"}


async def test_second_instance_is_rejected(hass: HomeAssistant) -> None:
    """Es gibt nur eine Analyse je Anlage."""
    _seed_sources(hass)
    MockConfigEntry(domain=DOMAIN, data=MANDATORY, unique_id=DOMAIN).add_to_hass(hass)

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})

    assert result["type"] is data_entry_flow.FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_options_flow_adds_circuit_and_room(hass: HomeAssistant) -> None:
    """Kreise und Räume werden im Optionsdialog angelegt und gespeichert."""
    _seed_sources(hass)
    entry = MockConfigEntry(domain=DOMAIN, data=MANDATORY, unique_id=DOMAIN)
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is data_entry_flow.FlowResultType.MENU
    assert "add_room" not in result["menu_options"]

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "add_circuit"},
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            CONF_NAME: "Heizkreis oben",
            CONF_TYPE: "radiators",
            "temperature_entity": "sensor.hk2_temperatur",
            "pump_entity": "binary_sensor.hk2_pumpe",
        },
    )
    assert result["type"] is data_entry_flow.FlowResultType.MENU
    assert "add_room" in result["menu_options"]

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "add_room"},
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            CONF_NAME: "Arbeitszimmer",
            CONF_CIRCUIT: "heizkreis_oben",
            CONF_CLIMATE_ENTITY: "climate.arbeitszimmer",
        },
    )
    assert result["type"] is data_entry_flow.FlowResultType.MENU

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "save"},
    )
    assert result["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY

    circuits = entry.options[CONF_CIRCUITS]
    assert circuits[0]["id"] == "heizkreis_oben"
    assert circuits[0]["temperature_entity"] == "sensor.hk2_temperatur"

    rooms = entry.options[CONF_ROOMS]
    assert rooms[0]["id"] == "arbeitszimmer"
    assert rooms[0][CONF_CIRCUIT] == "heizkreis_oben"


async def test_room_without_thermostat_is_allowed(hass: HomeAssistant) -> None:
    """Räume ohne Climate-Entity (Livisi-Schlafzimmer) sind zulässig."""
    _seed_sources(hass)
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=MANDATORY,
        unique_id=DOMAIN,
        options={
            CONF_CIRCUITS: [{"id": "hk3", "name": "Heizkreis unten", "type": "underfloor"}],
        },
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "add_room"},
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={CONF_NAME: "Schlafzimmer", CONF_CIRCUIT: "hk3"},
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "save"},
    )

    assert result["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY
    assert entry.options[CONF_ROOMS][0][CONF_CLIMATE_ENTITY] is None


async def test_duplicate_room_name_is_rejected(hass: HomeAssistant) -> None:
    """Namen werden ohne Rücksicht auf Gross-/Kleinschreibung geprüft."""
    _seed_sources(hass)
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=MANDATORY,
        unique_id=DOMAIN,
        options={
            CONF_CIRCUITS: [{"id": "hk2", "name": "Oben", "type": "radiators"}],
            CONF_ROOMS: [{"id": "bad", "name": "Bad", "circuit": "hk2"}],
        },
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "add_room"},
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={CONF_NAME: "bad", CONF_CIRCUIT: "hk2"},
    )

    assert result["type"] is data_entry_flow.FlowResultType.FORM
    assert result["errors"] == {CONF_NAME: "duplicate_name"}


async def test_circuit_in_use_cannot_be_removed(hass: HomeAssistant) -> None:
    """Ein Kreis mit Räumen lässt sich nicht entfernen."""
    _seed_sources(hass)
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=MANDATORY,
        unique_id=DOMAIN,
        options={
            CONF_CIRCUITS: [
                {"id": "hk2", "name": "Oben", "type": "radiators"},
                {"id": "hk3", "name": "Unten", "type": "underfloor"},
            ],
            CONF_ROOMS: [{"id": "bad", "name": "Bad", "circuit": "hk2"}],
        },
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "remove_circuit"},
    )
    result = await hass.config_entries.options.async_configure(result["flow_id"], user_input={CONF_CIRCUIT: "hk2"})

    assert result["type"] is data_entry_flow.FlowResultType.FORM
    assert result["errors"] == {CONF_CIRCUIT: "circuit_in_use"}


async def test_options_flow_sets_thresholds(hass: HomeAssistant) -> None:
    """Schwellen der Findings lassen sich im Optionsdialog ändern."""
    _seed_sources(hass)
    entry = MockConfigEntry(domain=DOMAIN, data=MANDATORY, unique_id=DOMAIN)
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert "thresholds" in result["menu_options"]

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "thresholds"},
    )
    assert result["type"] is data_entry_flow.FlowResultType.FORM
    assert result["step_id"] == "thresholds"

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            "flow_deviation_k": 3,
            "starts_per_day": 20,
            "runtime_minutes": 20,
            "pump_idle_share": 0.4,
            "room_deviation_k": 1,
            "aux_hours_per_day": 1,
            "defrost_hours_per_day": 2,
            "cop_curve_deviation": 0.15,
            "mixer_pulses_per_day": 12,
            "power_source_deviation": 0.15,
        },
    )
    assert result["type"] is data_entry_flow.FlowResultType.MENU

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={"next_step_id": "save"},
    )
    assert result["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY

    assert entry.options[CONF_THRESHOLDS]["flow_deviation_k"] == 3.0
    assert entry.options[CONF_THRESHOLDS]["mixer_pulses_per_day"] == 12.0
