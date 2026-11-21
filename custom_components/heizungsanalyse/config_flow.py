"""Konfigurationsdialog.

M1: Pflichtquellen im Einrichtungsdialog, optionale Quellen, Heizkreise und
Räume im Optionsdialog. Alle Quellen sind Entity-Selectoren; unpassende
Einheiten oder nicht verfügbare Entities werden abgelehnt.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlowWithReload
from homeassistant.core import callback
from homeassistant.helpers import selector
import voluptuous as vol

from .analysis.findings import Thresholds
from .const import (
    CIRCUIT_TYPES,
    CONF_AUX_HEATER_ENTITY,
    CONF_BUFFER_ENTITY,
    CONF_BUFFER_MODEL,
    CONF_CIRCUIT,
    CONF_CIRCUITS,
    CONF_CLIMATE_ENTITY,
    CONF_COMPRESSOR_ENTITY,
    CONF_COMPRESSOR_RUNTIME_ENTITY,
    CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY,
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_DEFROST_ENTITY,
    CONF_DHW_CIRC_ENTITY,
    CONF_DHW_HEAT_ENTITY,
    CONF_DHW_OPERATION_ENTITY,
    CONF_DHW_POWER_ENTITY,
    CONF_DHW_PUMP_ENTITY,
    CONF_DHW_TANK_MODEL,
    CONF_DHW_TARGET_ENTITY,
    CONF_DHW_TEMP_ENTITY,
    CONF_FLOW_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_HEAT_PUMP_MODEL,
    CONF_HP_FLOW_ENTITY,
    CONF_ID,
    CONF_MIXER_CLOSE_ENTITY,
    CONF_MIXER_OPEN_ENTITY,
    CONF_NAME,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_POWER_FALLBACK_ENTITY,
    CONF_POWER_NOW_ENTITY,
    CONF_PUMP_ENTITY,
    CONF_RETURN_ENTITY,
    CONF_ROOMS,
    CONF_TARGET_ENTITY,
    CONF_TARGET_FLOW_ENTITY,
    CONF_TEMPERATURE_ENTITY,
    CONF_THRESHOLDS,
    CONF_TYPE,
    CONF_VALVE_POSITION_ENTITY,
    CONF_VOLUME_FLOW_ENTITY,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    NAME,
    OPTIONAL_SOURCES,
    PLANT_MODELS,
)
from .heat_pump_catalog import choices as catalog_choices
from .models import HeatingCircuit, Room, unique_id
from .validation import validate_climate, validate_energy, validate_status, validate_temperature

SENSOR_DOMAIN = "sensor"

_THRESHOLD_FIELDS: tuple[tuple[str, float, float, float], ...] = (
    ("flow_deviation_k", 0, 20, 0.5),
    ("starts_per_day", 0, 100, 1),
    ("runtime_minutes", 0, 240, 1),
    ("pump_idle_share", 0, 1, 0.05),
    ("room_deviation_k", 0, 10, 0.5),
    ("aux_hours_per_day", 0, 24, 0.5),
    ("defrost_hours_per_day", 0, 24, 0.5),
    ("cop_curve_deviation", 0, 1, 0.05),
    ("mixer_pulses_per_day", 0, 200, 1),
    ("power_source_deviation", 0, 1, 0.05),
    ("spread_min_k", 0, 10, 0.5),
    ("spread_max_k", 0, 20, 0.5),
    ("return_temp_max_c", 0, 80, 1),
)


def _entity(domain: str | list[str], device_class: str | None = None) -> selector.EntitySelector:
    return selector.EntitySelector(selector.EntitySelectorConfig(domain=domain, device_class=device_class))


def _energy() -> selector.EntitySelector:
    return _entity(SENSOR_DOMAIN, SensorDeviceClass.ENERGY)


def _temperature() -> selector.EntitySelector:
    return _entity(SENSOR_DOMAIN, SensorDeviceClass.TEMPERATURE)


def _status() -> selector.EntitySelector:
    return _entity([SENSOR_DOMAIN, "binary_sensor"])


def _climate() -> selector.EntitySelector:
    return _entity("climate")


def _text() -> selector.TextSelector:
    return selector.TextSelector(selector.TextSelectorConfig(type=selector.TextSelectorType.TEXT))


def _circuit_type() -> selector.SelectSelector:
    return selector.SelectSelector(
        selector.SelectSelectorConfig(
            options=list(CIRCUIT_TYPES),
            translation_key="circuit_type",
            mode=selector.SelectSelectorMode.DROPDOWN,
        )
    )


def _circuit_choice(circuits: list[dict[str, Any]]) -> selector.SelectSelector:
    return selector.SelectSelector(
        selector.SelectSelectorConfig(
            options=[selector.SelectOptionDict(value=item["id"], label=item["name"]) for item in circuits],
            mode=selector.SelectSelectorMode.DROPDOWN,
        )
    )


def _room_choice(rooms: list[dict[str, Any]]) -> selector.SelectSelector:
    return selector.SelectSelector(
        selector.SelectSelectorConfig(
            options=[selector.SelectOptionDict(value=item["id"], label=item["name"]) for item in rooms],
            mode=selector.SelectSelectorMode.DROPDOWN,
        )
    )


def _optional(key: str, current: dict[str, Any], option_selector: selector.Selector) -> tuple[vol.Marker, Any]:
    """Optionales Feld; vorhandene Werte werden vorbelegt."""
    if current.get(key):
        return vol.Optional(key, default=current[key]), option_selector
    return vol.Optional(key), option_selector


def _validate_sources(hass, data: dict[str, Any]) -> dict[str, str]:
    """Optionale Quellen prüfen. Leere Felder werden übersprungen."""
    errors: dict[str, str] = {}
    for key, value in data.items():
        if not value:
            continue
        if key in (CONF_POWER_FALLBACK_ENTITY, CONF_DHW_HEAT_ENTITY, CONF_DHW_POWER_ENTITY):
            error = validate_energy(hass, value)
        elif key in (
            CONF_FLOW_ENTITY,
            CONF_TARGET_FLOW_ENTITY,
            CONF_RETURN_ENTITY,
            CONF_BUFFER_ENTITY,
            CONF_HP_FLOW_ENTITY,
            CONF_DHW_TEMP_ENTITY,
            CONF_DHW_TARGET_ENTITY,
        ):
            error = validate_temperature(hass, value)
        else:
            error = validate_status(hass, value)
        if error:
            errors[key] = error
    return errors


class HeizungsanalyseConfigFlow(ConfigFlow, domain=DOMAIN):
    """Einmalige Einrichtung der Analyse."""

    VERSION = 1

    def _mandatory_schema(self, current: dict[str, Any]) -> vol.Schema:
        return vol.Schema(
            {
                vol.Required(CONF_POWER_ENTITY, default=current.get(CONF_POWER_ENTITY)): _energy(),
                vol.Required(CONF_HEAT_ENTITY, default=current.get(CONF_HEAT_ENTITY)): _energy(),
                vol.Required(CONF_OUTDOOR_ENTITY, default=current.get(CONF_OUTDOOR_ENTITY)): _temperature(),
                vol.Required(CONF_COMPRESSOR_ENTITY, default=current.get(CONF_COMPRESSOR_ENTITY)): _status(),
            }
        )

    def _validate_mandatory(self, user_input: dict[str, Any]) -> dict[str, str]:
        errors = {
            CONF_POWER_ENTITY: validate_energy(self.hass, user_input[CONF_POWER_ENTITY]),
            CONF_HEAT_ENTITY: validate_energy(self.hass, user_input[CONF_HEAT_ENTITY]),
            CONF_OUTDOOR_ENTITY: validate_temperature(self.hass, user_input[CONF_OUTDOOR_ENTITY]),
            CONF_COMPRESSOR_ENTITY: validate_status(self.hass, user_input[CONF_COMPRESSOR_ENTITY]),
        }
        return {key: error for key, error in errors.items() if error}

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Pflichtquellen zuordnen und den Eintrag anlegen."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_mandatory(user_input)
            if not errors:
                return self.async_create_entry(title=NAME, data=user_input)

        return self.async_show_form(step_id="user", data_schema=self._mandatory_schema(user_input or {}), errors=errors)

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Pflichtquellen nachträglich ändern."""
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_mandatory(user_input)
            if not errors:
                return self.async_update_reload_and_abort(entry, data={**entry.data, **user_input})

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=self._mandatory_schema(user_input or dict(entry.data)),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry) -> OptionsFlowWithReload:
        return HeizungsanalyseOptionsFlow()


class HeizungsanalyseOptionsFlow(OptionsFlowWithReload):
    """Optionale Quellen, Heizkreise und Räume pflegen."""

    def _draft(self) -> dict[str, Any]:
        """Arbeitskopie der Optionen, die über mehrere Schritte erhalten bleibt."""
        if not hasattr(self, "_working"):
            self._working = dict(self.config_entry.options)
        return self._working

    def _circuits(self) -> list[dict[str, Any]]:
        return list(self._draft().get(CONF_CIRCUITS) or [])

    def _rooms(self) -> list[dict[str, Any]]:
        return list(self._draft().get(CONF_ROOMS) or [])

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        menu_options = ["sources", "plant", "thresholds", "add_circuit"]
        if self._circuits():
            menu_options.extend(["edit_circuit", "remove_circuit", "add_room"])
        if self._rooms():
            menu_options.extend(["edit_room", "remove_room"])
        menu_options.append("save")
        return self.async_show_menu(step_id="init", menu_options=menu_options)

    async def async_step_sources(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate_sources(self.hass, user_input)
            if not errors:
                draft = self._draft()
                for key in OPTIONAL_SOURCES:
                    draft.pop(key, None)
                draft.update({key: value for key, value in user_input.items() if value})
                return await self.async_step_init()

        current = self._draft()
        fields: dict[Any, Any] = {}
        for key, option_selector in (
            (CONF_POWER_FALLBACK_ENTITY, _energy()),
            (CONF_DHW_HEAT_ENTITY, _energy()),
            (CONF_FLOW_ENTITY, _temperature()),
            (CONF_TARGET_FLOW_ENTITY, _temperature()),
            (CONF_RETURN_ENTITY, _temperature()),
            (CONF_BUFFER_ENTITY, _temperature()),
            (CONF_DEFROST_ENTITY, _status()),
            (CONF_AUX_HEATER_ENTITY, _status()),
            (CONF_COMPRESSOR_STARTS_ENTITY, _status()),
            (CONF_COMPRESSOR_RUNTIME_ENTITY, _status()),
            (CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY, _status()),
            (CONF_HP_FLOW_ENTITY, _temperature()),
            (CONF_VOLUME_FLOW_ENTITY, _entity(SENSOR_DOMAIN, SensorDeviceClass.VOLUME_FLOW_RATE)),
            (CONF_POWER_NOW_ENTITY, _entity(SENSOR_DOMAIN, SensorDeviceClass.POWER)),
            (CONF_DHW_POWER_ENTITY, _energy()),
            (CONF_DHW_OPERATION_ENTITY, _status()),
            (CONF_DHW_TEMP_ENTITY, _temperature()),
            (CONF_DHW_TARGET_ENTITY, _temperature()),
            (CONF_DHW_PUMP_ENTITY, _status()),
            (CONF_DHW_CIRC_ENTITY, _status()),
        ):
            marker, option_selector = _optional(key, current, option_selector)
            fields[marker] = option_selector

        return self.async_show_form(step_id="sources", data_schema=vol.Schema(fields), errors=errors)

    async def async_step_plant(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Wärmepumpe und Speicher aus dem Herstellerkatalog wählen."""
        if user_input is not None:
            draft = self._draft()
            for key in PLANT_MODELS:
                draft.pop(key, None)
            draft.update({key: value for key, value in user_input.items() if value})
            return await self.async_step_init()

        current = self._draft()
        fields: dict[Any, Any] = {}
        for key, kind in ((CONF_HEAT_PUMP_MODEL, "heat_pump"), (CONF_DHW_TANK_MODEL, "dhw"), (CONF_BUFFER_MODEL, "buffer")):
            option_selector = selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=[selector.SelectOptionDict(value=c["value"], label=c["label"]) for c in catalog_choices(kind)],
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            )
            marker, option_selector = _optional(key, current, option_selector)
            fields[marker] = option_selector
        marker, weather = _optional(CONF_WEATHER_ENTITY, current, _entity("weather"))
        fields[marker] = weather
        return self.async_show_form(step_id="plant", data_schema=vol.Schema(fields))

    async def async_step_thresholds(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        current = Thresholds.from_options(self._draft().get(CONF_THRESHOLDS) or {}).as_dict()
        if user_input is not None:
            self._draft()[CONF_THRESHOLDS] = {key: float(value) for key, value in user_input.items()}
            return await self.async_step_init()

        fields: dict[Any, Any] = {}
        for key, minimum, maximum, step in _THRESHOLD_FIELDS:
            fields[vol.Required(key, default=current[key])] = selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=minimum,
                    max=maximum,
                    step=step,
                    mode=selector.NumberSelectorMode.BOX,
                )
            )
        return self.async_show_form(step_id="thresholds", data_schema=vol.Schema(fields))

    def _circuit_schema(self, current: dict[str, Any]) -> vol.Schema:
        fields: dict = {
            vol.Required(CONF_NAME, default=current.get(CONF_NAME, "")): _text(),
            vol.Required(CONF_TYPE, default=current.get(CONF_TYPE) or "radiators"): _circuit_type(),
        }
        for key, field_selector in (
            (CONF_TEMPERATURE_ENTITY, _temperature()),
            (CONF_TARGET_ENTITY, _temperature()),
            (CONF_PUMP_ENTITY, _status()),
            (CONF_MIXER_OPEN_ENTITY, _status()),
            (CONF_MIXER_CLOSE_ENTITY, _status()),
        ):
            marker, value = _optional(key, current, field_selector)
            fields[marker] = value
        return vol.Schema(fields)

    @staticmethod
    def _circuit_from(identifier: str, user_input: dict[str, Any]) -> dict[str, Any]:
        return HeatingCircuit(
            id=identifier,
            name=user_input[CONF_NAME].strip(),
            type=user_input[CONF_TYPE],
            temperature_entity=user_input.get(CONF_TEMPERATURE_ENTITY) or None,
            target_entity=user_input.get(CONF_TARGET_ENTITY) or None,
            pump_entity=user_input.get(CONF_PUMP_ENTITY) or None,
            mixer_open_entity=user_input.get(CONF_MIXER_OPEN_ENTITY) or None,
            mixer_close_entity=user_input.get(CONF_MIXER_CLOSE_ENTITY) or None,
        ).as_dict()

    async def async_step_add_circuit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_circuit(user_input)
            if not errors:
                circuits = self._circuits()
                identifier = unique_id([item["id"] for item in circuits], user_input[CONF_NAME])
                self._draft()[CONF_CIRCUITS] = [*circuits, self._circuit_from(identifier, user_input)]
                return await self.async_step_init()
        return self.async_show_form(step_id="add_circuit", data_schema=self._circuit_schema(user_input or {}), errors=errors)

    async def async_step_edit_circuit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._editing = user_input[CONF_CIRCUIT]
            return await self.async_step_edit_circuit_details()
        return self.async_show_form(
            step_id="edit_circuit",
            data_schema=vol.Schema({vol.Required(CONF_CIRCUIT): _circuit_choice(self._circuits())}),
        )

    async def async_step_edit_circuit_details(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        identifier = getattr(self, "_editing", None)
        current = next((item for item in self._circuits() if item["id"] == identifier), None)
        if current is None:
            return await self.async_step_init()
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_circuit(user_input, exclude=identifier)
            if not errors:
                updated = self._circuit_from(identifier, user_input)
                self._draft()[CONF_CIRCUITS] = [updated if item["id"] == identifier else item for item in self._circuits()]
                return await self.async_step_init()
        return self.async_show_form(
            step_id="edit_circuit_details",
            data_schema=self._circuit_schema(user_input or current),
            errors=errors,
            description_placeholders={"name": str(current.get(CONF_NAME, identifier))},
        )

    def _validate_circuit(self, data: dict[str, Any], exclude: str | None = None) -> dict[str, str]:
        errors: dict[str, str] = {}
        name = (data.get(CONF_NAME) or "").strip()
        if not name:
            errors[CONF_NAME] = "invalid_name"
        elif any(item["name"].lower() == name.lower() and item["id"] != exclude for item in self._circuits()):
            errors[CONF_NAME] = "duplicate_name"

        checks = (
            (CONF_TEMPERATURE_ENTITY, validate_temperature),
            (CONF_TARGET_ENTITY, validate_temperature),
            (CONF_PUMP_ENTITY, validate_status),
            (CONF_MIXER_OPEN_ENTITY, validate_status),
            (CONF_MIXER_CLOSE_ENTITY, validate_status),
        )
        for key, check in checks:
            value = data.get(key)
            if value:
                error = check(self.hass, value)
                if error:
                    errors[key] = error
        return errors

    async def async_step_remove_circuit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            circuit_id = user_input[CONF_CIRCUIT]
            if any(room.get("circuit") == circuit_id for room in self._rooms()):
                errors[CONF_CIRCUIT] = "circuit_in_use"
            else:
                draft = self._draft()
                draft[CONF_CIRCUITS] = [item for item in self._circuits() if item["id"] != circuit_id]
                return await self.async_step_init()

        return self.async_show_form(
            step_id="remove_circuit",
            data_schema=vol.Schema({vol.Required(CONF_CIRCUIT): _circuit_choice(self._circuits())}),
            errors=errors,
        )

    def _room_schema(self, current: dict[str, Any]) -> vol.Schema:
        fields: dict = {
            vol.Required(CONF_NAME, default=current.get(CONF_NAME, "")): _text(),
        }
        if current.get(CONF_CIRCUIT):
            fields[vol.Required(CONF_CIRCUIT, default=current[CONF_CIRCUIT])] = _circuit_choice(self._circuits())
        else:
            fields[vol.Required(CONF_CIRCUIT)] = _circuit_choice(self._circuits())
        for key, field_selector in ((CONF_CLIMATE_ENTITY, _climate()), (CONF_VALVE_POSITION_ENTITY, _entity(SENSOR_DOMAIN))):
            marker, value = _optional(key, current, field_selector)
            fields[marker] = value
        return vol.Schema(fields)

    @staticmethod
    def _room_from(identifier: str, user_input: dict[str, Any]) -> dict[str, Any]:
        return Room(
            id=identifier,
            name=user_input[CONF_NAME].strip(),
            circuit=user_input[CONF_CIRCUIT],
            climate_entity=user_input.get(CONF_CLIMATE_ENTITY) or None,
            valve_position_entity=user_input.get(CONF_VALVE_POSITION_ENTITY) or None,
        ).as_dict()

    async def async_step_add_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if not self._circuits():
            return self.async_abort(reason="no_circuits")

        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_room(user_input)
            if not errors:
                rooms = self._rooms()
                identifier = unique_id([item["id"] for item in rooms], user_input[CONF_NAME])
                self._draft()[CONF_ROOMS] = [*rooms, self._room_from(identifier, user_input)]
                return await self.async_step_init()
        return self.async_show_form(step_id="add_room", data_schema=self._room_schema(user_input or {}), errors=errors)

    async def async_step_edit_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._editing = user_input[CONF_ID]
            return await self.async_step_edit_room_details()
        return self.async_show_form(
            step_id="edit_room",
            data_schema=vol.Schema({vol.Required(CONF_ID): _room_choice(self._rooms())}),
        )

    async def async_step_edit_room_details(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        identifier = getattr(self, "_editing", None)
        current = next((item for item in self._rooms() if item["id"] == identifier), None)
        if current is None:
            return await self.async_step_init()
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_room(user_input, exclude=identifier)
            if not errors:
                updated = self._room_from(identifier, user_input)
                self._draft()[CONF_ROOMS] = [updated if item["id"] == identifier else item for item in self._rooms()]
                return await self.async_step_init()
        return self.async_show_form(
            step_id="edit_room_details",
            data_schema=self._room_schema(user_input or current),
            errors=errors,
            description_placeholders={"name": str(current.get(CONF_NAME, identifier))},
        )

    def _validate_room(self, data: dict[str, Any], exclude: str | None = None) -> dict[str, str]:
        errors: dict[str, str] = {}
        name = (data.get(CONF_NAME) or "").strip()
        if not name:
            errors[CONF_NAME] = "invalid_name"
        elif any(item["name"].lower() == name.lower() and item["id"] != exclude for item in self._rooms()):
            errors[CONF_NAME] = "duplicate_name"

        circuit_id = data.get(CONF_CIRCUIT)
        if circuit_id not in [item["id"] for item in self._circuits()]:
            errors[CONF_CIRCUIT] = "unknown_circuit"

        if data.get(CONF_CLIMATE_ENTITY):
            error = validate_climate(self.hass, data[CONF_CLIMATE_ENTITY])
            if error:
                errors[CONF_CLIMATE_ENTITY] = error
        if data.get(CONF_VALVE_POSITION_ENTITY):
            error = validate_status(self.hass, data[CONF_VALVE_POSITION_ENTITY])
            if error:
                errors[CONF_VALVE_POSITION_ENTITY] = error
        return errors

    async def async_step_remove_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            room_id = user_input[CONF_ID]
            draft = self._draft()
            draft[CONF_ROOMS] = [item for item in self._rooms() if item["id"] != room_id]
            return await self.async_step_init()

        return self.async_show_form(
            step_id="remove_room",
            data_schema=vol.Schema({vol.Required(CONF_ID): _room_choice(self._rooms())}),
        )

    async def async_step_save(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return self.async_create_entry(data=self._draft())


__all__ = ["HeizungsanalyseConfigFlow", "HeizungsanalyseOptionsFlow"]
