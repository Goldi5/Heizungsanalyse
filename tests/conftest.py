"""Testkonfiguration.

Die Analyseschicht ist frei von Home-Assistant-Importen und wird unter dem
synthetischen Paketnamen ``hz`` geladen - genau wie in raumklima-2 mit ``rk``.
So laufen die reinen Logiktests auch ohne installierte HA-Testumgebung.
"""

from __future__ import annotations

from pathlib import Path
import sys
import types

ROOT = Path(__file__).parent.parent
PKG_DIR = ROOT / "custom_components" / "heizungsanalyse"

pkg = types.ModuleType("hz")
pkg.__path__ = [str(PKG_DIR)]
sys.modules["hz"] = pkg

try:
    import pytest_homeassistant_custom_component  # noqa: F401
except ImportError:
    collect_ignore_glob = ["ha/*"]
else:
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
