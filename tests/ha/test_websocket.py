"""Websocket-Befehle des Dashboards und Auslieferung der Kartendatei."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from custom_components.heizungsanalyse.const import CARD_URL, DASHBOARD_PATH, DOMAIN

from .test_services import _setup


async def test_summary_returns_dashboard_data(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/summary", "language": "de"})
    msg = await client.receive_json()
    assert msg["success"], msg
    result = msg["result"]
    assert result["configured"] is True
    assert result["kpis"]["cop_short"]["value"] is not None
    assert len(result["series"]) >= 7
    assert {"score", "findings", "rooms", "circuits", "changes", "inventory", "missing"} <= result.keys()


async def test_summary_without_setup(hass: HomeAssistant, hass_ws_client) -> None:
    from homeassistant.setup import async_setup_component

    assert await async_setup_component(hass, DOMAIN, {})
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/summary"})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["configured"] is False


async def test_dashboard_wanted_once(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/dashboard/status"})
    msg = await client.receive_json()
    assert msg["result"]["wanted"] is True
    assert msg["result"]["url_path"] == DASHBOARD_PATH

    await client.send_json({"id": 2, "type": f"{DOMAIN}/dashboard/mark", "url_path": DASHBOARD_PATH, "created": True})
    assert (await client.receive_json())["success"]

    await client.send_json({"id": 3, "type": f"{DOMAIN}/dashboard/status"})
    assert (await client.receive_json())["result"]["wanted"] is False


async def test_card_file_is_served(hass: HomeAssistant) -> None:
    from types import SimpleNamespace

    from custom_components.heizungsanalyse.frontend import CardView

    request = SimpleNamespace(app={"hass": hass})
    response = await CardView().get(request)
    assert response.status == 200
    assert "heizungsanalyse-card" in response.text
    assert response.headers["Cache-Control"].startswith("no-store")
    assert CARD_URL.endswith("heizungsanalyse-card.js")


async def test_config_roundtrip(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass) if False else None
    from .test_services import _setup as setup
    await setup(hass)
    client = await hass_ws_client(hass)

    await client.send_json({"id": 1, "type": f"{DOMAIN}/config"})
    msg = await client.receive_json()
    assert msg["success"]
    assert "data" in msg["result"] and "options" in msg["result"]
    assert msg["result"]["data"]["power_entity"] == "sensor.wp_strom"

    await client.send_json({"id": 2, "type": f"{DOMAIN}/config/save", "options": {"thresholds": {"starts_per_day": 7}}})
    assert (await client.receive_json())["success"]

    await client.send_json({"id": 3, "type": f"{DOMAIN}/config"})
    assert (await client.receive_json())["result"]["thresholds"]["starts_per_day"] == 7
