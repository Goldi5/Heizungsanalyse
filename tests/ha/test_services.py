"""Dienste: Inventar, Aenderungsverlauf, Zeitraumvergleich, Bericht."""

from __future__ import annotations

from datetime import date, timedelta
from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.heizungsanalyse.analysis.types import DayValue
from custom_components.heizungsanalyse.const import (
    CONF_COMPRESSOR_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    DOMAIN,
    EVENT_INVENTORY_CHANGED,
    EVENT_PERIOD_COMPARISON,
)

MANDATORY = {
    CONF_POWER_ENTITY: "sensor.wp_strom",
    CONF_HEAT_ENTITY: "sensor.wp_waerme",
    CONF_OUTDOOR_ENTITY: "sensor.aussentemperatur",
    CONF_COMPRESSOR_ENTITY: "binary_sensor.verdichter",
}

START = date(2026, 11, 3)


def _daily() -> dict[str, list[DayValue]]:
    days = [START + timedelta(days=offset) for offset in range(14)]
    return {
        MANDATORY[CONF_HEAT_ENTITY]: [DayValue(day=day, change=80.0 + offset) for offset, day in enumerate(days)],
        MANDATORY[CONF_POWER_ENTITY]: [DayValue(day=day, change=25.0) for day in days],
        MANDATORY[CONF_OUTDOOR_ENTITY]: [DayValue(day=day, mean=6.0) for day in days],
    }


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, data=MANDATORY, unique_id=DOMAIN)
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


async def test_update_inventory_writes_and_logs(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    events: list = []
    unsub = hass.bus.async_listen(EVENT_INVENTORY_CHANGED, events.append)

    response = await hass.services.async_call(
        DOMAIN,
        "update_inventory",
        {"object": "pumps.hk2", "values": {"manufacturer": "Test", "setting": "Stufe 2"}, "note": "Test"},
        blocking=True,
        return_response=True,
    )
    await hass.async_block_till_done()
    unsub()

    assert response["changed"] == 2
    inventory = await entry.runtime_data.store.async_inventory()
    assert inventory["pumps"]["hk2"]["manufacturer"] == "Test"
    assert len(events) == 1
    assert len(events[0].data["changes"]) == 2


async def test_update_inventory_rejects_unknown_field(hass: HomeAssistant) -> None:
    await _setup(hass)

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            "update_inventory",
            {"object": "pumps.hk2", "values": {"erfunden": 1}},
            blocking=True,
            return_response=True,
        )


async def test_update_inventory_rejects_unknown_section(hass: HomeAssistant) -> None:
    await _setup(hass)

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            "update_inventory",
            {"object": "boiler.hk2", "values": {"setting": "1"}},
            blocking=True,
            return_response=True,
        )


async def test_log_change_is_recorded(hass: HomeAssistant) -> None:
    entry = await _setup(hass)

    response = await hass.services.async_call(
        DOMAIN,
        "log_change",
        {"object": "pumps.hk2", "field": "setting", "old_value": "Stufe 1", "new_value": "Stufe 2"},
        blocking=True,
        return_response=True,
    )

    assert response["change"]["new"] == "Stufe 2"
    log = await entry.runtime_data.store.async_change_log()
    assert log[0]["field"] == "setting"


async def test_compare_periods_returns_both_windows(hass: HomeAssistant) -> None:
    await _setup(hass)
    events: list = []
    unsub = hass.bus.async_listen(EVENT_PERIOD_COMPARISON, events.append)

    response = await hass.services.async_call(
        DOMAIN,
        "compare_periods",
        {"days": 7, "change_time": "2026-11-10T12:00:00+00:00"},
        blocking=True,
        return_response=True,
    )
    await hass.async_block_till_done()
    unsub()

    comparison = response["comparison"]
    assert comparison["window_days"] == 7
    assert comparison["before"]["days"] + comparison["after"]["days"] == 14
    assert comparison["before"]["cop"] is not None
    assert events and events[0].data["window_days"] == 7


async def test_compare_periods_without_data_raises(hass: HomeAssistant) -> None:
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

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            "compare_periods",
            {"days": 7},
            blocking=True,
            return_response=True,
        )


async def test_export_report_markdown(hass: HomeAssistant) -> None:
    await _setup(hass)

    response = await hass.services.async_call(
        DOMAIN,
        "export_report",
        {"format": "markdown"},
        blocking=True,
        return_response=True,
    )

    assert response["format"] == "markdown"
    assert "# Heizungsanalyse" in response["report"]
    assert "## Kennzahlen" in response["report"]


async def test_export_report_json(hass: HomeAssistant) -> None:
    import json

    await _setup(hass)

    response = await hass.services.async_call(
        DOMAIN,
        "export_report",
        {"format": "json"},
        blocking=True,
        return_response=True,
    )

    data = json.loads(response["report"])
    assert data["metrics"]["cop"] is not None


async def test_services_require_entry(hass: HomeAssistant) -> None:
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            "export_report",
            {},
            blocking=True,
            return_response=True,
        )
