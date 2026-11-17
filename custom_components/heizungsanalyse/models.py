"""Datenmodell für Heizkreise und Räume.

Reines Python ohne Home-Assistant-Abhängigkeit, damit sich das Modell
unabhängig testen und später in raumklima-2 wiederverwenden lässt.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any
import unicodedata


def slug(text: str) -> str:
    """Stabiler Bezeichner aus einem Namen (ohne Umlaute)."""
    text = text.replace("ß", "ss").replace("ẞ", "SS")
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-z0-9]+", "_", normalized.lower()).strip("_")
    return value or "item"


def unique_id(existing: list[str], text: str) -> str:
    """Bezeichner, der in ``existing`` noch nicht vorkommt."""
    base = slug(text)
    candidate = base
    counter = 2
    while candidate in existing:
        candidate = f"{base}_{counter}"
        counter += 1
    return candidate


@dataclass(slots=True)
class HeatingCircuit:
    """Ein Heizkreis mit optionalen Mess- und Stellgliedern."""

    id: str
    name: str
    type: str
    temperature_entity: str | None = None
    pump_entity: str | None = None
    mixer_open_entity: str | None = None
    mixer_close_entity: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "temperature_entity": self.temperature_entity,
            "pump_entity": self.pump_entity,
            "mixer_open_entity": self.mixer_open_entity,
            "mixer_close_entity": self.mixer_close_entity,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> HeatingCircuit:
        return cls(
            id=str(data["id"]),
            name=str(data["name"]),
            type=str(data.get("type") or "radiators"),
            temperature_entity=data.get("temperature_entity") or None,
            pump_entity=data.get("pump_entity") or None,
            mixer_open_entity=data.get("mixer_open_entity") or None,
            mixer_close_entity=data.get("mixer_close_entity") or None,
        )


@dataclass(slots=True)
class Room:
    """Ein Raum mit Zuordnung zu einem Kreis und optionaler Regelung."""

    id: str
    name: str
    circuit: str | None = None
    climate_entity: str | None = None
    valve_position_entity: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "circuit": self.circuit,
            "climate_entity": self.climate_entity,
            "valve_position_entity": self.valve_position_entity,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Room:
        return cls(
            id=str(data["id"]),
            name=str(data["name"]),
            circuit=data.get("circuit") or None,
            climate_entity=data.get("climate_entity") or None,
            valve_position_entity=data.get("valve_position_entity") or None,
        )


def circuits_from_options(options: dict[str, Any]) -> list[HeatingCircuit]:
    """Heizkreise aus den Optionsdaten lesen."""
    return [HeatingCircuit.from_dict(item) for item in options.get("circuits") or []]


def rooms_from_options(options: dict[str, Any]) -> list[Room]:
    """Räume aus den Optionsdaten lesen."""
    return [Room.from_dict(item) for item in options.get("rooms") or []]
