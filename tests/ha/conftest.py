"""Fixtures fuer die Integrationstests mit Home Assistant."""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Die eigene Integration in jedem Test erlauben."""
