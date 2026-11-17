"""Konfigurationsdialog.

M0 legt nur den Eintrag an. Das Entity-Mapping, die Heizkreise und die Raeume
folgen in M1 als Optionsdialog (siehe docs/architecture.md).
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN, NAME


class HeizungsanalyseConfigFlow(ConfigFlow, domain=DOMAIN):
    """Einmalige Einrichtung der Analyse."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Eintrag anlegen; Quellen werden spaeter im Optionsdialog gemappt."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title=NAME, data={})
