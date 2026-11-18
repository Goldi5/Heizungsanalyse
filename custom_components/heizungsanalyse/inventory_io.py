"""Inventar als CSV austauschen (Import und Export ohne JSON-Handarbeit)."""

from __future__ import annotations

from collections.abc import Mapping
import csv
import io
from typing import Any

from .const import INVENTORY_FIELDS
from .inventory_schema import validate_values

HEADER = ("object", "field", "value")


def export_csv(inventory: Mapping[str, Any]) -> str:
    """Inventar als Tabelle ``object,field,value`` ausgeben."""
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(HEADER)
    for section, fields in INVENTORY_FIELDS.items():
        data = inventory.get(section) or {}
        records = [("", data)] if section == "hydraulics" else sorted(data.items())
        for key, record in records:
            if not isinstance(record, Mapping):
                continue
            object_id = section if not key else f"{section}.{key}"
            for field in fields:
                value = record.get(field)
                if value in (None, ""):
                    continue
                writer.writerow((object_id, field, value))
    return buffer.getvalue()


def parse_csv(text: str) -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    """CSV lesen und je Objekt die Feldwerte sammeln.

    Rückgabe: (``{object_id: {field: value}}``, Zeilenfehler).
    """
    grouped: dict[str, dict[str, Any]] = {}
    errors: list[dict[str, Any]] = []
    reader = csv.DictReader(io.StringIO(text.strip()))
    if reader.fieldnames is None:
        return grouped, [{"line": 1, "error": "empty"}]
    missing = [name for name in HEADER if name not in reader.fieldnames]
    if missing:
        return grouped, [{"line": 1, "error": "header", "fields": missing}]

    for line, row in enumerate(reader, start=2):
        object_id = str(row.get("object") or "").strip()
        field = str(row.get("field") or "").strip()
        value = row.get("value")
        if not object_id or not field:
            errors.append({"line": line, "error": "incomplete"})
            continue
        section = object_id.partition(".")[0]
        if section not in INVENTORY_FIELDS:
            errors.append({"line": line, "error": "section", "object": object_id})
            continue
        if field not in INVENTORY_FIELDS[section]:
            errors.append({"line": line, "error": "field", "object": object_id, "field": field})
            continue
        grouped.setdefault(object_id, {})[field] = "" if value is None else value
    return grouped, errors


def validate_import(
    grouped: Mapping[str, Mapping[str, Any]],
    *,
    rooms: list[dict[str, Any]] | None = None,
    circuits: list[dict[str, Any]] | None = None,
) -> dict[str, dict[str, str]]:
    """CSV-Gruppen gegen das Schema prüfen: ``{object_id: {field: error}}``."""
    problems: dict[str, dict[str, str]] = {}
    for object_id, values in grouped.items():
        section = object_id.partition(".")[0]
        errors = validate_values(section, values, rooms=rooms or (), circuits=circuits or ())
        if errors:
            problems[object_id] = errors
    return problems


__all__ = ["HEADER", "export_csv", "parse_csv", "validate_import"]
