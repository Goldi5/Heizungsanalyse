"""Repo-weite Konsistenzpruefungen (ohne Home Assistant lauffaehig)."""

from __future__ import annotations

import json
from pathlib import Path
import re

ROOT = Path(__file__).parent.parent
COMPONENT = ROOT / "custom_components" / "heizungsanalyse"


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_manifest_required_fields() -> None:
    """Pflichtfelder fuer hassfest und HACS sind gesetzt."""
    manifest = _read_json(COMPONENT / "manifest.json")

    assert manifest["domain"] == COMPONENT.name
    for key in ("name", "version", "documentation", "issue_tracker", "codeowners", "iot_class"):
        assert manifest.get(key), f"manifest.json ohne {key}"
    assert manifest["iot_class"] == "calculated"
    assert manifest["config_flow"] is True
    assert manifest["requirements"] == []


def test_changelog_top_version_matches_manifest() -> None:
    """Die oberste Changelog-Version entspricht der manifest.json."""
    manifest = _read_json(COMPONENT / "manifest.json")
    lines = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8").splitlines()

    versions = [re.match(r"## (\S+) – ", line) for line in lines]
    top = next(match for match in versions if match)
    assert top.group(1) == manifest["version"]


def test_hacs_name_matches_manifest() -> None:
    """HACS-Anzeigename und Manifestname sind identisch."""
    manifest = _read_json(COMPONENT / "manifest.json")
    hacs = _read_json(ROOT / "hacs.json")

    assert hacs["name"] == manifest["name"]
    assert re.fullmatch(r"\d{4}\.\d+\.\d+", hacs["homeassistant"])


def test_translations_cover_english_and_german() -> None:
    """Beide geforderten Sprachen existieren und teilen die Schluessel."""
    strings = _read_json(COMPONENT / "strings.json")
    de = _read_json(COMPONENT / "translations" / "de.json")
    en = _read_json(COMPONENT / "translations" / "en.json")

    assert strings.keys() == de.keys() == en.keys()
    assert strings["config"]["step"]["user"]["title"] == de["config"]["step"]["user"]["title"]
    assert strings["config"]["step"]["user"]["title"] != en["config"]["step"]["user"]["title"]
