"""Diagnose enthält alle Abschnitte, ist aber von persönlichen Daten geschwärzt."""

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


async def test_diagnostics_has_all_sections(hass: HomeAssistant) -> None:
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

    for key in (
        "version",
        "versions",
        "config",
        "source_checks",
        "metrics",
        "summary",
        "series_31",
        "cop_bins",
        "curve_bins",
        "flow_hours",
        "rooms_detail",
        "circuits_detail",
        "storage",
        "runtime",
        "log",
        "trace",
    ):
        assert key in result, key

    assert result["versions"]["integration"]
    assert result["versions"]["card"]["backend"] == result["versions"]["integration"]
    assert result["sources"]["power_entity"] == "sensor"
    assert result["thresholds"]["flow_deviation_k"] == 2.0
    assert isinstance(result["source_checks"], list)


async def test_diagnostics_redacts_personal_data(hass: HomeAssistant) -> None:
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
    text = str(result).lower()

    for forbidden in ("latitude", "longitude", "email", "token", "password", "api_key", "person."):
        assert forbidden not in text, forbidden
