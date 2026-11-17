"""Die Integration bleibt unabhängig von raumklima-2 und ohne feste Entity-IDs."""

from __future__ import annotations

import ast
from pathlib import Path
import re

COMPONENT = Path(__file__).parent.parent / "custom_components" / "heizungsanalyse"

ENTITY_ID = re.compile(r"\b(?:sensor|binary_sensor|climate|switch|number|select|light)\.[a-z0-9_]+\b")
FORBIDDEN_IMPORTS = ("custom_components.raumklima", "raumklima")


def _source_files() -> list[Path]:
    return sorted(COMPONENT.rglob("*.py"))


def test_no_raumklima_imports() -> None:
    offenders: list[str] = []
    for path in _source_files():
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            names: list[str] = []
            if isinstance(node, ast.Import):
                names = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom) and node.module:
                names = [node.module]
            for name in names:
                if any(name.startswith(forbidden) for forbidden in FORBIDDEN_IMPORTS):
                    offenders.append(f"{path.name}: {name}")
    assert offenders == [], f"Abhaengigkeit auf raumklima gefunden: {offenders}"


def test_no_hardcoded_entity_ids() -> None:
    offenders: list[str] = []
    for path in _source_files():
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            if ENTITY_ID.search(line):
                offenders.append(f"{path.name}:{line_number}")
    assert offenders == [], f"Feste Entity-IDs gefunden: {offenders}"


def test_domain_is_own() -> None:
    from custom_components.heizungsanalyse.const import DOMAIN

    assert DOMAIN == "heizungsanalyse"
    assert DOMAIN != "raumklima"
