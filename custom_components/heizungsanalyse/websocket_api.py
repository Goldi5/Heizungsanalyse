"""Websocket-Befehle für das Dashboard. Rein lesend bis auf das eigene Dashboard-Merkzeichen."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util
import voluptuous as vol

from .analysis.periods import merge_samples, samples_from_rollups
from .const import (
    CONF_CIRCUITS,
    CONF_ROOMS,
    DASHBOARD_ICON,
    DASHBOARD_PATH,
    DOMAIN,
    MANDATORY_SOURCES,
    OPTIONAL_SOURCES,
    VERSION,
)
from .summary import build_summary, local_day


def _runtime(hass: HomeAssistant) -> Any:
    for entry in hass.config_entries.async_entries(DOMAIN):
        runtime = getattr(entry, "runtime_data", None)
        if runtime is not None and getattr(runtime, "coordinator", None) is not None:
            return runtime
    return None


def _to_day(value: str):
    parsed = dt_util.parse_datetime(value)
    return None if parsed is None else dt_util.as_local(parsed).date()


@callback
def async_register(hass: HomeAssistant) -> None:
    """Befehle einmalig registrieren."""
    websocket_api.async_register_command(hass, ws_summary)
    websocket_api.async_register_command(hass, ws_dashboard_status)
    websocket_api.async_register_command(hass, ws_dashboard_mark)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/summary", vol.Optional("language"): str})
@websocket_api.async_response
async def ws_summary(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Alles für das Dashboard in einer Antwort."""
    runtime = _runtime(hass)
    if runtime is None or runtime.coordinator.data is None:
        connection.send_result(msg["id"], {"configured": False, "version": VERSION})
        return
    entry = runtime.entry
    snapshot = runtime.coordinator.data
    rollups = await runtime.store.async_rollups()
    history = merge_samples(samples_from_rollups(rollups), snapshot.samples)
    changes = await runtime.store.async_change_log(limit=50)
    inventory = await runtime.store.async_inventory()
    sources = {key: entry.data.get(key) for key in MANDATORY_SOURCES}
    sources |= {key: entry.options.get(key) for key in OPTIONAL_SOURCES}
    result = build_summary(
        snapshot,
        version=VERSION,
        title=entry.title,
        language=msg.get("language") or hass.config.language,
        rooms=list(entry.options.get(CONF_ROOMS) or []),
        circuits=list(entry.options.get(CONF_CIRCUITS) or []),
        sources=sources,
        history=history,
        changes=changes,
        inventory=inventory,
        to_local_day=lambda value: local_day(value, _to_day),
        generated=dt_util.now(),
    )
    result["configured"] = True
    result["last_update_success"] = bool(runtime.coordinator.last_update_success)
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/dashboard/status"})
@websocket_api.async_response
async def ws_dashboard_status(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Soll das Frontend das Dashboard anlegen? Nur einmal je Installation."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_result(msg["id"], {"wanted": False})
        return
    state = await runtime.store.async_dashboard()
    connection.send_result(
        msg["id"],
        {
            "wanted": not state.get("handled"),
            "url_path": DASHBOARD_PATH,
            "title": runtime.entry.title,
            "icon": DASHBOARD_ICON,
            "entry_id": runtime.entry.entry_id,
        },
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/dashboard/mark", vol.Optional("url_path"): str, vol.Optional("created"): bool}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_dashboard_mark(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Merken, dass das Dashboard angelegt (oder bewusst nicht angelegt) wurde."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    await runtime.store.async_mark_dashboard(url_path=msg.get("url_path"), created=bool(msg.get("created")))
    connection.send_result(msg["id"], {"ok": True})
