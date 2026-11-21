"""Statische Prüfung der Dienstaufrufe.

Die Analyse liest nur. Einzige Ausnahmen, jede bewusst und eng begrenzt:

- ``controls.py``: Reglerwerte verstellen – nur erkannte Werte, nur in sicheren
  Grenzen, nur Admins, nur nach doppelter Bestätigung im Dashboard.
- ``plant.py``: ``weather.get_forecasts`` – liest die Wettervorhersage.

Ein neuer Aufruf an anderer Stelle fällt sofort auf.
"""

from __future__ import annotations

from pathlib import Path

COMPONENT = Path(__file__).parent.parent / "custom_components" / "heizungsanalyse"

FORBIDDEN = (
    "services.async_call",
    "async_call(",
    "call_service",
    "climate.set_",
    "number.set_value",
    "select.select_option",
    "switch.turn_",
    "light.turn_",
)


def test_no_foreign_service_calls_in_source() -> None:
    offenders: list[str] = []
    for path in COMPONENT.rglob("*.py"):
        if path.name == "controls.py":
            continue
        text = path.read_text(encoding="utf-8")
        if path.name == "plant.py":
            text = text.replace('"weather", "get_forecasts"', "").replace("hass.services.async_call(\n", "")
        for pattern in FORBIDDEN:
            if pattern in text:
                offenders.append(f"{path.name}: {pattern}")

    assert offenders == [], f"Steuernde Aufrufe gefunden: {offenders}"


def test_no_dunder_storage_edits() -> None:
    """Kein direkter Zugriff auf .storage-Dateien."""
    offenders = [path.name for path in COMPONENT.rglob("*.py") if ".storage/" in path.read_text(encoding="utf-8")]

    assert offenders == []


def test_plant_calls_only_weather_forecast() -> None:
    text = (COMPONENT / "plant.py").read_text(encoding="utf-8")
    assert text.count("services.async_call") == 1
    assert '"weather", "get_forecasts"' in text


def test_controls_write_only_number_and_select() -> None:
    text = (COMPONENT / "controls.py").read_text(encoding="utf-8")
    calls = text.count("services.async_call(")
    assert calls == 2
    assert '"number", "set_value"' in text
    assert '"select", "select_option"' in text
