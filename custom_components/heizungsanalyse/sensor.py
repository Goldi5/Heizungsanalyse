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
    CONF_CIRCUITS,
    CONF_CLIMATE_ENTITY,
    CONF_ID,
    CONF_MIXER_CLOSE_ENTITY,
    CONF_MIXER_OPEN_ENTITY,
    CONF_NAME,
    CONF_PUMP_ENTITY,
    CONF_ROOMS,
    DOMAIN,
    MIXER_RESOLUTION_MINUTES,
    ROOM_TOLERANCE,
    ROOM_WINDOW_DAYS,
    SENSOR_COP_LONG,
    SENSOR_COP_SHORT,
    SENSOR_DATA_DAYS,
    SENSOR_FINDINGS,
    SENSOR_FLOW_DEVIATION,
    SENSOR_MIXER_PULSES,
    SENSOR_PUMP_IDLE,
    SENSOR_ROOM_DEVIATION,
    SENSOR_ROOM_HEATING_UP,
    SENSOR_ROOM_RANKING,
    SENSOR_RUNTIME_PER_CYCLE,
    SENSOR_STARTS_PER_DAY,
)
from .coordinator import HeizungsanalyseCoordinator
from .findings_text import render


class HeizungsanalyseSensor(CoordinatorEntity[HeizungsanalyseCoordinator], SensorEntity):
    """Basis: hängt am Coordinator, kein eigenes Polling."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        coordinator: HeizungsanalyseCoordinator,
        key: str,
        *,
        translation_key: str | None = None,
    ) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.entry.entry_id}_{key}"
        self._attr_translation_key = translation_key or key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.entry.entry_id)},
            name=coordinator.entry.title,
            manufacturer="Heizungsanalyse",
            model="Analyse",
        )


def _sub_device(coordinator: HeizungsanalyseCoordinator, object_id: str, name: str, model: str) -> DeviceInfo:
    """Gerät je Raum bzw. Kreis, untergeordnet dem Hauptgerät."""
    return DeviceInfo(
        identifiers={(DOMAIN, f"{coordinator.entry.entry_id}_{object_id}")},
        name=name,
        manufacturer="Heizungsanalyse",
        model=model,
        via_device=(DOMAIN, coordinator.entry.entry_id),
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
    """Anzahl der Tage mit Wärmedaten im Auswertungsfenster."""

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


class RoomDeviationSensor(HeizungsanalyseSensor):
    """Median der Raumtemperatur-Abweichung zum Soll."""

    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_native_unit_of_measurement = UnitOfTemperature.KELVIN
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:home-thermometer"

    def __init__(self, coordinator: HeizungsanalyseCoordinator, room: dict) -> None:
        room_id = str(room[CONF_ID])
        super().__init__(
            coordinator,
            f"room_{room_id}_{SENSOR_ROOM_DEVIATION}",
            translation_key=SENSOR_ROOM_DEVIATION,
        )
        self._room_id = room_id
        self._attr_device_info = _sub_device(coordinator, f"room_{room_id}", str(room.get(CONF_NAME, room_id)), "Raum")

    @property
    def native_value(self) -> float | None:
        stats = self.coordinator.data.rooms.get(self._room_id)
        return None if stats is None else stats.median

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        stats = self.coordinator.data.rooms.get(self._room_id)
        if stats is None:
            return {"samples": 0, "window_days": ROOM_WINDOW_DAYS, "valve_available": self._valve_available()}
        return {
            **stats.as_dict(),
            "window_days": ROOM_WINDOW_DAYS,
            "tolerance_k": ROOM_TOLERANCE,
            "valve_available": self._valve_available(),
        }

    def _valve_available(self) -> bool:
        for room in self.coordinator.entry.options.get(CONF_ROOMS) or []:
            if str(room.get(CONF_ID)) == self._room_id:
                return bool(room.get("valve_position_entity"))
        return False


class RoomHeatingUpSensor(HeizungsanalyseSensor):
    """Median der Aufheizzeit nach einer Sollwert-Anhebung."""

    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 0
    _attr_icon = "mdi:clock-fast"

    def __init__(self, coordinator: HeizungsanalyseCoordinator, room: dict) -> None:
        room_id = str(room[CONF_ID])
        super().__init__(
            coordinator,
            f"room_{room_id}_{SENSOR_ROOM_HEATING_UP}",
            translation_key=SENSOR_ROOM_HEATING_UP,
        )
        self._room_id = room_id
        self._attr_device_info = _sub_device(coordinator, f"room_{room_id}", str(room.get(CONF_NAME, room_id)), "Raum")

    @property
    def native_value(self) -> float | None:
        return self.coordinator.data.heating_up.get(self._room_id)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        return {"window_days": ROOM_WINDOW_DAYS, "basis": "Sollwert-Anhebung"}


class PumpIdleSensor(HeizungsanalyseSensor):
    """Anteil der Pumpenlaufzeit ohne Verdichterlauf."""

    _attr_native_unit_of_measurement = "%"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 0
    _attr_icon = "mdi:pump"

    def __init__(self, coordinator: HeizungsanalyseCoordinator, circuit: dict) -> None:
        circuit_id = str(circuit[CONF_ID])
        super().__init__(coordinator, f"circuit_{circuit_id}_{SENSOR_PUMP_IDLE}", translation_key=SENSOR_PUMP_IDLE)
        self._circuit_id = circuit_id
        self._attr_device_info = _sub_device(
            coordinator, f"circuit_{circuit_id}", str(circuit.get(CONF_NAME, circuit_id)), "Heizkreis"
        )

    @property
    def native_value(self) -> float | None:
        stats = self.coordinator.data.circuits.get(self._circuit_id)
        if stats is None or stats.idle_share is None:
            return None
        return round(stats.idle_share * 100, 1)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        stats = self.coordinator.data.circuits.get(self._circuit_id)
        if stats is None:
            return {"samples": 0, "window_days": ROOM_WINDOW_DAYS}
        return {
            **stats.as_dict(),
            "window_days": ROOM_WINDOW_DAYS,
            "resolution_minutes": MIXER_RESOLUTION_MINUTES,
        }


class MixerPulsesSensor(HeizungsanalyseSensor):
    """Mischer-Impulse pro Tag, im Stichprobenraster gezählt."""

    _attr_native_unit_of_measurement = "/d"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:valve"

    def __init__(self, coordinator: HeizungsanalyseCoordinator, circuit: dict) -> None:
        circuit_id = str(circuit[CONF_ID])
        super().__init__(coordinator, f"circuit_{circuit_id}_{SENSOR_MIXER_PULSES}", translation_key=SENSOR_MIXER_PULSES)
        self._circuit_id = circuit_id
        self._attr_device_info = _sub_device(
            coordinator, f"circuit_{circuit_id}", str(circuit.get(CONF_NAME, circuit_id)), "Heizkreis"
        )

    @property
    def native_value(self) -> float | None:
        stats = self.coordinator.data.mixer.get(self._circuit_id)
        return None if stats is None else stats.pulses_per_day

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        stats = self.coordinator.data.mixer.get(self._circuit_id)
        if stats is None:
            return {"days": 0, "resolution_minutes": MIXER_RESOLUTION_MINUTES}
        return {**stats.as_dict(), "window_days": ROOM_WINDOW_DAYS}


class RoomRankingSensor(HeizungsanalyseSensor):
    """Diagnose: Rangliste der Räume nach Soll-Abweichung."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:format-list-numbered"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_ROOM_RANKING)

    @property
    def native_value(self) -> int:
        return len(self.coordinator.data.rankings.get("rooms") or [])

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        rankings = self.coordinator.data.rankings
        return {
            "rooms": rankings.get("rooms") or [],
            "by_circuit": rankings.get("by_circuit") or {},
            "window_days": ROOM_WINDOW_DAYS,
        }


class FindingsSensor(HeizungsanalyseSensor):
    """Anzahl der Hinweise, Details als Attribute."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_icon = "mdi:alert-circle-check-outline"

    def __init__(self, coordinator: HeizungsanalyseCoordinator) -> None:
        super().__init__(coordinator, SENSOR_FINDINGS)

    @property
    def native_value(self) -> int:
        return len(self.coordinator.data.findings)

    @property
    def extra_state_attributes(self) -> dict[str, object]:
        findings = self.coordinator.data.findings
        language = self.hass.config.language
        return {
            "warning_count": sum(1 for finding in findings if finding.severity == "warning"),
            "info_count": sum(1 for finding in findings if finding.severity == "info"),
            "findings": [{**finding.as_dict(), **render(finding.key, finding.params, language)} for finding in findings],
            "thresholds": self.coordinator.data.thresholds.as_dict(),
        }


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Sensoren anlegen, inklusive je Raum und Kreis aus den Optionen."""
    coordinator: HeizungsanalyseCoordinator = entry.runtime_data.coordinator
    entities: list[SensorEntity] = [
        CopShortSensor(coordinator),
        CopLongSensor(coordinator),
        StartsPerDaySensor(coordinator),
        RuntimePerCycleSensor(coordinator),
        FlowDeviationSensor(coordinator),
        DataDaysSensor(coordinator),
        RoomRankingSensor(coordinator),
        FindingsSensor(coordinator),
    ]

    for room in entry.options.get(CONF_ROOMS) or []:
        if not room.get(CONF_CLIMATE_ENTITY) or CONF_ID not in room:
            continue
        entities.append(RoomDeviationSensor(coordinator, room))
        entities.append(RoomHeatingUpSensor(coordinator, room))

    for circuit in entry.options.get(CONF_CIRCUITS) or []:
        if CONF_ID not in circuit:
            continue
        if circuit.get(CONF_PUMP_ENTITY):
            entities.append(PumpIdleSensor(coordinator, circuit))
        if circuit.get(CONF_MIXER_OPEN_ENTITY) or circuit.get(CONF_MIXER_CLOSE_ENTITY):
            entities.append(MixerPulsesSensor(coordinator, circuit))

    async_add_entities(entities)
