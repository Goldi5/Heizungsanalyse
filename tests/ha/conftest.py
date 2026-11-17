"""Fixtures für die Integrationstests mit Home Assistant."""

from __future__ import annotations

from collections.abc import Generator
from typing import TYPE_CHECKING
from unittest.mock import patch

import pytest

if TYPE_CHECKING:  # ohne HA-Testumgebung wird dieser Ordner gar nicht gesammelt
    from homeassistant.core import HomeAssistant


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Die eigene Integration in jedem Test erlauben."""


@pytest.fixture(autouse=True)
def no_frontend(hass: HomeAssistant) -> Generator[None]:
    """Die Kartendatei braucht das echte Frontend (hass_frontend) – im Test überspringen."""
    hass.config.components.add("frontend")
    with patch("custom_components.heizungsanalyse.async_register_frontend", return_value=None):
        yield
