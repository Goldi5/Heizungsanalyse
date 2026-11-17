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
from .diagnostics import async_build_diagnostics
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
    websocket_api.async_register_command(hass, ws_log)
    websocket_api.async_register_command(hass, ws_diagnostics)
    websocket_api.async_register_command(hass, ws_trace)


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
    created = bool(msg.get("created"))
    await runtime.store.async_mark_dashboard(url_path=msg.get("url_path"), created=created)
    path = msg.get("url_path") or DASHBOARD_PATH
    key = "dashboard.created" if created else "dashboard.exists"
    await runtime.log.async_add(
        "info",
        "dashboard",
        f"Dashboard {path} angelegt" if created else f"Dashboard {path} bereits vorhanden",
        key=key,
        params={"path": path},
        details={"url_path": path, "created": created},
    )
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/log",
        vol.Optional("since"): str,
        vol.Optional("level"): vol.In(["info", "warn", "error"]),
        vol.Optional("cat"): str,
        vol.Optional("q"): str,
        vol.Optional("limit", default=200): vol.All(int, vol.Range(min=1, max=2000)),
    }
)
@websocket_api.async_response
async def ws_log(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Protokoll filtern; neueste zuerst."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    since = None
    if msg.get("since"):
        parsed = dt_util.parse_datetime(str(msg["since"]))
        if parsed is None:
            connection.send_error(msg["id"], "invalid_since", "since muss ein ISO-Zeitpunkt sein")
            return
        since = dt_util.as_utc(parsed)
    rows = await runtime.log.async_query(
        since=since,
        level=msg.get("level"),
        cat=msg.get("cat"),
        q=msg.get("q") or "",
        limit=int(msg.get("limit", 200)),
    )
    connection.send_result(msg["id"], {"entries": rows, "count": len(rows)})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/diagnostics", vol.Optional("language"): str})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_diagnostics(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Diagnose wie beim Download, nur für Admins."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    data = await async_build_diagnostics(hass, runtime.entry)
    connection.send_result(msg["id"], data)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/trace",
        vol.Required("message"): vol.All(str, vol.Length(min=1, max=500)),
        vol.Optional("version"): str,
        vol.Optional("ua"): str,
    }
)
@websocket_api.async_response
async def ws_trace(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Die Karte meldet einen eigenen Fehler (höchstens 20/min)."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    now = dt_util.utcnow().timestamp()
    key = f"{DOMAIN}.trace.{connection.user.id if connection.user else 'anonymous'}"
    times = hass.data.setdefault(key, [])
    times[:] = [stamp for stamp in times if now - stamp < 60]
    if len(times) >= 20:
        connection.send_result(msg["id"], {"dropped": True})
        return
    times.append(now)
    await runtime.log.async_add(
        "warn",
        "frontend",
        f"Karte meldet: {msg['message']}",
        key="frontend.error",
        params={"message": msg["message"]},
        details={
            "version": msg.get("version"),
            "ua": (msg.get("ua") or "")[:120],
        },
    )
    connection.send_result(msg["id"], {"ok": True})
