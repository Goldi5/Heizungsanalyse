"""Sensoren mit den anonymisierten Referenzdaten."""

from __future__ import annotations

from datetime import date
import json
from pathlib import Path
from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.heizungsanalyse.analysis.types import DayValue
from custom_components.heizungsanalyse.const import (
    CONF_COMPRESSOR_ENTITY,
    CONF_COMPRESSOR_RUNTIME_ENTITY,
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_POWER_FALLBACK_ENTITY,
    DOMAIN,
)

FIXTURE = Path(__file__).parent.parent / "fixtures" / "reference_14_days.json"

MANDATORY = {
    CONF_POWER_ENTITY: "sensor.wp_strom",
    CONF_HEAT_ENTITY: "sensor.wp_waerme",
    CONF_OUTDOOR_ENTITY: "sensor.aussentemperatur",
    CONF_COMPRESSOR_ENTITY: "binary_sensor.verdichter",
}


def _daily() -> dict[str, list[DayValue]]:
    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    days = data["days"]
    return {
        MANDATORY[CONF_HEAT_ENTITY]: [DayValue(day=date.fromisoformat(item["day"]), change=item["heat_kwh"]) for item in days],
        MANDATORY[CONF_POWER_ENTITY]: [DayValue(day=date.fromisoformat(item["day"]), change=item["power_kwh"]) for item in days],
        MANDATORY[CONF_OUTDOOR_ENTITY]: [DayValue(day=date.fromisoformat(item["day"]), mean=item["outdoor_c"]) for item in days],
        "sensor.verdichter_starts": _cumulative(days, "starts"),
        "sensor.verdichter_laufzeit": _cumulative(days, "runtime_h"),
    }


def _cumulative(days: list[dict], key: str) -> list[DayValue]:
    """Zaehlerstaende statt Tageswerte, wie sie der Recorder liefert."""
    total = 0.0
    values: list[DayValue] = []
    for item in days:
        total += item[key]
        values.append(DayValue(day=date.fromisoformat(item["day"]), state=total))
    return values


def _entity_id(hass: HomeAssistant, entry: MockConfigEntry, key: str) -> str | None:
    registry = er.async_get(hass)
    return registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_{key}")


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_cop_and_cycling_sensors(hass: HomeAssistant) -> None:
    """COP, Starts und Laufzeit liegen im erwarteten Bereich."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=MANDATORY,
        unique_id=DOMAIN,
        options={
            CONF_COMPRESSOR_STARTS_ENTITY: "sensor.verdichter_starts",
            CONF_COMPRESSOR_RUNTIME_ENTITY: "sensor.verdichter_laufzeit",
        },
    )

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
        await _setup(hass, entry)

        cop_long = hass.states.get(_entity_id(hass, entry, "cop_30_days"))
        assert cop_long is not None
        assert float(cop_long.state) == pytest.approx(3.81, abs=0.02)
        assert cop_long.attributes["power_source"] == "primary"
        assert cop_long.attributes["days"] == 14

        cop_short = hass.states.get(_entity_id(hass, entry, "cop_7_days"))
        assert cop_short is not None
        assert float(cop_short.state) == pytest.approx(3.91, abs=0.02)
        assert cop_short.attributes["days"] == 7

        starts = hass.states.get(_entity_id(hass, entry, "starts_per_day"))
        assert starts is not None
        assert float(starts.state) == pytest.approx(9.9, abs=0.1)

        runtime = hass.states.get(_entity_id(hass, entry, "runtime_per_cycle"))
        assert runtime is not None
        assert float(runtime.state) == pytest.approx(32.6, abs=0.2)

        data_days = hass.states.get(_entity_id(hass, entry, "data_days"))
        assert data_days is not None
        assert data_days.state == "14"


async def test_flow_deviation_sensor(hass: HomeAssistant) -> None:
    """Vorlauf-Abweichung nur bei laufendem Verdichter."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=MANDATORY,
        unique_id=DOMAIN,
        options={"flow_entity": "sensor.vorlauf", "target_flow_entity": "sensor.vorlauf_soll"},
    )
    daily = _daily()
    hourly = {
        "sensor.vorlauf": [
            _hour(10, 35.0),
            _hour(11, 25.0),
            _hour(12, 39.0),
        ],
        "sensor.vorlauf_soll": [
            _hour(10, 30.0),
            _hour(11, 30.0),
            _hour(12, 30.0),
        ],
        MANDATORY[CONF_COMPRESSOR_ENTITY]: [
            _hour(10, 1.0),
            _hour(11, 0.0),
            _hour(12, 1.0),
        ],
    }

    with (
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_daily",
            new=AsyncMock(return_value=daily),
        ),
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_hourly",
            new=AsyncMock(return_value=hourly),
        ),
        patch(
            "custom_components.heizungsanalyse.data_access.async_read_hourly",
            new=AsyncMock(return_value=hourly),
        ),
    ):
        await _setup(hass, entry)

        sensor = hass.states.get(_entity_id(hass, entry, "flow_deviation"))
        assert sensor is not None
        assert float(sensor.state) == pytest.approx(7.0)
        assert sensor.attributes["p90"] == pytest.approx(9.0)
        assert sensor.attributes["compressor_filtered"] is True


async def test_fallback_power_source(hass: HomeAssistant) -> None:
    """Ohne Primaerquelle wird die Ersatzquelle genutzt und markiert."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=MANDATORY,
        unique_id=DOMAIN,
        options={CONF_POWER_FALLBACK_ENTITY: "sensor.wp_strom_ersatz"},
    )
    daily = _daily()
    daily.pop(MANDATORY[CONF_POWER_ENTITY])
    daily["sensor.wp_strom_ersatz"] = daily[MANDATORY[CONF_HEAT_ENTITY]]

    with (
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_daily",
            new=AsyncMock(return_value=daily),
        ),
        patch(
            "custom_components.heizungsanalyse.coordinator.async_read_hourly",
            new=AsyncMock(return_value={}),
        ),
    ):
        await _setup(hass, entry)

        cop_long = hass.states.get(_entity_id(hass, entry, "cop_30_days"))
        assert cop_long is not None
        assert cop_long.attributes["power_source"] == "fallback"
        assert float(cop_long.state) == pytest.approx(1.0)


async def test_missing_data_stays_unknown(hass: HomeAssistant) -> None:
    """Ohne Statistik wird nichts erfunden."""
    entry = MockConfigEntry(domain=DOMAIN, data=MANDATORY, unique_id=DOMAIN)

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
        await _setup(hass, entry)

        cop_long = hass.states.get(_entity_id(hass, entry, "cop_30_days"))
        assert cop_long is not None
        assert cop_long.state == "unknown"
        assert cop_long.attributes["power_source"] is None

        data_days = hass.states.get(_entity_id(hass, entry, "data_days"))
        assert data_days is not None
        assert data_days.state == "0"


def _hour(hour: int, mean: float) -> object:
    from datetime import UTC, datetime

    from custom_components.heizungsanalyse.analysis.types import HourValue

    return HourValue(hour=datetime(2026, 11, 1, hour, tzinfo=UTC), mean=mean)
