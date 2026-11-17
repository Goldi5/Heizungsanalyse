"""Protokoll, Diagnose und Trace über den Websocket."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.heizungsanalyse.const import (
    CONF_COMPRESSOR_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_THRESHOLDS,
    DOMAIN,
)

MANDATORY = {
    CONF_POWER_ENTITY: "sensor.wp_strom",
    CONF_HEAT_ENTITY: "sensor.wp_waerme",
    CONF_OUTDOOR_ENTITY: "sensor.aussentemperatur",
    CONF_COMPRESSOR_ENTITY: "binary_sensor.verdichter",
}


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, data=MANDATORY, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    with (
        patch("custom_components.heizungsanalyse.coordinator.async_read_daily", new=AsyncMock(return_value={})),
        patch("custom_components.heizungsanalyse.coordinator.async_read_hourly", new=AsyncMock(return_value={})),
    ):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    return entry


async def test_log_has_restart_marker_and_filters(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    client = await hass_ws_client(hass)

    await client.send_json({"id": 1, "type": f"{DOMAIN}/log"})
    result = (await client.receive_json())["result"]
    assert result["count"] >= 1
    assert any(entry["cat"] == "start" and "Neustart" in entry["msg"] for entry in result["entries"])

    await client.send_json({"id": 2, "type": f"{DOMAIN}/log", "cat": "start"})
    filtered = (await client.receive_json())["result"]
    assert filtered["count"] == 1
    assert filtered["entries"][0]["cat"] == "start"

    await client.send_json({"id": 3, "type": f"{DOMAIN}/log", "level": "error"})
    assert (await client.receive_json())["result"]["count"] == 0

    await client.send_json({"id": 4, "type": f"{DOMAIN}/log", "q": "Neustart"})
    assert (await client.receive_json())["result"]["count"] == 1

    await client.send_json({"id": 5, "type": f"{DOMAIN}/log", "since": "nicht-iso"})
    assert (await client.receive_json())["success"] is False


async def test_log_after_source_unavailable(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    client = await hass_ws_client(hass)

    hass.states.async_set(MANDATORY[CONF_POWER_ENTITY], "unavailable")
    await hass.async_block_till_done()
    coordinator = hass.config_entries.async_entries(DOMAIN)[0].runtime_data.coordinator
    with (
        patch("custom_components.heizungsanalyse.coordinator.async_read_daily", new=AsyncMock(return_value={})),
        patch("custom_components.heizungsanalyse.coordinator.async_read_hourly", new=AsyncMock(return_value={})),
    ):
        await coordinator.async_refresh()
        await hass.async_block_till_done()

    await client.send_json({"id": 1, "type": f"{DOMAIN}/log", "cat": "source"})
    rows = (await client.receive_json())["result"]["entries"]
    assert rows
    assert any("nicht verfügbar" in row["msg"] for row in rows)


async def test_log_after_config_change(hass: HomeAssistant, hass_ws_client) -> None:
    entry = await _setup(hass)
    client = await hass_ws_client(hass)

    hass.config_entries.async_update_entry(
        entry,
        options={**entry.options, CONF_THRESHOLDS: {"starts_per_day": 9}},
    )
    with (
        patch("custom_components.heizungsanalyse.coordinator.async_read_daily", new=AsyncMock(return_value={})),
        patch("custom_components.heizungsanalyse.coordinator.async_read_hourly", new=AsyncMock(return_value={})),
    ):
        await hass.config_entries.async_reload(entry.entry_id)
        await hass.async_block_till_done()

    await client.send_json({"id": 1, "type": f"{DOMAIN}/log", "cat": "config"})
    rows = (await client.receive_json())["result"]["entries"]
    assert any(row["key"] == "config.thresholds" for row in rows), rows
    assert any("starts_per_day" in row["msg"] and "→" in row["msg"] for row in rows), rows


async def test_diagnostics_admin_only(hass: HomeAssistant, hass_ws_client, hass_read_only_access_token: str) -> None:
    await _setup(hass)
    admin = await hass_ws_client(hass)
    await admin.send_json({"id": 1, "type": f"{DOMAIN}/diagnostics"})
    result = (await admin.receive_json())["result"]
    for key in ("versions", "config", "source_checks", "summary", "storage", "runtime", "log", "trace"):
        assert key in result

    reader = await hass_ws_client(hass, access_token=hass_read_only_access_token)
    await reader.send_json({"id": 1, "type": f"{DOMAIN}/diagnostics"})
    response = await reader.receive_json()
    assert response["success"] is False


async def test_trace_rate_limited(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    client = await hass_ws_client(hass)

    dropped = 0
    for index in range(22):
        await client.send_json(
            {"id": index + 1, "type": f"{DOMAIN}/trace", "message": f"summary failed {index}", "version": "0.3.0", "ua": "Test"}
        )
        response = await client.receive_json()
        dropped += 1 if response["result"].get("dropped") else 0
    assert dropped == 2

    await client.send_json({"id": 99, "type": f"{DOMAIN}/log", "cat": "frontend"})
    rows = (await client.receive_json())["result"]["entries"]
    assert rows
    assert rows[0]["key"] == "frontend.error"
    assert "Test" in str(rows[0]["details"])


async def test_log_survives_reload(hass: HomeAssistant, hass_ws_client) -> None:
    entry = await _setup(hass)
    with (
        patch("custom_components.heizungsanalyse.coordinator.async_read_daily", new=AsyncMock(return_value={})),
        patch("custom_components.heizungsanalyse.coordinator.async_read_hourly", new=AsyncMock(return_value={})),
    ):
        assert await hass.config_entries.async_unload(entry.entry_id)
        await hass.async_block_till_done()
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/log", "cat": "start"})
    rows = (await client.receive_json())["result"]["entries"]
    assert len(rows) >= 2
    assert all("Neustart" in row["msg"] for row in rows)


async def test_refresh_service_recalculates(hass: HomeAssistant) -> None:
    await _setup(hass)
    coordinator = hass.config_entries.async_entries(DOMAIN)[0].runtime_data.coordinator
    calls = {"n": 0}

    async def _refresh() -> None:
        calls["n"] += 1

    coordinator.async_request_refresh = _refresh
    response = await hass.services.async_call(DOMAIN, "refresh", {}, blocking=True, return_response=True)
    assert response["ok"] is True
    assert calls["n"] == 1


async def test_inventory_change_is_logged(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    await hass.services.async_call(
        DOMAIN,
        "update_inventory",
        {"object": "pumps.hk2", "values": {"manufacturer": "Test", "setting": "Stufe 2"}},
        blocking=True,
    )
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/log", "cat": "inventory"})
    rows = (await client.receive_json())["result"]["entries"]
    assert any(row["key"] == "inventory.updated" for row in rows)
    assert any("pumps.hk2" in row["msg"] for row in rows)


async def test_dashboard_state_is_logged(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/dashboard/status"})
    await client.receive_json()
    await client.send_json({"id": 2, "type": f"{DOMAIN}/dashboard/mark", "url_path": "heizungsanalyse", "created": True})
    assert (await client.receive_json())["success"]

    await client.send_json({"id": 3, "type": f"{DOMAIN}/log", "cat": "dashboard"})
    rows = (await client.receive_json())["result"]["entries"]
    assert any(row["key"] == "dashboard.resource" for row in rows)
    assert any(row["key"] == "dashboard.created" for row in rows)
