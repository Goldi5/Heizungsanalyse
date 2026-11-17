"""Sensoren der Heizungsanalyse."""

from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfTemperature, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    DOMAIN,
    SENSOR_COP_LONG,
    SENSOR_COP_SHORT,
    SENSOR_DATA_DAYS,
    SENSOR_FLOW_DEVIATION,
    SENSOR_RUNTIME_PER_CYCLE,
    SENSOR_STARTS_PER_DAY,
)
from .coordinator import HeizungsanalyseCoordinator


class HeizungsanalyseSensor(CoordinatorEntity[HeizungsanalyseCoordinator], SensorEntity):
    """Basis: haengt am Coordinator, kein eigenes Polling."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, coordinator: HeizungsanalyseCoordinator, key: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.entry.title,
            manufacturer="Heizungsanalyse",
            model="Analyse",
        )


def _rounded(value: float | None, digits: int = 2) -> float | None:
    return None if value is None else round(value, digits)


class CopShortSensor(HeizungsanalyseSensor):
    """COP der letzten Tage."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 2
    _attr_icon = "mdi:heat-pump"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_COP_SHORT)

    @property
    def native_value(self) -> float | None:
        return _rounded(self.coordinator.data.cop_short.cop)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        result = self.coordinator.data.cop_short
        return {
            "power_source": result.source,
            "heat_kwh": _rounded(result.heat_kwh, 1),
            "power_kwh": _rounded(result.power_kwh, 1),
            "days": result.days,
        }


class CopLongSensor(HeizungsanalyseSensor):
    """COP der letzten 30 Tage."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 2
    _attr_icon = "mdi:heat-pump"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_COP_LONG)

    @property
    def native_value(self) -> float | None:
        return _rounded(self.coordinator.data.cop_long.cop)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        result = self.coordinator.data.cop_long
        return {
            "power_source": result.source,
            "heat_kwh": _rounded(result.heat_kwh, 1),
            "power_kwh": _rounded(result.power_kwh, 1),
            "days": result.days,
        }


class StartsPerDaySensor(HeizungsanalyseSensor):
    """Durchschnittliche Verdichterstarts pro Tag."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:counter"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_STARTS_PER_DAY)

    @property
    def native_value(self) -> float | None:
        return _rounded(self.coordinator.data.starts_per_day, 1)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        return {"window_days": self.coordinator.data.cop_short.days}


class RuntimePerCycleSensor(HeizungsanalyseSensor):
    """Mittlere Verdichterlaufzeit je Start."""

    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:timer-sand"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_RUNTIME_PER_CYCLE)

    @property
    def native_value(self) -> float | None:
        return _rounded(self.coordinator.data.runtime_per_cycle, 1)


class FlowDeviationSensor(HeizungsanalyseSensor):
    """Median der Abweichung Ist- minus Soll-Vorlauf."""

    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_native_unit_of_measurement = UnitOfTemperature.KELVIN
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:thermometer-chevron-up"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_FLOW_DEVIATION)

    @property
    def native_value(self) -> float | None:
        return _rounded(self.coordinator.data.deviation.median, 1)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        snapshot = self.coordinator.data
        return {
            "p90": _rounded(snapshot.deviation.p90, 1),
            "hours": snapshot.deviation.count,
            "compressor_filtered": snapshot.compressor_filtered,
        }


class DataDaysSensor(HeizungsanalyseSensor):
    """Anzahl der Tage mit Waermedaten im Auswertungsfenster."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = "d"
    _attr_suggested_display_precision = 0
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:calendar-check"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_DATA_DAYS)

    @property
    def native_value(self) -> int | None:
        return self.coordinator.data.days_with_data


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Sensoren anlegen."""
    coordinator: HeizungsanalyseCoordinator = entry.runtime_data.coordinator
    async_add_entities(
        [
            CopShortSensor(coordinator),
            CopLongSensor(coordinator),
            StartsPerDaySensor(coordinator),
            RuntimePerCycleSensor(coordinator),
            FlowDeviationSensor(coordinator),
            DataDaysSensor(coordinator),
        ]
    )
