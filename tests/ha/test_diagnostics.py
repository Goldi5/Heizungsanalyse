"""Diagnose bleibt anonym."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.heizungsanalyse.const import (
    CONF_COMPRESSOR_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    DOMAIN,
)
from custom_components.heizungsanalyse.diagnostics import async_get_config_entry_diagnostics

MANDATORY = {
    CONF_POWER_ENTITY: "sensor.wp_strom",
    CONF_HEAT_ENTITY: "sensor.wp_waerme",
    CONF_OUTDOOR_ENTITY: "sensor.aussentemperatur",
    CONF_COMPRESSOR_ENTITY: "binary_sensor.verdichter",
}


async def test_diagnostics_contains_no_entity_ids(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data=MANDATORY, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    with (
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_daily",
            new=AsyncMock(return_value={}),
        ),
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_hourly",
            new=AsyncMock(return_value={}),
        ),
    ):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    result = await async_get_config_entry_diagnostics(hass, entry)
    text = str(result)

    assert result["version"]
    assert result["sources"]["power"] == "sensor"
    assert result["thresholds"]["flow_deviation_k"] == 5.0
    assert "wp_strom" not in text
    assert "verdichter" not in text
    for forbidden in ("sensor.", "binary_sensor.", "climate."):
        assert forbidden not in text
