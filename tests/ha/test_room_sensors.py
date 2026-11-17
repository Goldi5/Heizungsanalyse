"""Raum- und Kreissensoren mit echten Zuständen."""

from __future__ import annotations

from datetime import date, timedelta
from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.heizungsanalyse.analysis.types import DayValue
from custom_components.heizungsanalyse.const import (
    CONF_CIRCUITS,
    CONF_COMPRESSOR_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_ROOMS,
    DOMAIN,
)

MANDATORY = {
    CONF_POWER_ENTITY: "sensor.wp_strom",
    CONF_HEAT_ENTITY: "sensor.wp_waerme",
    CONF_OUTDOOR_ENTITY: "sensor.aussentemperatur",
    CONF_COMPRESSOR_ENTITY: "binary_sensor.verdichter",
}

OPTIONS = {
    CONF_CIRCUITS: [
        {
            "id": "hk2",
            "name": "Heizkreis oben",
            "type": "radiators",
            "pump_entity": "binary_sensor.pumpe_hk2",
            "mixer_open_entity": "binary_sensor.mischer_auf_hk2",
            "mixer_close_entity": "binary_sensor.mischer_zu_hk2",
        },
        {"id": "hk1", "name": "Puffer", "type": "buffer"},
    ],
    CONF_ROOMS: [
        {
            "id": "az",
            "name": "Arbeitszimmer",
            "circuit": "hk2",
            "climate_entity": "climate.arbeitszimmer",
            "valve_position_entity": "sensor.ventil_az",
        },
        {"id": "bad", "name": "Bad", "circuit": "hk2", "climate_entity": "climate.bad"},
        {"id": "schlafen", "name": "Schlafzimmer", "circuit": "hk3"},
    ],
}


def _daily() -> dict[str, list[DayValue]]:
    start = date(2026, 11, 3)
    days = [start + timedelta(days=offset) for offset in range(14)]
    return {
        MANDATORY[CONF_HEAT_ENTITY]: [DayValue(day=day, change=80.0) for day in days],
        MANDATORY[CONF_POWER_ENTITY]: [DayValue(day=day, change=25.0) for day in days],
        MANDATORY[CONF_OUTDOOR_ENTITY]: [DayValue(day=day, mean=6.0) for day in days],
    }


def _set_states(hass: HomeAssistant, *, bad: bool = True) -> None:
    hass.states.async_set(
        "climate.arbeitszimmer",
        "heat",
        {"current_temperature": 19.5, "temperature": 21.0},
    )
    if bad:
        hass.states.async_set("climate.bad", "heat", {"current_temperature": 22.5, "temperature": 21.0})
    hass.states.async_set("sensor.ventil_az", "40")
    hass.states.async_set("binary_sensor.verdichter", "on")
    hass.states.async_set("binary_sensor.pumpe_hk2", "on")
    hass.states.async_set("binary_sensor.mischer_auf_hk2", "off")
    hass.states.async_set("binary_sensor.mischer_zu_hk2", "off")


async def _setup(hass: HomeAssistant, *, bad: bool = True) -> MockConfigEntry:
    _set_states(hass, bad=bad)
    entry = MockConfigEntry(domain=DOMAIN, data=MANDATORY, options=OPTIONS, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    with (
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_daily",
            new=AsyncMock(return_value=_daily()),
        ),
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_hourly",
            new=AsyncMock(return_value={}),
        ),
    ):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    return entry


def _entity_id(hass: HomeAssistant, entry: MockConfigEntry, key: str) -> str | None:
    registry = er.async_get(hass)
    return registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_{key}")


async def _refresh(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    with (
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_daily",
            new=AsyncMock(return_value=_daily()),
        ),
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_hourly",
            new=AsyncMock(return_value={}),
        ),
    ):
        await entry.runtime_data.coordinator.async_refresh()
        await hass.async_block_till_done()


async def test_room_and_circuit_sensors(hass: HomeAssistant) -> None:
    entry = await _setup(hass)

    az_id = _entity_id(hass, entry, "room_az_room_deviation")
    bad_id = _entity_id(hass, entry, "room_bad_room_deviation")
    assert az_id and bad_id

    az = hass.states.get(az_id)
    assert az.state == "-1.5"
    assert az.attributes["valve_available"] is True
    assert az.attributes["under_share"] == 1.0

    bad = hass.states.get(bad_id)
    assert bad.state == "1.5"
    assert bad.attributes["valve_available"] is False

    assert _entity_id(hass, entry, "room_schlafen_room_deviation") is None

    pump_id = _entity_id(hass, entry, "circuit_hk2_pump_idle_share")
    assert pump_id
    assert hass.states.get(pump_id).state == "0.0"

    mixer_id = _entity_id(hass, entry, "circuit_hk2_mixer_pulses")
    assert mixer_id
    assert hass.states.get(mixer_id).state == "0.0"

    assert _entity_id(hass, entry, "circuit_hk1_pump_idle_share") is None

    ranking_id = _entity_id(hass, entry, "room_ranking")
    ranking = hass.states.get(ranking_id)
    assert ranking.state == "2"
    assert [row["room_id"] for row in ranking.attributes["rooms"]] == ["az", "bad"]
    assert ranking.attributes["by_circuit"]["hk2"]["median"] == 0.0


async def test_pump_idle_and_mixer_pulses_after_refresh(hass: HomeAssistant) -> None:
    entry = await _setup(hass)

    hass.states.async_set("binary_sensor.verdichter", "off")
    hass.states.async_set("binary_sensor.mischer_auf_hk2", "on")
    await _refresh(hass, entry)

    pump_id = _entity_id(hass, entry, "circuit_hk2_pump_idle_share")
    assert hass.states.get(pump_id).state == "50.0"
    assert hass.states.get(pump_id).attributes["idle_minutes"] == 5.0

    mixer_id = _entity_id(hass, entry, "circuit_hk2_mixer_pulses")
    mixer = hass.states.get(mixer_id)
    assert mixer.state == "1.0"
    assert mixer.attributes["resolution_minutes"] == 5


async def test_room_without_state_stays_unknown(hass: HomeAssistant) -> None:
    entry = await _setup(hass, bad=False)

    bad_id = _entity_id(hass, entry, "room_bad_room_deviation")
    assert hass.states.get(bad_id).state == "unknown"
    assert hass.states.get(bad_id).attributes["samples"] == 0
