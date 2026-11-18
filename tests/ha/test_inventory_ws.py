"""Websocket-Inventar: Schema, Prüfung, Löschen, CSV und Feldfehler."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from custom_components.heizungsanalyse.const import DOMAIN

from .test_services import _setup


async def _client(hass: HomeAssistant, hass_ws_client):
    await _setup(hass)
    return await hass_ws_client(hass)


async def test_inventory_schema_lists_all_sections(hass: HomeAssistant, hass_ws_client) -> None:
    client = await _client(hass, hass_ws_client)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/inventory/schema"})
    msg = await client.receive_json()
    assert msg["success"], msg
    result = msg["result"]
    sections = result["schema"]["sections"]
    assert {"pumps", "thermostats", "hydraulics", "radiators"} <= sections.keys()
    keys = [field["key"] for field in sections["radiators"]["fields"]]
    assert "valve_preset" in keys
    for field in sections["radiators"]["fields"]:
        assert field["label"]["de"] and field["label"]["en"]
    assert "percent" in result["completeness"]
    for section, info in result["completeness"]["sections"].items():
        assert info["percent"] < 100
        assert info["hint"]["de"] and info["hint"]["en"], section


async def test_inventory_save_rejects_bad_values(hass: HomeAssistant, hass_ws_client) -> None:
    client = await _client(hass, hass_ws_client)
    await client.send_json(
        {
            "id": 1,
            "type": f"{DOMAIN}/inventory/save",
            "object": "pumps.hk2",
            "values": {"power_w": 99999, "control_mode": "quatsch"},
        }
    )
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"]["ok"] is False
    assert msg["result"]["errors"]["power_w"] == "range"
    assert msg["result"]["errors"]["control_mode"] == "option"

    await client.send_json(
        {
            "id": 2,
            "type": f"{DOMAIN}/inventory/save",
            "object": "pumps.hk2",
            "values": {"model": "Alpha2", "power_w": 42, "control_mode": "dp"},
        }
    )
    saved = await client.receive_json()
    assert saved["result"]["ok"] is True
    assert saved["result"]["changed"] == 3

    await client.send_json({"id": 3, "type": f"{DOMAIN}/inventory/schema"})
    inventory = (await client.receive_json())["result"]["inventory"]
    assert inventory["pumps"]["hk2"]["model"] == "Alpha2"


async def test_inventory_remove_writes_log(hass: HomeAssistant, hass_ws_client) -> None:
    client = await _client(hass, hass_ws_client)
    await client.send_json(
        {"id": 1, "type": f"{DOMAIN}/inventory/save", "object": "thermostats.bad", "values": {"model": "X"}}
    )
    await client.receive_json()

    await client.send_json({"id": 2, "type": f"{DOMAIN}/inventory/remove", "object": "thermostats.bad"})
    removed = await client.receive_json()
    assert removed["result"]["ok"] is True

    await client.send_json({"id": 3, "type": f"{DOMAIN}/inventory/schema"})
    inventory = (await client.receive_json())["result"]["inventory"]
    assert "bad" not in inventory.get("thermostats", {})


async def test_inventory_csv_roundtrip(hass: HomeAssistant, hass_ws_client) -> None:
    client = await _client(hass, hass_ws_client)
    await client.send_json(
        {"id": 1, "type": f"{DOMAIN}/inventory/save", "object": "pumps.hk1", "values": {"manufacturer": "Test"}}
    )
    await client.receive_json()

    await client.send_json({"id": 2, "type": f"{DOMAIN}/inventory/export"})
    exported = (await client.receive_json())["result"]
    assert "object,field,value" in exported["csv"]
    assert "pumps.hk1,manufacturer,Test" in exported["csv"]

    csv = "object,field,value\npumps.hk3,manufacturer,Andere\npumps.hk4,power_w,abc\n"
    await client.send_json({"id": 3, "type": f"{DOMAIN}/inventory/import", "csv": csv})
    imported = (await client.receive_json())["result"]
    assert imported["imported"] == 1
    assert "pumps.hk4" in imported["errors"]


async def test_config_save_reports_field_errors(hass: HomeAssistant, hass_ws_client) -> None:
    client = await _client(hass, hass_ws_client)
    await client.send_json(
        {
            "id": 1,
            "type": f"{DOMAIN}/config/save",
            "data": {"power_entity": "sensor.gibt_es_nicht"},
            "options": {
                "circuits": [
                    {"id": "hk1", "name": "A", "type": "radiators"},
                    {"id": "hk1", "name": "B", "type": "radiators"},
                ]
            },
        }
    )
    msg = await client.receive_json()
    assert msg["success"]
    assert msg["result"]["ok"] is False
    errors = msg["result"]["errors"]
    assert errors["power_entity"] == "not_found"
    assert errors["circuits.1.id"] == "duplicate"


async def test_config_save_accepts_valid_change(hass: HomeAssistant, hass_ws_client) -> None:
    hass.states.async_set("sensor.neu", "100", {"unit_of_measurement": "kWh", "state_class": "total"})
    client = await _client(hass, hass_ws_client)
    await client.send_json(
        {
            "id": 1,
            "type": f"{DOMAIN}/config/save",
            "data": {"power_entity": "sensor.neu"},
            "options": {"circuits": [{"id": "hk1", "name": "Kreis", "type": "radiators"}]},
        }
    )
    msg = await client.receive_json()
    assert msg["result"]["ok"] is True, msg
