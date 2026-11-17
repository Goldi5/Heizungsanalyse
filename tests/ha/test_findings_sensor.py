"""Findings-Sensor und Ereignis."""

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
    DOMAIN,
    EVENT_FINDINGS,
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
        }
    ]
}


def _daily() -> dict[str, list[DayValue]]:
    start = date(2026, 11, 3)
    days = [start + timedelta(days=offset) for offset in range(14)]
    return {
        MANDATORY[CONF_HEAT_ENTITY]: [DayValue(day=day, change=80.0) for day in days],
        MANDATORY[CONF_POWER_ENTITY]: [DayValue(day=day, change=25.0) for day in days],
        MANDATORY[CONF_OUTDOOR_ENTITY]: [DayValue(day=day, mean=6.0) for day in days],
    }


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    hass.states.async_set("binary_sensor.verdichter", "off")
    hass.states.async_set("binary_sensor.pumpe_hk2", "on")
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


async def test_findings_sensor_reports_pump_idle(hass: HomeAssistant) -> None:
    entry = await _setup(hass)

    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_findings")
    state = hass.states.get(entity_id)

    assert state.state == "1"
    assert state.attributes["warning_count"] == 1
    finding = state.attributes["findings"][0]
    assert finding["id"] == "F03"
    assert "Heizkreis oben" in finding["text"]
    assert "thresholds" in state.attributes


async def test_findings_event_on_change(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    events: list = []
    unsub = hass.bus.async_listen(EVENT_FINDINGS, events.append)

    hass.states.async_set("binary_sensor.verdichter", "on")
    await _refresh(hass, entry)
    await hass.async_block_till_done()
    unsub()

    assert events
    assert events[-1].data["count"] == 1
    assert events[-1].data["findings"][0]["id"] == "F03"


async def test_findings_text_follows_language(hass: HomeAssistant) -> None:
    hass.config.language = "en"
    entry = await _setup(hass)

    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_findings")
    finding = hass.states.get(entity_id).attributes["findings"][0]

    assert "pump in Heizkreis oben runs" in finding["text"]
