"""Dienste: Inventar pflegen, Zeiträume vergleichen, Bericht erzeugen.

Die Dienste schreiben ausschließlich in den integrationseigenen Speicher.
Kein Dienst ruft eine Service-Aktion auf einer Fremd-Entity auf.
"""

from __future__ import annotations

from datetime import date
import logging
from typing import Any

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util import dt as dt_util
import voluptuous as vol

from .analysis.periods import compare_periods, merge_samples, samples_from_rollups, summarize
from .const import (
    DEFAULT_COMPARE_DAYS,
    DOMAIN,
    EVENT_INVENTORY_CHANGED,
    EVENT_PERIOD_COMPARISON,
    INVENTORY_FIELDS,
    REPORT_CHANGE_LIMIT,
    SERVICE_COMPARE_PERIODS,
    SERVICE_EXPORT_REPORT,
    SERVICE_LOG_CHANGE,
    SERVICE_REFRESH,
    SERVICE_UPDATE_INVENTORY,
)
from .report import render_json, render_markdown

_LOGGER = logging.getLogger(__name__)

OBJECT_SCHEMA = vol.All(str, vol.Length(min=1))
FIELD_SCHEMA = vol.All(str, vol.Length(min=1))

UPDATE_INVENTORY_SCHEMA = vol.Schema(
    {
        vol.Required("object"): OBJECT_SCHEMA,
        vol.Required("values"): dict,
        vol.Optional("note"): str,
    }
)

LOG_CHANGE_SCHEMA = vol.Schema(
    {
        vol.Required("object"): OBJECT_SCHEMA,
        vol.Required("field"): FIELD_SCHEMA,
        vol.Optional("old_value"): vol.Any(str, int, float, bool, None),
        vol.Optional("new_value"): vol.Any(str, int, float, bool, None),
        vol.Optional("note"): str,
    }
)

REFRESH_SCHEMA = vol.Schema({})

COMPARE_SCHEMA = vol.Schema(
    {
        vol.Optional("days", default=DEFAULT_COMPARE_DAYS): vol.All(int, vol.Range(min=1, max=90)),
        vol.Optional("change_time"): str,
    }
)

EXPORT_SCHEMA = vol.Schema(
    {
        vol.Optional("format", default="markdown"): vol.In(["markdown", "json"]),
    }
)


def _runtime(hass: HomeAssistant) -> Any:
    for entry in hass.config_entries.async_entries(DOMAIN):
        runtime = getattr(entry, "runtime_data", None)
        if runtime is not None:
            return runtime
    raise ServiceValidationError("Die Heizungsanalyse ist nicht eingerichtet.")


def _parse_change_time(value: str | None, changes: list[dict[str, Any]]) -> date:
    if value:
        parsed = dt_util.parse_datetime(value)
        if parsed is None:
            raise ServiceValidationError(f"change_time ist kein gueltiger Zeitpunkt: {value}")
        return dt_util.as_local(parsed).date()
    if changes:
        logged = dt_util.parse_datetime(str(changes[0].get("ts")))
        if logged is not None:
            return dt_util.as_local(logged).date()
    return dt_util.now().date()


def _check_object(object_id: str) -> tuple[str, str | None]:
    section, _, key = object_id.partition(".")
    allowed = INVENTORY_FIELDS.get(section)
    if allowed is None:
        raise ServiceValidationError(f"Unbekannter Bereich '{section}'. Erlaubt: {', '.join(sorted(INVENTORY_FIELDS))}.")
    if section != "hydraulics" and not key:
        raise ServiceValidationError(f"'{object_id}' braucht einen Bezeichner, z. B. '{section}.hk2'.")
    if section == "hydraulics" and key:
        raise ServiceValidationError("hydraulics wird ohne Punkt verwendet.")
    return section, key or None


async def _handle_update_inventory(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    object_id = str(call.data["object"])
    section, _ = _check_object(object_id)
    values: dict[str, Any] = dict(call.data["values"])
    unknown = sorted(set(values) - set(INVENTORY_FIELDS[section]))
    if unknown:
        raise ServiceValidationError(
            f"Unbekannte Felder fuer {section}: {', '.join(unknown)}. Erlaubt: {', '.join(INVENTORY_FIELDS[section])}."
        )

    changes = await runtime.store.async_update_inventory(object_id, values, note=call.data.get("note"))
    if changes:
        call.hass.bus.async_fire(EVENT_INVENTORY_CHANGED, {"changes": changes})
        await runtime.log.async_add(
            "info",
            "inventory",
            f"Inventar {object_id}: {len(changes)} Feld/Felder geändert",
            key="inventory.updated",
            params={"object": object_id, "count": len(changes)},
            details={"object": object_id, "changes": changes},
        )
    return {"object": object_id, "changed": len(changes)}


async def _handle_log_change(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    change = await runtime.store.async_log_change(
        str(call.data["object"]),
        str(call.data["field"]),
        old_value=call.data.get("old_value"),
        new_value=call.data.get("new_value"),
        note=call.data.get("note"),
    )
    call.hass.bus.async_fire(EVENT_INVENTORY_CHANGED, {"changes": [change]})
    await runtime.log.async_add(
        "info",
        "inventory",
        f"Änderung dokumentiert: {change['object']}.{change['field']}",
        key="inventory.logged",
        params={"object": change["object"], "field": change["field"]},
        details=dict(change),
    )
    return {"change": change}


async def _handle_compare_periods(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    changes = await runtime.store.async_change_log(limit=1)
    change_day = _parse_change_time(call.data.get("change_time"), changes)

    rollups = await runtime.store.async_rollups()
    samples = merge_samples(samples_from_rollups(rollups), runtime.coordinator.data.samples)
    result = compare_periods(samples, change_day=change_day, days=int(call.data["days"]))

    if result["before"]["days"] == 0 and result["after"]["days"] == 0:
        raise ServiceValidationError("Fuer diesen Stichtag liegen keine Tagesdaten vor.")
    call.hass.bus.async_fire(EVENT_PERIOD_COMPARISON, result)
    return {"comparison": result}


async def _handle_export_report(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    metrics = summarize(runtime.coordinator.data.samples)
    inventory = await runtime.store.async_inventory()
    changes = await runtime.store.async_change_log(limit=REPORT_CHANGE_LIMIT)
    report_format = call.data["format"]

    if report_format == "json":
        body = render_json(metrics=metrics, inventory=inventory, changes=changes)
    else:
        body = render_markdown(
            title="Heizungsanalyse",
            metrics=metrics,
            inventory=inventory,
            changes=changes,
        )
    return {"format": report_format, "report": body}


async def _handle_refresh(call: ServiceCall) -> ServiceResponse:
    """Coordinator neu rechnen lassen (nur Lesevorgang, kein Eingriff)."""
    runtime = _runtime(call.hass)
    await runtime.coordinator.async_request_refresh()
    return {"ok": True, "last_duration_ms": runtime.coordinator.last_duration_ms}


async def async_setup_services(hass: HomeAssistant) -> None:
    """Dienste einmalig registrieren."""
    if hass.services.has_service(DOMAIN, SERVICE_UPDATE_INVENTORY):
        return

    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_INVENTORY,
        _handle_update_inventory,
        schema=UPDATE_INVENTORY_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_CHANGE,
        _handle_log_change,
        schema=LOG_CHANGE_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_COMPARE_PERIODS,
        _handle_compare_periods,
        schema=COMPARE_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REFRESH,
        _handle_refresh,
        schema=REFRESH_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_EXPORT_REPORT,
        _handle_export_report,
        schema=EXPORT_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )


__all__ = ["async_setup_services"]
