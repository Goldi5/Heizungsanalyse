"""Heizungsanalyse - rein beobachtende Auswertung einer Waermepumpenheizung.

Die Integration liest ausschliesslich vorhandene Home-Assistant-Zustaende und
Recorder-Statistiken. Es gibt keinen Codepfad, der Fremd-Entities steuert.
"""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS
from .coordinator import HeizungsanalyseCoordinator
from .services import async_setup_services
from .storage import InventoryStore

type HeizungsanalyseConfigEntry = ConfigEntry[HeizungsanalyseRuntime]


@dataclass(slots=True)
class HeizungsanalyseRuntime:
    """Laufzeitobjekt eines Konfigurationseintrags."""

    hass: HomeAssistant
    entry: ConfigEntry
    coordinator: HeizungsanalyseCoordinator
    store: InventoryStore


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Dienste einmalig beim Start registrieren."""
    await async_setup_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HeizungsanalyseConfigEntry) -> bool:
    """Einen Konfigurationseintrag einrichten."""
    coordinator = HeizungsanalyseCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    store = InventoryStore(hass, entry.entry_id)
    await store.async_load()
    await store.async_save_rollups(coordinator.data.samples)

    entry.runtime_data = HeizungsanalyseRuntime(hass=hass, entry=entry, coordinator=coordinator, store=store)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    def _persist_rollups() -> None:
        hass.async_create_task(store.async_save_rollups(coordinator.data.samples))

    entry.async_on_unload(coordinator.async_add_listener(_persist_rollups))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HeizungsanalyseConfigEntry) -> bool:
    """Einen Konfigurationseintrag entladen."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


__all__ = [
    "DOMAIN",
    "HeizungsanalyseConfigEntry",
    "HeizungsanalyseRuntime",
    "async_setup",
    "async_setup_entry",
    "async_unload_entry",
]
