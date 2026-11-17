"""Heizungsanalyse - rein beobachtende Auswertung einer Wärmepumpenheizung.

Die Integration liest ausschließlich vorhandene Home-Assistant-Zustände und
Recorder-Statistiken. Es gibt keinen Codepfad, der Fremd-Entities steuert.
"""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, PLATFORMS, VERSION
from .coordinator import HeizungsanalyseCoordinator
from .debug_log import get_trace, install_debug_trace
from .event_log import EventLog
from .frontend import async_register_frontend, log_dashboard_state
from .services import async_setup_services
from .storage import InventoryStore
from .websocket_api import async_register as async_register_websocket

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type HeizungsanalyseConfigEntry = ConfigEntry[HeizungsanalyseRuntime]


@dataclass(slots=True)
class HeizungsanalyseRuntime:
    """Laufzeitobjekt eines Konfigurationseintrags."""

    hass: HomeAssistant
    entry: ConfigEntry
    coordinator: HeizungsanalyseCoordinator
    store: InventoryStore
    log: EventLog


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Dienste, Websocket-Befehle und Dashboard-Karten einmalig registrieren."""
    await async_setup_services(hass)
    async_register_websocket(hass)
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HeizungsanalyseConfigEntry) -> bool:
    """Einen Konfigurationseintrag einrichten."""
    store = InventoryStore(hass, entry.entry_id)
    await store.async_load()

    log = EventLog(store)
    await log.async_load()
    await log.async_start()

    trace = install_debug_trace(hass, store)
    await trace.async_load()

    coordinator = HeizungsanalyseCoordinator(hass, entry, log=log, store=store)
    await coordinator.async_config_entry_first_refresh()

    await store.async_save_rollups(coordinator.data.samples)
    await coordinator.async_log_config(await store.async_config_snapshot())
    await store.async_set_config_snapshot(coordinator.config_state())

    entry.runtime_data = HeizungsanalyseRuntime(hass=hass, entry=entry, coordinator=coordinator, store=store, log=log)
    await log_dashboard_state(hass, log, entry)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    def _persist_rollups() -> None:
        hass.async_create_task(store.async_save_rollups(coordinator.data.samples))

    entry.async_on_unload(coordinator.async_add_listener(_persist_rollups))
    entry.async_on_unload(_stop_logging(store, log, trace))
    return True


def _stop_logging(store: InventoryStore, log: EventLog, trace) -> object:
    """Beim Entladen: offene Puffer sichern, Spur stoppen."""

    async def _stop() -> None:
        trace.uninstall()
        await trace.async_save()
        await log.async_flush()
        await store.async_flush()

    return _stop


async def async_unload_entry(hass: HomeAssistant, entry: HeizungsanalyseConfigEntry) -> bool:
    """Einen Konfigurationseintrag entladen."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


__all__ = [
    "DOMAIN",
    "HeizungsanalyseConfigEntry",
    "HeizungsanalyseRuntime",
    "VERSION",
    "async_setup",
    "async_setup_entry",
    "async_unload_entry",
    "get_trace",
]
