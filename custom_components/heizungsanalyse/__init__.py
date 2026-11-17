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

type HeizungsanalyseConfigEntry = ConfigEntry[HeizungsanalyseRuntime]


@dataclass(slots=True)
class HeizungsanalyseRuntime:
    """Laufzeitobjekt eines Konfigurationseintrags."""

    hass: HomeAssistant
    entry: ConfigEntry
    coordinator: HeizungsanalyseCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: HeizungsanalyseConfigEntry) -> bool:
    """Einen Konfigurationseintrag einrichten."""
    coordinator = HeizungsanalyseCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = HeizungsanalyseRuntime(hass=hass, entry=entry, coordinator=coordinator)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HeizungsanalyseConfigEntry) -> bool:
    """Einen Konfigurationseintrag entladen."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


__all__ = [
    "DOMAIN",
    "HeizungsanalyseConfigEntry",
    "HeizungsanalyseRuntime",
    "async_setup_entry",
    "async_unload_entry",
]
