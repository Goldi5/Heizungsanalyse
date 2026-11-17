"""Bericht als Markdown und JSON (ohne Home Assistant)."""

from __future__ import annotations

import json

from hz.report import render_json, render_markdown

METRICS = {"days": 14, "cop": 3.8, "heat_kwh": 1294.0, "power_kwh": 340.0, "starts_per_day": 9.9}


def test_markdown_has_sections() -> None:
    text = render_markdown(
        title="Heizungsanalyse",
        metrics=METRICS,
        inventory={"pumps": {"hk2": {"setting": "Stufe 2"}}, "thermostats": {}, "hydraulics": {}},
        changes=[
            {
                "ts": "2026-11-17T10:00:00+00:00",
                "object": "pumps.hk2",
                "field": "setting",
                "old": "Stufe 1",
                "new": "Stufe 2",
                "note": "Test",
            }
        ],
    )

    assert "# Heizungsanalyse" in text
    assert "## Kennzahlen" in text
    assert "| COP | 3.8 |" in text
    assert "pumps.hk2" in text
    assert "Stufe 1" in text


def test_markdown_handles_unknown_and_empty() -> None:
    text = render_markdown(
        title="Test",
        metrics={"days": 0, "cop": None},
        inventory={"pumps": {}, "thermostats": {}, "hydraulics": {}},
        changes=[],
    )

    assert "unbekannt" in text
    assert "Keine Stammdaten erfasst." in text
    assert "Keine Aenderungen protokolliert." in text


def test_json_roundtrip() -> None:
    body = render_json(
        metrics=METRICS,
        inventory={"pumps": {}, "thermostats": {}, "hydraulics": {}},
        changes=[],
        findings=[{"id": "F01", "severity": "warning"}],
    )

    data = json.loads(body)

    assert data["metrics"]["cop"] == 3.8
    assert data["findings"][0]["id"] == "F01"


def test_plant_sheet_has_sections() -> None:
    from hz.report import render_plant_sheet

    text = render_plant_sheet(
        title="Heizungsanalyse",
        sources={"power_entity": "sensor.wp_strom"},
        circuits=[{"id": "hk1", "name": "HK1", "type": "buffer", "has_pump": True, "has_mixer": False, "rooms": ["Bad"]}],
        rooms=[{"id": "bad", "name": "Bad", "circuit": "hk1", "climate_entity": "climate.bad", "valve_available": True}],
        inventory={"pumps": {"p1": {"model": "X"}}, "radiators": {"r1": {"circuit": "hk1", "room": "bad", "valve_preset": 3}}, "thermostats": {}, "hydraulics": {}},
        metrics=METRICS,
        findings=[],
        thresholds={"flow_deviation_k": 2.0},
    )

    assert "# Heizungsanalyse – Anlagenblatt" in text
    assert "## Heizkreise" in text
    assert "## Räume" in text
    assert "## Pumpen" in text
    assert "## Heizkörper" in text
    assert "valve_preset" not in text
    assert "r1" in text
