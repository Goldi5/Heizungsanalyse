"""Reglerwerte verstellen: Erkennung, Grenzen, Admin, Protokoll, Rückgängig."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import async_mock_service

from custom_components.heizungsanalyse import controls as reg
from custom_components.heizungsanalyse.const import DOMAIN

from .test_services import _setup

DHW = "number.stiebel_eltron_wpmsystem_tagbetrieb_warmwasser_temperatursoll"
SLOPE = "number.stiebel_eltron_wpmsystem_heizkurve_steilheit_hk_2"


def _seed(hass: HomeAssistant) -> None:
    hass.states.async_set(DHW, "50.0", {"min": 10, "max": 60, "step": 0.1, "unit_of_measurement": "°C"})
    hass.states.async_set(SLOPE, "0.7", {"min": 0, "max": 3, "step": 0.01})


async def test_discover_and_limits(hass: HomeAssistant) -> None:
    _seed(hass)
    options = {"circuits": [{"id": "hk2", "name": "HK2", "temperature_entity": "sensor.stiebel_eltron_wpmsystem_ist_temperatur_hk_2"}]}
    found = {c["entity"]: c for c in reg.discover(hass, options)}
    assert found[SLOPE]["field"] == "slope"
    assert (found[SLOPE]["min"], found[SLOPE]["max"]) == (0.1, 1.5)  # enger als der Regler erlaubt
    assert found[DHW]["max"] == 60.0
    assert reg.check_value(found[SLOPE], 0.62) == 0.6  # auf 0,05 gerastert
    for bad in (2.0, "x"):
        try:
            reg.check_value(found[SLOPE], bad)
        except ValueError:
            continue
        raise AssertionError(bad)


async def test_set_logs_and_undo(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    _seed(hass)
    calls = async_mock_service(hass, "number", "set_value")
    client = await hass_ws_client(hass)

    await client.send_json({"id": 1, "type": f"{DOMAIN}/control/set", "key": DHW, "value": 48, "confirm": True})
    msg = await client.receive_json()
    assert msg["success"], msg
    record = msg["result"]["record"]
    assert calls[-1].data == {"entity_id": DHW, "value": 48.0}
    assert record["old"] == 50.0 and record["new"] == 48.0

    await client.send_json({"id": 2, "type": f"{DOMAIN}/control/set", "key": DHW, "value": 70, "confirm": True})
    assert (await client.receive_json())["error"]["code"] == "invalid_value"

    await client.send_json({"id": 3, "type": f"{DOMAIN}/control/set", "key": "number.fremd", "value": 1, "confirm": True})
    assert (await client.receive_json())["error"]["code"] == "unknown_control"

    # Regler hat den neuen Wert übernommen → Rückgängig setzt den alten
    hass.states.async_set(DHW, "48.0", {"min": 10, "max": 60})
    await client.send_json({"id": 4, "type": f"{DOMAIN}/control/undo", "change": record["id"]})
    undo = await client.receive_json()
    assert undo["success"], undo
    assert calls[-1].data == {"entity_id": DHW, "value": 50.0}

    # zweites Mal geht nicht mehr
    hass.states.async_set(DHW, "50.0", {"min": 10, "max": 60})
    await client.send_json({"id": 5, "type": f"{DOMAIN}/control/undo", "change": record["id"]})
    assert (await client.receive_json())["error"]["code"] == "undo_closed"

    entry = hass.config_entries.async_entries(DOMAIN)[0]
    log = await entry.runtime_data.store.async_change_log()
    assert [c["note"] for c in log[:2]] == ["rückgängig gemacht", log[1]["note"]]
    assert log[1]["field"] == "Warmwasser-Soll Komfort"


async def test_undo_window() -> None:
    from datetime import timedelta

    from homeassistant.util import dt as dt_util

    record = {"ts": (dt_util.utcnow() - timedelta(hours=25)).isoformat(), "undone": False}
    assert reg.undo_open(record) is False
    record["ts"] = dt_util.utcnow().isoformat()
    assert reg.undo_open(record) is True
    record["undone"] = True
    assert reg.undo_open(record) is False


async def test_external_change_is_logged(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    store = entry.runtime_data.store
    labels = {DHW: "Warmwasser-Soll Komfort"}
    await store.async_watch_controls({DHW: 50.0}, labels)  # erster Stand: nichts protokollieren
    before = len(await store.async_change_log())
    await store.async_watch_controls({DHW: 50.0}, labels)
    await store.async_watch_controls({DHW: 55.0}, labels)
    log = await store.async_change_log()
    assert len(log) == before + 1
    assert log[0]["old"] == 50.0 and log[0]["new"] == 55.0
    assert "außerhalb" in log[0]["note"]
