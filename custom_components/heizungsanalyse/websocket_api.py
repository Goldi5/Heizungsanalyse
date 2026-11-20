"""Websocket-Befehle für das Dashboard. Rein lesend bis auf das eigene Dashboard-Merkzeichen."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util import dt as dt_util
import voluptuous as vol

from .analysis.curve_suggestion import suggest_curve
from .analysis.periods import merge_samples, samples_from_rollups
from .catalog import inventory_catalog
from .config_validation import coverage, settings_schema, validate_config
from .const import (
    CARD_URL,
    CONF_CIRCUITS,
    CONF_CO2_FACTOR,
    CONF_ENERGY_PRICE,
    CONF_ROOMS,
    CONF_THRESHOLDS,
    DASHBOARD_ICON,
    DASHBOARD_PATH,
    DOMAIN,
    INVENTORY_FIELDS,
    MANDATORY_SOURCES,
    OPTIONAL_SOURCES,
    VERSION,
)
from .devices import build_devices
from .diagnostics import async_build_diagnostics
from .inventory_io import export_csv, parse_csv, validate_import
from .inventory_schema import build_schema, completeness, validate_values
from .plant import build_datasheet
from .services import async_apply_inventory, async_remove_inventory
from .summary import build_summary, local_day

_LOGGER = logging.getLogger(__name__)


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
    websocket_api.async_register_command(hass, ws_config_get)
    websocket_api.async_register_command(hass, ws_config_set)
    websocket_api.async_register_command(hass, ws_inventory_schema)
    websocket_api.async_register_command(hass, ws_inventory_catalog)
    websocket_api.async_register_command(hass, ws_inventory_save)
    websocket_api.async_register_command(hass, ws_inventory_remove)
    websocket_api.async_register_command(hass, ws_inventory_export)
    websocket_api.async_register_command(hass, ws_inventory_import)
    websocket_api.async_register_command(hass, ws_suggest_curve)
    websocket_api.async_register_command(hass, ws_status)
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
    energy_price = runtime.entry.options.get(CONF_ENERGY_PRICE)
    co2_factor = runtime.entry.options.get(CONF_CO2_FACTOR)
    rooms = list(entry.options.get(CONF_ROOMS) or [])
    circuits = list(entry.options.get(CONF_CIRCUITS) or [])
    result = build_summary(
        snapshot,
        version=VERSION,
        title=entry.title,
        language=msg.get("language") or hass.config.language,
        rooms=rooms,
        circuits=circuits,
        sources=sources,
        history=history,
        changes=changes,
        inventory=inventory,
        to_local_day=lambda value: local_day(value, _to_day),
        generated=dt_util.now(),
        energy_price=energy_price,
        co2_factor=co2_factor,
    )
    result["configured"] = True
    result["last_update_success"] = bool(runtime.coordinator.last_update_success)
    result["inventory_schema"] = build_schema(rooms, circuits)
    result["inventory_catalog"] = inventory_catalog()
    result["inventory_completeness"] = completeness(inventory)
    result["settings_schema"] = settings_schema()
    result["settings_coverage"] = coverage(entry.data, entry.options)
    try:
        result["operation"] = runtime.coordinator.operation_summary()
        result["devices"] = build_devices(hass, dict(entry.data), dict(entry.options))
        result["entities"] = _live_entities(runtime.coordinator, entry)
    except Exception as err:  # noqa: BLE001 - Zusatzdaten dürfen die Übersicht nie verhindern
        _LOGGER.debug("Betrieb/Geräte nicht lesbar: %s", err)
    try:
        result["datasheet"] = build_datasheet(
            hass, dict(entry.data), dict(entry.options), result["series"], result["kpis"].get("hydraulics") or {}
        )
    except Exception as err:  # noqa: BLE001 - Herstellerdaten sind Zusatz
        _LOGGER.debug("Herstellerdaten nicht verknüpfbar: %s", err)
    connection.send_result(msg["id"], result)


def _live_entities(coordinator: Any, entry: Any) -> dict[str, Any]:
    """Welche Entities das Fließbild live liest (nur Namen, keine Werte)."""
    options = entry.options
    circuits = {}
    for circuit in options.get(CONF_CIRCUITS) or []:
        target, _inferred = coordinator.circuit_target(circuit)
        circuits[str(circuit.get("id"))] = {
            "temp": circuit.get("temperature_entity"),
            "target": target,
            "pump": circuit.get("pump_entity"),
            "mixer_open": circuit.get("mixer_open_entity"),
            "mixer_close": circuit.get("mixer_close_entity"),
        }
    return {
        "compressor": entry.data.get("compressor_entity"),
        "outdoor": entry.data.get("outdoor_entity"),
        "hp_flow": options.get("hp_flow_entity"),
        "hp_return": options.get("return_entity"),
        "volume": options.get("volume_flow_entity"),
        "power_now": options.get("power_now_entity"),
        "buffer": options.get("buffer_entity") or options.get("flow_entity"),
        "buffer_target": options.get("target_flow_entity"),
        "dhw_temp": options.get("dhw_temp_entity"),
        "dhw_target": options.get("dhw_target_entity"),
        "dhw_op": options.get("dhw_operation_entity"),
        "dhw_pump": options.get("dhw_pump_entity"),
        "dhw_circ": options.get("dhw_circulation_entity"),
        "defrost": options.get("defrost_entity"),
        "aux": options.get("aux_heater_entity"),
        "circuits": circuits,
    }


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


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config"})
@websocket_api.async_response
async def ws_config_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Konfiguration lesen (Quellen, Kreise, Räume, Schwellen)."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    entry = runtime.entry
    connection.send_result(
        msg["id"],
        {
            "data": dict(entry.data),
            "options": dict(entry.options),
            "circuits": list(entry.options.get(CONF_CIRCUITS) or []),
            "rooms": list(entry.options.get(CONF_ROOMS) or []),
            "thresholds": dict(entry.options.get(CONF_THRESHOLDS) or {}),
            "schema": settings_schema(),
            "coverage": coverage(entry.data, entry.options),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/config/save",
        vol.Optional("data"): dict,
        vol.Optional("options"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_config_set(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Konfiguration schreiben und neu laden. Nur Admin."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    entry = runtime.entry
    new_data = dict(entry.data)
    if msg.get("data"):
        new_data.update(msg["data"])
    new_options = dict(entry.options)
    if msg.get("options"):
        new_options.update(msg["options"])
    errors = validate_config(new_data, new_options, hass, previous={**entry.data, **entry.options})
    if errors:
        connection.send_result(msg["id"], {"ok": False, "errors": errors})
        return
    hass.config_entries.async_update_entry(entry, data=new_data, options=new_options)
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/inventory/schema"})
@websocket_api.async_response
async def ws_inventory_schema(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Feldschema, Bestand und Vollständigkeit des Inventars."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    entry = runtime.entry
    rooms = list(entry.options.get(CONF_ROOMS) or [])
    circuits = list(entry.options.get(CONF_CIRCUITS) or [])
    inventory = await runtime.store.async_inventory()
    connection.send_result(
        msg["id"],
        {
            "schema": build_schema(rooms, circuits),
            "inventory": inventory,
            "rooms": rooms,
            "circuits": circuits,
            "completeness": completeness(inventory),
        },
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/inventory/catalog"})
@websocket_api.async_response
async def ws_inventory_catalog(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Herstellerkatalog für Pumpen und Thermostatventile."""
    connection.send_result(msg["id"], inventory_catalog())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/inventory/save",
        vol.Required("object"): str,
        vol.Required("values"): dict,
        vol.Optional("note"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_inventory_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Ein Inventar-Objekt speichern; Feldfehler einzeln zurückmelden."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    entry = runtime.entry
    object_id = str(msg["object"])
    section = object_id.partition(".")[0]
    if section not in INVENTORY_FIELDS:
        connection.send_result(msg["id"], {"ok": False, "errors": {"object": "section"}})
        return
    values = dict(msg["values"])
    errors = validate_values(
        section,
        values,
        rooms=list(entry.options.get(CONF_ROOMS) or []),
        circuits=list(entry.options.get(CONF_CIRCUITS) or []),
    )
    if errors:
        connection.send_result(msg["id"], {"ok": False, "errors": errors})
        return
    try:
        changes = await async_apply_inventory(runtime, object_id, values, note=msg.get("note"))
    except ServiceValidationError as err:
        connection.send_result(msg["id"], {"ok": False, "errors": {"object": str(err)}})
        return
    connection.send_result(msg["id"], {"ok": True, "changed": len(changes)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/inventory/remove",
        vol.Required("object"): str,
        vol.Optional("note"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_inventory_remove(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Ein Inventar-Objekt löschen (mit Protokolleintrag)."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    try:
        change = await async_remove_inventory(runtime, str(msg["object"]), note=msg.get("note"))
    except ServiceValidationError as err:
        connection.send_result(msg["id"], {"ok": False, "errors": {"object": str(err)}})
        return
    connection.send_result(msg["id"], {"ok": True, "change": change})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/inventory/export"})
@websocket_api.async_response
async def ws_inventory_export(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Inventar als CSV zum Herunterladen."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    inventory = await runtime.store.async_inventory()
    connection.send_result(msg["id"], {"csv": export_csv(inventory), "filename": "inventar.csv"})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/inventory/import",
        vol.Required("csv"): str,
        vol.Optional("replace"): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_inventory_import(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Inventar aus CSV übernehmen; Zeilen- und Feldfehler je Objekt melden."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    entry = runtime.entry
    grouped, row_errors = parse_csv(str(msg["csv"]))
    rooms = list(entry.options.get(CONF_ROOMS) or [])
    circuits = list(entry.options.get(CONF_CIRCUITS) or [])
    problems = validate_import(grouped, rooms=rooms, circuits=circuits)
    imported = 0
    if msg.get("replace"):
        inventory = await runtime.store.async_inventory()
        for section in INVENTORY_FIELDS:
            if section == "hydraulics":
                await runtime.store.async_remove_inventory_item(section, note="CSV-Import")
                continue
            for key in list(inventory.get(section) or {}):
                await runtime.store.async_remove_inventory_item(f"{section}.{key}", note="CSV-Import")
    for object_id, values in grouped.items():
        if object_id in problems:
            continue
        section = object_id.partition(".")[0]
        clean = {field: value for field, value in values.items() if field in INVENTORY_FIELDS[section]}
        if not clean:
            continue
        try:
            await async_apply_inventory(runtime, object_id, clean, note="CSV-Import")
        except ServiceValidationError:
            continue
        imported += 1
    connection.send_result(
        msg["id"],
        {"ok": not row_errors and not problems, "imported": imported, "errors": problems, "rows": row_errors},
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/suggest_curve"})
@websocket_api.async_response
async def ws_suggest_curve(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Heizkurvenvorschlag aus Vorlauf-Abweichung."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    hours = getattr(runtime.coordinator, "_flow_hours", []) or []
    suggestion = suggest_curve(hours)
    connection.send_result(msg["id"], {"suggestion": suggestion.as_dict()})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/status"})
@websocket_api.async_response
async def ws_status(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Minimaler Status fuer das Protokoll (kein Admin noetig)."""
    runtime = _runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_setup", "Heizungsanalyse ist nicht eingerichtet")
        return
    snapshot = runtime.coordinator.data
    data = hass.data.get("lovelace")
    resources = getattr(data, "resources", None)
    mode = "yaml" if resources is None or getattr(data, "resource_mode", "storage") != "storage" else "storage"
    card_version = None
    if resources is not None and mode == "storage":
        try:
            for item in resources.async_items():
                url = str(item.get("url", ""))
                if url.split("?")[0] == CARD_URL:
                    card_version = url.split("?v=", 1)[1].split("-", 1)[0] if "?v=" in url else None
                    break
        except Exception:  # noqa: BLE001
            card_version = None
    storage = runtime.coordinator.runtime_diagnostics()
    rollups = await runtime.store.async_rollups()
    log_entries = await runtime.log.async_last_hours(48)
    from .diagnostics import source_checks as _checks

    source_checks = await _checks(hass, runtime.coordinator)
    connection.send_result(
        msg["id"],
        {
            "versions": {
                "integration": VERSION,
                "homeassistant": getattr(__import__("homeassistant.const", fromlist=["__version__"]), "__version__", None),
                "card": {"version": card_version, "backend": VERSION, "matches": card_version == VERSION if card_version else None},
            },
            "runtime": {
                "run_index": storage.get("run_index", 0),
                "last_duration_ms": storage.get("last_duration_ms", 0),
                "next_run": storage.get("next_run"),
                "last_update_success": storage.get("last_update_success", True),
                "last_error": storage.get("last_error"),
            },
            "storage": {"rollups": len(rollups), "log_entries": len(log_entries)},
            "summary": {"kpis": {"days_with_data": snapshot.days_with_data}},
            "source_checks": source_checks,
            "log": log_entries,
        },
    )
