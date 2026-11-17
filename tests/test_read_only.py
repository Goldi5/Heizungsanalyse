"""Statische Read-only-Prüfung.

Es darf keinen Codepfad geben, der einen Dienst auf einer Fremd-Entity
aufruft. Der Test prüft den Quelltext, damit ein neuer Aufruf sofort auffällt.
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
        text = path.read_text(encoding="utf-8")
        for pattern in FORBIDDEN:
            if pattern in text:
                offenders.append(f"{path.name}: {pattern}")

    assert offenders == [], f"Steuernde Aufrufe gefunden: {offenders}"


def test_no_dunder_storage_edits() -> None:
    """Kein direkter Zugriff auf .storage-Dateien."""
    offenders = [path.name for path in COMPONENT.rglob("*.py") if ".storage/" in path.read_text(encoding="utf-8")]

    assert offenders == []
