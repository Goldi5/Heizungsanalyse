"""Konfigurationsdialog.

M1: Pflichtquellen im Einrichtungsdialog, optionale Quellen, Heizkreise und
Raeume im Optionsdialog. Alle Quellen sind Entity-Selectoren; unpassende
Einheiten oder nicht verfuegbare Entities werden abgelehnt.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlowWithReload
from homeassistant.core import callback
from homeassistant.helpers import selector
import voluptuous as vol

from .const import (
    CIRCUIT_TYPES,
    CONF_AUX_HEATER_ENTITY,
    CONF_BUFFER_ENTITY,
    CONF_CIRCUIT,
    CONF_CIRCUITS,
    CONF_CLIMATE_ENTITY,
    CONF_COMPRESSOR_ENTITY,
    CONF_COMPRESSOR_RUNTIME_ENTITY,
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_DEFROST_ENTITY,
    CONF_DHW_HEAT_ENTITY,
    CONF_FLOW_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_ID,
    CONF_MIXER_CLOSE_ENTITY,
    CONF_MIXER_OPEN_ENTITY,
    CONF_NAME,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_POWER_FALLBACK_ENTITY,
    CONF_PUMP_ENTITY,
    CONF_RETURN_ENTITY,
    CONF_ROOMS,
    CONF_TARGET_FLOW_ENTITY,
    CONF_TEMPERATURE_ENTITY,
    CONF_TYPE,
    CONF_VALVE_POSITION_ENTITY,
    DOMAIN,
    NAME,
    OPTIONAL_SOURCES,
)
from .models import HeatingCircuit, Room, unique_id
from .validation import validate_climate, validate_energy, validate_status, validate_temperature

SENSOR_DOMAIN = "sensor"


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
    """Optionale Quellen pruefen. Leere Felder werden uebersprungen."""
    errors: dict[str, str] = {}
    for key, value in data.items():
        if not value:
            continue
        if key in (CONF_POWER_FALLBACK_ENTITY, CONF_DHW_HEAT_ENTITY):
            error = validate_energy(hass, value)
        elif key in (CONF_FLOW_ENTITY, CONF_TARGET_FLOW_ENTITY, CONF_RETURN_ENTITY, CONF_BUFFER_ENTITY):
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
        """Pflichtquellen nachtraeglich aendern."""
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
    """Optionale Quellen, Heizkreise und Raeume pflegen."""

    def _draft(self) -> dict[str, Any]:
        """Arbeitskopie der Optionen, die ueber mehrere Schritte erhalten bleibt."""
        if not hasattr(self, "_working"):
            self._working = dict(self.config_entry.options)
        return self._working

    def _circuits(self) -> list[dict[str, Any]]:
        return list(self._draft().get(CONF_CIRCUITS) or [])

    def _rooms(self) -> list[dict[str, Any]]:
        return list(self._draft().get(CONF_ROOMS) or [])

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        menu_options = ["sources", "add_circuit"]
        if self._circuits():
            menu_options.extend(["remove_circuit", "add_room"])
        if self._rooms():
            menu_options.append("remove_room")
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
        ):
            marker, option_selector = _optional(key, current, option_selector)
            fields[marker] = option_selector

        return self.async_show_form(step_id="sources", data_schema=vol.Schema(fields), errors=errors)

    async def async_step_add_circuit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_circuit(user_input)
            if not errors:
                circuits = self._circuits()
                circuit = HeatingCircuit(
                    id=unique_id([item["id"] for item in circuits], user_input[CONF_NAME]),
                    name=user_input[CONF_NAME].strip(),
                    type=user_input[CONF_TYPE],
                    temperature_entity=user_input.get(CONF_TEMPERATURE_ENTITY) or None,
                    pump_entity=user_input.get(CONF_PUMP_ENTITY) or None,
                    mixer_open_entity=user_input.get(CONF_MIXER_OPEN_ENTITY) or None,
                    mixer_close_entity=user_input.get(CONF_MIXER_CLOSE_ENTITY) or None,
                )
                self._draft()[CONF_CIRCUITS] = [*circuits, circuit.as_dict()]
                return await self.async_step_init()

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME): _text(),
                vol.Required(CONF_TYPE, default="radiators"): _circuit_type(),
                vol.Optional(CONF_TEMPERATURE_ENTITY): _temperature(),
                vol.Optional(CONF_PUMP_ENTITY): _status(),
                vol.Optional(CONF_MIXER_OPEN_ENTITY): _status(),
                vol.Optional(CONF_MIXER_CLOSE_ENTITY): _status(),
            }
        )
        return self.async_show_form(step_id="add_circuit", data_schema=schema, errors=errors)

    def _validate_circuit(self, data: dict[str, Any]) -> dict[str, str]:
        errors: dict[str, str] = {}
        name = (data.get(CONF_NAME) or "").strip()
        if not name:
            errors[CONF_NAME] = "invalid_name"
        elif any(item["name"].lower() == name.lower() for item in self._circuits()):
            errors[CONF_NAME] = "duplicate_name"

        checks = (
            (CONF_TEMPERATURE_ENTITY, validate_temperature),
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

    async def async_step_add_room(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if not self._circuits():
            return self.async_abort(reason="no_circuits")

        errors: dict[str, str] = {}
        if user_input is not None:
            errors = self._validate_room(user_input)
            if not errors:
                rooms = self._rooms()
                room = Room(
                    id=unique_id([item["id"] for item in rooms], user_input[CONF_NAME]),
                    name=user_input[CONF_NAME].strip(),
                    circuit=user_input[CONF_CIRCUIT],
                    climate_entity=user_input.get(CONF_CLIMATE_ENTITY) or None,
                    valve_position_entity=user_input.get(CONF_VALVE_POSITION_ENTITY) or None,
                )
                self._draft()[CONF_ROOMS] = [*rooms, room.as_dict()]
                return await self.async_step_init()

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME): _text(),
                vol.Required(CONF_CIRCUIT): _circuit_choice(self._circuits()),
                vol.Optional(CONF_CLIMATE_ENTITY): _climate(),
                vol.Optional(CONF_VALVE_POSITION_ENTITY): _entity(SENSOR_DOMAIN),
            }
        )
        return self.async_show_form(step_id="add_room", data_schema=schema, errors=errors)

    def _validate_room(self, data: dict[str, Any]) -> dict[str, str]:
        errors: dict[str, str] = {}
        name = (data.get(CONF_NAME) or "").strip()
        if not name:
            errors[CONF_NAME] = "invalid_name"
        elif any(item["name"].lower() == name.lower() for item in self._rooms()):
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
