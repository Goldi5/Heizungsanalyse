"""Feldschema, Prüfung und Vollständigkeit des Inventars.

Die Felder selbst kommen aus ``INVENTORY_FIELDS`` (const.py); dieses Modul
ergänzt nur lesbare Bezeichnungen, Typen, Einheiten und Grenzen. Frontend und
Backend arbeiten damit aus derselben Quelle – kein JSON mehr für Nutzer.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

from .const import INVENTORY_FIELDS

YES_NO = [
    {"value": "yes", "label": {"de": "Ja", "en": "Yes"}},
    {"value": "no", "label": {"de": "Nein", "en": "No"}},
    {"value": "unknown", "label": {"de": "Unbekannt", "en": "Unknown"}},
]

CONTROL_MODES = [
    {"value": "dp", "label": {"de": "Druckdifferenz", "en": "Pressure differential"}},
    {"value": "cp", "label": {"de": "Konstantdruck", "en": "Constant pressure"}},
    {"value": "cs", "label": {"de": "Konstantdrehzahl", "en": "Constant speed"}},
    {"value": "auto", "label": {"de": "Automatik", "en": "Automatic"}},
    {"value": "other", "label": {"de": "Sonstiges", "en": "Other"}},
]


def _text(de: str, en: str) -> dict[str, str]:
    return {"de": de, "en": en}


FIELD_META: dict[str, dict[str, Any]] = {
    # Pumpen
    "manufacturer": {"type": "text", "label": _text("Hersteller", "Manufacturer")},
    "model": {"type": "text", "label": _text("Modell", "Model")},
    "control_mode": {
        "type": "select",
        "label": _text("Regelart", "Control mode"),
        "options": CONTROL_MODES,
        "help": _text(
            "Druckdifferenz ist bei Fußbodenheizung üblich, Konstantdruck bei Radiatoren.",
            "Pressure differential is common for underfloor heating, constant pressure for radiators.",
        ),
    },
    "setting": {
        "type": "text",
        "label": _text("Einstellung", "Setting"),
        "help": _text("Zum Beispiel „Stufe 2“ oder „Δp 4“.", "For example “stage 2” or “Δp 4”."),
    },
    "power_w": {"type": "number", "label": _text("Leistung", "Power"), "unit": "W", "min": 0, "max": 3000, "step": 1},
    # Thermostate und Heizkörper
    "valve_preset": {
        "type": "number",
        "label": _text("Voreinstellung", "Preset"),
        "min": 0,
        "max": 10,
        "step": 0.5,
        "help": _text(
            "Voreinstellwert am Ventil. Ermöglicht die Auswertung des hydraulischen Abgleichs.",
            "Preset value on the valve. Enables evaluation of hydraulic balancing.",
        ),
    },
    "room": {"type": "room", "label": _text("Raum", "Room")},
    "circuit": {"type": "circuit", "label": _text("Heizkreis", "Heating circuit")},
    "nominal_flow_l_min": {
        "type": "number",
        "label": _text("Nenn-Durchfluss", "Nominal flow"),
        "unit": "l/min",
        "min": 0,
        "max": 60,
        "step": 0.1,
    },
    "measured_flow_l_min": {
        "type": "number",
        "label": _text("Gemessener Durchfluss", "Measured flow"),
        "unit": "l/min",
        "min": 0,
        "max": 60,
        "step": 0.1,
    },
    "measured_spread_k": {
        "type": "number",
        "label": _text("Gemessene Spreizung", "Measured spread"),
        "unit": "K",
        "min": 0,
        "max": 30,
        "step": 0.1,
    },
    # Hydraulik
    "buffer_volume_l": {
        "type": "number",
        "label": _text("Puffervolumen", "Buffer volume"),
        "unit": "l",
        "min": 0,
        "max": 5000,
        "step": 1,
    },
    "hydraulic_separator": {"type": "select", "label": _text("Hydraulische Trennung", "Hydraulic separator"), "options": YES_NO},
    "bypass_valve": {"type": "select", "label": _text("Bypass-Ventil", "Bypass valve"), "options": YES_NO},
    "pump_stage": {
        "type": "number",
        "label": _text("Pumpenstufe", "Pump stage"),
        "min": 1,
        "max": 5,
        "step": 1,
        "help": _text(
            "Ermöglicht Vorher/Nachher-Vergleiche der Pumpeneinstellung.",
            "Enables before/after comparisons of the pump setting.",
        ),
    },
    "mixer_setting": {
        "type": "number",
        "label": _text("Mischer-Einstellung", "Mixer setting"),
        "min": 0,
        "max": 10,
        "step": 0.5,
    },
    "notes": {"type": "text", "label": _text("Notiz", "Note"), "important": False},
}

SECTION_TITLES = {
    "pumps": _text("Pumpen", "Pumps"),
    "thermostats": _text("Thermostate", "Thermostats"),
    "hydraulics": _text("Hydraulik", "Hydraulics"),
    "radiators": _text("Heizkörper", "Radiators"),
}


def field_spec(field: str) -> dict[str, Any]:
    """Metadaten eines Felds (mit Rückfall auf einen Texttyp)."""
    return FIELD_META.get(field) or {"type": "text", "label": _text(field, field)}


def _with_context(spec: dict[str, Any], rooms: Sequence[Mapping[str, Any]], circuits: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    """Dynamische Auswahllisten (Räume/Kreise) mit den echten Namen füllen."""
    if spec["type"] == "room":
        options = [{"value": str(r.get("id")), "label": {"de": str(r.get("name") or r.get("id")), "en": str(r.get("name") or r.get("id"))}} for r in rooms]
        return {**spec, "options": options}
    if spec["type"] == "circuit":
        options = [{"value": str(c.get("id")), "label": {"de": str(c.get("name") or c.get("id")), "en": str(c.get("name") or c.get("id"))}} for c in circuits]
        return {**spec, "options": options}
    return spec


def build_schema(rooms: Sequence[Mapping[str, Any]] = (), circuits: Sequence[Mapping[str, Any]] = ()) -> dict[str, Any]:
    """Komplettes Feldschema je Bereich, inklusive Auswahloptionen."""
    out: dict[str, Any] = {}
    for section, fields in INVENTORY_FIELDS.items():
        out[section] = {
            "title": SECTION_TITLES.get(section, _text(section, section)),
            "fields": [{"key": field, **_with_context(field_spec(field), rooms, circuits)} for field in fields],
        }
    return {"sections": out}


def _check_value(section: str, field: str, value: Any, spec: dict[str, Any], rooms, circuits) -> str | None:
    """Einen Feldwert prüfen; Rückgabe ist ein Fehlerschlüssel oder None."""
    if value is None or value == "":
        return None
    kind = spec.get("type")
    if kind == "number":
        try:
            number = float(value)
        except (TypeError, ValueError):
            return "number"
        if spec.get("min") is not None and number < spec["min"]:
            return "range"
        if spec.get("max") is not None and number > spec["max"]:
            return "range"
        return None
    if kind == "select":
        allowed = {option["value"] for option in spec.get("options") or []}
        return None if str(value) in allowed else "option"
    if kind == "room":
        return None if str(value) in {str(r.get("id")) for r in rooms} else "reference"
    if kind == "circuit":
        return None if str(value) in {str(c.get("id")) for c in circuits} else "reference"
    return "length" if len(str(value)) > 200 else None


def validate_values(
    section: str,
    values: Mapping[str, Any],
    *,
    rooms: Sequence[Mapping[str, Any]] = (),
    circuits: Sequence[Mapping[str, Any]] = (),
) -> dict[str, str]:
    """Feldbezogene Fehler für ein Inventar-Objekt (leer = gültig)."""
    allowed = set(INVENTORY_FIELDS.get(section, ()))
    errors: dict[str, str] = {}
    for field in values:
        if field not in allowed:
            errors[field] = "unknown"
    for field, value in values.items():
        if field not in allowed:
            continue
        error = _check_value(section, field, value, field_spec(field), rooms, circuits)
        if error:
            errors[field] = error
    return errors


COMPLETENESS_HINTS = {
    "pumps": {
        "de": "Regelart und Pumpenstufe ermöglichen Vorher/Nachher-Vergleiche.",
        "en": "Control mode and pump stage enable before/after comparisons.",
    },
    "thermostats": {
        "de": "Voreinstellungen ermöglichen die Auswertung des hydraulischen Abgleichs.",
        "en": "Presets enable evaluation of hydraulic balancing.",
    },
    "hydraulics": {
        "de": "Puffervolumen und Mischer-Einstellung erklären Taktung und Vorlauf.",
        "en": "Buffer volume and mixer setting explain cycling and flow temperature.",
    },
    "radiators": {
        "de": "Voreinstellung und Durchfluss ermöglichen den Abgleich je Raum.",
        "en": "Preset and flow enable balancing per room.",
    },
}


def _important_fields(section: str) -> list[str]:
    return [field for field in INVENTORY_FIELDS.get(section, ()) if field_spec(field).get("important", True)]


def completeness(inventory: Mapping[str, Any]) -> dict[str, Any]:
    """Anteil ausgefüllter Pflichtangaben je Bereich und insgesamt."""
    sections: dict[str, Any] = {}
    filled_total = 0
    expected_total = 0
    for section in INVENTORY_FIELDS:
        important = _important_fields(section)
        data = inventory.get(section) or {}
        records = [data] if section == "hydraulics" else [v for v in data.values() if isinstance(v, Mapping)]
        expected = max(1, len(records)) * len(important)
        filled = sum(1 for record in records for field in important if record.get(field) not in (None, ""))
        if not records:
            filled = 0
        percent = 0 if not expected else round(filled / expected * 100)
        sections[section] = {
            "entries": len(records),
            "filled": filled,
            "expected": expected,
            "percent": percent,
            "hint": COMPLETENESS_HINTS.get(section) if percent < 100 else None,
        }
        filled_total += filled
        expected_total += expected
    percent = 0 if not expected_total else round(filled_total / expected_total * 100)
    return {"percent": percent, "sections": sections}


__all__ = [
    "FIELD_META",
    "SECTION_TITLES",
    "build_schema",
    "completeness",
    "field_spec",
    "validate_values",
]
