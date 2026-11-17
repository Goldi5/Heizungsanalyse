"""Texte der Findings (ohne Home Assistant)."""

from __future__ import annotations

from hz.findings_text import render


def test_render_german() -> None:
    text = render("room_underheated", {"room": "Bad", "median": -1.5, "threshold": 1.0}, "de")

    assert "Bad" in text["text"]
    assert "-1.5" in text["text"]
    assert text["suggestion"]


def test_render_english() -> None:
    text = render("room_underheated", {"room": "Bath", "median": -1.5, "threshold": 1.0}, "en")

    assert "Bath" in text["text"]
    assert "below target" in text["text"]


def test_render_falls_back_to_german() -> None:
    text = render("power_source_fallback", {}, "fr")

    assert "Ersatzstromquelle" in text["text"]


def test_render_tolerates_missing_params() -> None:
    text = render("flow_deviation", {"median": 6.0}, "de")

    assert "{" in text["text"]
    assert text["suggestion"]


def test_render_unknown_key() -> None:
    assert render("unknown", {}, "de") == {"text": "unknown", "suggestion": ""}
