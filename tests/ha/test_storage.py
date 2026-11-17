"""Inventar, Änderungsverlauf und Roll-ups."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.heizungsanalyse.analysis.types import DaySample
from custom_components.heizungsanalyse.storage import InventoryStore


async def test_update_inventory_logs_changes(hass: HomeAssistant) -> None:
    store = InventoryStore(hass, "test_entry")

    changes = await store.async_update_inventory("pumps.hk2", {"setting": "Stufe 2"}, note="Test")

    assert len(changes) == 1
    assert changes[0]["old"] is None
    assert changes[0]["new"] == "Stufe 2"
    assert changes[0]["note"] == "Test"

    inventory = await store.async_inventory()
    assert inventory["pumps"]["hk2"]["setting"] == "Stufe 2"


async def test_unchanged_value_is_not_logged(hass: HomeAssistant) -> None:
    store = InventoryStore(hass, "test_entry")
    await store.async_update_inventory("pumps.hk2", {"setting": "Stufe 2"})

    changes = await store.async_update_inventory("pumps.hk2", {"setting": "Stufe 2"})

    assert changes == []
    assert len(await store.async_change_log()) == 1


async def test_hydraulics_has_no_key(hass: HomeAssistant) -> None:
    store = InventoryStore(hass, "test_entry")

    changes = await store.async_update_inventory("hydraulics", {"buffer_volume_l": 300})

    assert changes[0]["object"] == "hydraulics"
    inventory = await store.async_inventory()
    assert inventory["hydraulics"]["buffer_volume_l"] == 300


async def test_change_log_newest_first(hass: HomeAssistant) -> None:
    store = InventoryStore(hass, "test_entry")
    await store.async_update_inventory("pumps.hk2", {"setting": "Stufe 1"})
    await store.async_update_inventory("pumps.hk2", {"setting": "Stufe 2"})

    log = await store.async_change_log()

    assert log[0]["new"] == "Stufe 2"
    assert log[1]["new"] == "Stufe 1"


async def test_log_change_without_inventory(hass: HomeAssistant) -> None:
    store = InventoryStore(hass, "test_entry")

    change = await store.async_log_change("pumps.hk2", "setting", old_value="Stufe 1", new_value="Stufe 2")

    assert change["old"] == "Stufe 1"
    inventory = await store.async_inventory()
    assert inventory["pumps"] == {}


async def test_rollups_persist_and_skip_today(hass: HomeAssistant) -> None:
    store = InventoryStore(hass, "test_entry")
    today = dt_util.now().date()
    yesterday = today - timedelta(days=1)

    await store.async_save_rollups(
        [
            DaySample(day=today, heat_kwh=10.0),
            DaySample(day=yesterday, heat_kwh=90.0, power_kwh=24.0),
        ]
    )

    rollups = await store.async_rollups()

    assert today.isoformat() not in rollups
    assert rollups[yesterday.isoformat()]["heat_kwh"] == 90.0


async def test_data_survives_reload(hass: HomeAssistant) -> None:
    first = InventoryStore(hass, "test_entry")
    await first.async_update_inventory("pumps.hk2", {"model": "Testpumpe"})

    second = InventoryStore(hass, "test_entry")
    inventory = await second.async_inventory()

    assert inventory["pumps"]["hk2"]["model"] == "Testpumpe"


async def test_loads_version_1_data_from_0_2(hass: HomeAssistant, hass_storage) -> None:
    """Speicher aus 0.2.x (Version 1) wird übernommen, statt den Start abzubrechen."""
    hass_storage["heizungsanalyse.entry_v1"] = {
        "version": 1,
        "minor_version": 1,
        "key": "heizungsanalyse.entry_v1",
        "data": {
            "inventory": {"pumps": {"hk1": {"setting": "Stufe 2"}}},
            "change_log": [{"ts": "2026-11-10T08:00:00+00:00", "object": "hydraulics", "field": "kurve"}],
            "rollups": {"2026-11-10": {"heat_kwh": 80.0}},
        },
    }
    store = InventoryStore(hass, "entry_v1")

    data = await store.async_load()

    assert data["inventory"]["pumps"]["hk1"]["setting"] == "Stufe 2"
    assert len(data["change_log"]) == 1
    assert "2026-11-10" in data["rollups"]
