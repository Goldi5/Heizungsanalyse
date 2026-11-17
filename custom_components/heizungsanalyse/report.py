"""Bericht als Markdown oder JSON (reines Python)."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
import json
from typing import Any


def _value(value: Any, unit: str = "") -> str:
    if value is None:
        return "unbekannt"
    if isinstance(value, float):
        return f"{value:.1f}{unit}"
    return f"{value}{unit}"


def _metrics_table(metrics: Mapping[str, Any]) -> list[str]:
    return [
        "| Kennzahl | Wert |",
        "|---|---|",
        f"| Tage mit Daten | {_value(metrics.get('days'))} |",
        f"| COP | {_value(metrics.get('cop'))} |",
        f"| Heizwaerme | {_value(metrics.get('heat_kwh'), ' kWh')} |",
        f"| Strom | {_value(metrics.get('power_kwh'), ' kWh')} |",
        f"| Starts pro Tag | {_value(metrics.get('starts_per_day'))} |",
        f"| Laufzeit je Zyklus | {_value(metrics.get('runtime_per_cycle_min'), ' min')} |",
    ]


def _inventory_lines(inventory: Mapping[str, Any]) -> list[str]:
    lines: list[str] = []
    for section in ("pumps", "thermostats"):
        entries = inventory.get(section) or {}
        for key, values in entries.items():
            fields = ", ".join(f"{name}={value}" for name, value in values.items() if value not in (None, ""))
            lines.append(f"- `{section}.{key}`: {fields or 'keine Angaben'}")
    hydraulics = inventory.get("hydraulics") or {}
    fields = ", ".join(f"{name}={value}" for name, value in hydraulics.items() if value not in (None, ""))
    if fields:
        lines.append(f"- `hydraulics`: {fields}")
    return lines or ["- Keine Stammdaten erfasst."]


def _change_lines(changes: Sequence[Mapping[str, Any]]) -> list[str]:
    if not changes:
        return ["- Keine Aenderungen protokolliert."]
    lines: list[str] = []
    for change in changes:
        note = f" ({change['note']})" if change.get("note") else ""
        lines.append(
            f"- {change.get('ts', '')}: `{change.get('object')}.{change.get('field')}` "
            f"{change.get('old')!r} -> {change.get('new')!r}{note}"
        )
    return lines


def render_markdown(
    *,
    title: str,
    metrics: Mapping[str, Any],
    inventory: Mapping[str, Any],
    changes: Sequence[Mapping[str, Any]],
    findings: Sequence[Mapping[str, Any]] | None = None,
) -> str:
    """Bericht als Markdown."""
    findings = findings or []
    lines = [
        f"# {title}",
        "",
        "Rein beobachtende Auswertung. Keine Handlungsanweisung an die Anlage.",
        "",
        "## Kennzahlen",
        "",
        *_metrics_table(metrics),
        "",
        "## Geraeteinventar",
        "",
        *_inventory_lines(inventory),
        "",
        "## Aenderungsverlauf",
        "",
        *_change_lines(changes),
        "",
        "## Hinweise",
        "",
    ]
    if findings:
        lines.extend(f"- [{item.get('severity', 'info')}] {item.get('id')}: {item.get('explanation', '')}" for item in findings)
    else:
        lines.append("- Noch keine Findings (folgt in Phase M5).")
    lines.append("")
    return "\n".join(lines)


def render_json(
    *,
    metrics: Mapping[str, Any],
    inventory: Mapping[str, Any],
    changes: Sequence[Mapping[str, Any]],
    findings: Sequence[Mapping[str, Any]] | None = None,
) -> str:
    """Bericht als JSON."""
    return json.dumps(
        {
            "metrics": metrics,
            "inventory": inventory,
            "changes": list(changes),
            "findings": list(findings or []),
        },
        indent=2,
        ensure_ascii=False,
        default=str,
    )

def render_plant_sheet(
    *,
    title: str,
    sources: Mapping[str, Any],
    circuits: Sequence[Mapping[str, Any]],
    rooms: Sequence[Mapping[str, Any]],
    inventory: Mapping[str, Any],
    metrics: Mapping[str, Any],
    findings: Sequence[Mapping[str, Any]] | None = None,
    thresholds: Mapping[str, Any] | None = None,
) -> str:
    """Anlagenblatt: Aufbau, Einstellungen, Messwerte – zum Ausdrucken/Abgleichen."""
    findings = findings or []
    lines: list[str] = [f"# {title} – Anlagenblatt", "", "Rein beobachtende Auswertung. Keine Handlungsanweisung an die Anlage.", ""]

    lines.append("## Datenquellen")
    lines.append("")
    for key, value in (sources or {}).items():
        if not value:
            continue
        lines.append(f"- `{key}`: {value}")
    lines.append("")

    lines.append("## Heizkreise")
    lines.append("")
    lines.append("| Kreis | Typ | Pumpe | Mischer | Räume |")
    lines.append("|---|---|---|---|---|")
    for circuit in circuits or []:
        rooms_ = ", ".join(circuit.get("rooms") or [])
        lines.append(
            f"| {circuit.get('name', circuit.get('id'))} | {circuit.get('type') or '-'} | "
            f"{'ja' if circuit.get('has_pump') else 'nein'} | {'ja' if circuit.get('has_mixer') else 'nein'} | {rooms_ or '-'} |"
        )
    lines.append("")

    lines.append("## Räume")
    lines.append("")
    lines.append("| Raum | Kreis | Thermostat | Ventilwert |")
    lines.append("|---|---|---|---|")
    for room in rooms or []:
        lines.append(
            f"| {room.get('name', room.get('id'))} | {room.get('circuit') or '-'} | "
            f"{room.get('climate_entity') or '-'} | {'ja' if room.get('valve_available') else 'nein'} |"
        )
    lines.append("")

    lines.append("## Kennzahlen")
    lines.append("")
    lines.extend(_metrics_table(metrics))
    lines.append("")

    for section, label in (("pumps", "Pumpen"), ("thermostats", "Thermostate"), ("hydraulics", "Hydraulik"), ("radiators", "Heizkörper")):
        entries = (inventory or {}).get(section) or {}
        if isinstance(entries, dict) and entries:
            lines.append(f"## {label}")
            lines.append("")
            if section == "radiators":
                lines.append("| ID | Kreis | Raum | Ventilpreset | Soll-Durchfluss (l/min) | Ist-Durchfluss (l/min) | Spreizung (K) |")
                lines.append("|---|---|---|---|---|---|---|")
                for key, values in entries.items():
                    lines.append(
                        f"| {key} | {values.get('circuit', '-')} | {values.get('room', '-')} | "
                        f"{values.get('valve_preset', '-')} | {values.get('nominal_flow_l_min', '-')} | "
                        f"{values.get('measured_flow_l_min', '-')} | {values.get('measured_spread_k', '-')} |"
                    )
            elif section == "hydraulics":
                fields = ", ".join(f"{k}={v}" for k, v in entries.items() if v not in (None, ""))
                lines.append(f"- {fields or 'keine Angaben'}")
            else:
                for key, values in entries.items():
                    fields = ", ".join(f"{name}={value}" for name, value in (values or {}).items() if value not in (None, ""))
                    lines.append(f"- `{section}.{key}`: {fields or 'keine Angaben'}")
            lines.append("")

    if thresholds:
        lines.append("## Schwellen")
        lines.append("")
        for key, value in thresholds.items():
            lines.append(f"- `{key}`: {value}")
        lines.append("")

    lines.append("## Hinweise")
    lines.append("")
    if findings:
        for item in findings:
            lines.append(f"- [{item.get('severity', 'info')}] {item.get('id')}: {item.get('text', item.get('key', ''))}")
    else:
        lines.append("- Keine Hinweise.")
    lines.append("")
    lines.append("---")
    lines.append("Erstellt aus den gespeicherten Daten der Heizungsanalyse. Änderungen am Inventar über `heizungsanalyse.update_inventory`.")
    lines.append("")
    return "\n".join(lines)
