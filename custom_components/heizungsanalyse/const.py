"""Konstanten der Integration. Bewusst frei von Logik und HA-Aufrufen."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Final


def _read_version() -> str:
    """Version aus der manifest.json neben diesem Modul."""
    try:
        raw = (Path(__file__).parent / "manifest.json").read_text(encoding="utf-8")
        return str(json.loads(raw).get("version") or "0")
    except (OSError, ValueError):  # pragma: no cover - nur bei kaputter Installation
        return "0"


DOMAIN: Final = "heizungsanalyse"
NAME: Final = "Heizungsanalyse"
VERSION: Final = _read_version()

# In M0 noch leer. Ab M2 kommen die Plattformen hier hinein.
PLATFORMS: Final[list[str]] = []
