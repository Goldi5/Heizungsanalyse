"""Alle Daten für das Dashboard in einem Rutsch (reines Python).

Das Frontend fragt einmal ``heizungsanalyse/summary`` ab und bekommt Kennzahlen,
Tagesverläufe, Kennlinien, Hinweise mit Beleg, Räume, Kreise, Änderungen mit
Vorher/Nachher-Vergleich und Inventar. Nichts davon steuert etwas; die Funktion
rechnet nur vorhandene Ergebnisse um.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
from datetime import date, datetime, timedelta
from typing import Any

from .analysis.cop import CopBin, CopResult
from .analysis.findings import Finding
from .analysis.heating_curve import CurveBin
from .analysis.periods import summarize, within
from .analysis.types import DaySample
from .findings_text import render

SERIES_DAYS = 400
CHANGE_LIMIT = 12
COMPARE_DAYS = 7
MIN_SCORE_DAYS = 3

# Abzug je Hinweis für den Anlagen-Check. Bewusst einfach und erklärbar:
# 100 minus 15 je Warnung, minus 5 je Info.
SCORE_PENALTY = {"warning": 15, "info": 5}

TITLES: dict[str, dict[str, str]] = {
    "de": {
        "flow_deviation": "Vorlauf liegt über Soll",
        "too_many_starts": "Verdichter startet zu oft",
        "short_cycles": "Kurze Laufzeiten",
        "pump_idle": "Pumpe läuft ohne Wärmebedarf",
        "room_underheated": "Raum bleibt zu kalt",
        "room_overheated": "Raum wird zu warm",
        "aux_heater": "Heizstab läuft viel",
        "duplicate_sensors": "Sensoren melden dasselbe",
        "source_unavailable": "Quelle nicht verfügbar",
        "defrost": "Abtauen häufiger als üblich",
        "cop_curve": "COP weicht von der Kennlinie ab",
        "mixer_unrest": "Mischer taktet",
        "missing_statistics": "Langzeitstatistik fehlt",
        "power_source_fallback": "Ersatz-Stromquelle aktiv",
        "power_source_deviation": "Stromquellen weichen ab",
    },
    "en": {
        "flow_deviation": "Flow temperature above target",
        "too_many_starts": "Compressor starts too often",
        "short_cycles": "Short run times",
        "pump_idle": "Pump runs without heat demand",
        "room_underheated": "Room stays too cold",
        "room_overheated": "Room gets too warm",
        "aux_heater": "Auxiliary heater runs a lot",
        "duplicate_sensors": "Sensors report the same",
        "source_unavailable": "Source unavailable",
        "defrost": "Defrosting more than usual",
        "cop_curve": "COP deviates from the curve",
        "mixer_unrest": "Mixer cycles",
        "missing_statistics": "Long-term statistics missing",
        "power_source_fallback": "Fallback power source active",
        "power_source_deviation": "Power sources deviate",
    },
}

# Welche optionale Quelle schaltet welche Auswertung frei (für „Was fehlt?“)
UNLOCKS: dict[str, tuple[str, ...]] = {
    "flow_entity": ("heating_curve", "flow_deviation"),
    "target_flow_entity": ("heating_curve", "flow_deviation"),
    "compressor_starts_entity": ("cycling",),
    "compressor_runtime_entity": ("cycling",),
    "defrost_entity": ("defrost",),
    "aux_heater_entity": ("aux_heater",),
    "dhw_heat_entity": ("dhw",),
    "return_entity": ("spread",),
}


def _lang(language: str | None) -> str:
    base = (language or "de").replace("-", "_").split("_")[0].lower()
    return base if base in TITLES else "de"


def _r(value: float | None, digits: int = 2) -> float | None:
    return None if value is None else round(float(value), digits)


def score(findings: Sequence[Finding], days_with_data: int) -> dict[str, Any]:
    """Anlagen-Check 0-100 mit Stufe. Ohne Datenbasis kein Wert."""
    warnings = sum(1 for item in findings if item.severity == "warning")
    infos = sum(1 for item in findings if item.severity != "warning")
    if days_with_data < MIN_SCORE_DAYS:
        return {"value": None, "level": "learning", "warnings": warnings, "infos": infos}
    value = max(0, 100 - warnings * SCORE_PENALTY["warning"] - infos * SCORE_PENALTY["info"])
    if value >= 85:
        level = "very_good"
    elif value >= 70:
        level = "good"
    elif value >= 50:
        level = "watch"
    else:
        level = "action"
    return {"value": value, "level": level, "warnings": warnings, "infos": infos}


def daily_series(samples: Iterable[DaySample], *, limit: int = SERIES_DAYS) -> list[dict[str, Any]]:
    """Tageswerte für Diagramme, älteste zuerst."""
    rows: list[dict[str, Any]] = []
    for sample in sorted(samples, key=lambda item: item.day)[-limit:]:
        cop = None
        if sample.heat_kwh is not None and sample.power_kwh and sample.power_kwh > 0:
            cop = round(sample.heat_kwh / sample.power_kwh, 2)
        cycle = None
        if sample.runtime_h is not None and sample.starts:
            cycle = round(sample.runtime_h * 60 / sample.starts, 1)
        rows.append(
            {
                "day": sample.day.isoformat(),
                "cop": cop,
                "heat": _r(sample.heat_kwh, 1),
                "power": _r(sample.power_kwh, 2),
                "outdoor": _r(sample.outdoor_c, 1),
                "starts": _r(sample.starts, 0),
                "runtime_h": _r(sample.runtime_h, 2),
                "cycle_min": cycle,
                "flow": _r(sample.flow_c, 1),
                "target_flow": _r(sample.target_flow_c, 1),
                "dhw": _r(sample.dhw_heat_kwh, 1),
                "aux_h": _r(sample.aux_hours, 2),
                "defrost_h": _r(sample.defrost_hours, 2),
            }
        )
    return rows


def finding_rows(findings: Sequence[Finding], language: str | None) -> list[dict[str, Any]]:
    """Hinweise mit Titel, Text, Empfehlung und Beleg; Warnungen zuerst."""
    lang = _lang(language)
    order = {"warning": 0, "info": 1}
    rows = []
    for item in sorted(findings, key=lambda f: (order.get(f.severity, 2), f.id)):
        text = render(item.key, _localized(item.params, lang), lang)
        rows.append(
            {
                "id": item.id,
                "severity": item.severity,
                "key": item.key,
                "title": TITLES[lang].get(item.key, item.key),
                "text": text["text"],
                "suggestion": text["suggestion"],
                "evidence": dict(item.evidence),
                "params": dict(item.params),
                "since": item.since,
            }
        )
    return rows


def _localized(params: Mapping[str, Any], lang: str) -> dict[str, Any]:
    """Kommazahlen im deutschen Text mit Komma (1,4 statt 1.4)."""
    out: dict[str, Any] = {}
    for key, value in (params or {}).items():
        if isinstance(value, float) and not value.is_integer():
            text = f"{value:.2f}".rstrip("0").rstrip(".")
            out[key] = text.replace(".", ",") if lang == "de" else text
        elif isinstance(value, float):
            out[key] = int(value)
        else:
            out[key] = value
    return out


def _outdoor_mean(samples: Sequence[DaySample]) -> float | None:
    values = [s.outdoor_c for s in samples if s.outdoor_c is not None]
    return round(sum(values) / len(values), 1) if values else None


def change_rows(
    changes: Sequence[Mapping[str, Any]],
    samples: Sequence[DaySample],
    *,
    to_local_day,
    days: int = COMPARE_DAYS,
    limit: int = CHANGE_LIMIT,
) -> list[dict[str, Any]]:
    """Jüngste Änderungen mit Vergleich der Tage davor und danach.

    ``to_local_day`` wandelt den gespeicherten Zeitstempel in den lokalen Tag um
    (aus dem HA-Teil übergeben, damit dieses Modul HA-frei bleibt).
    """
    rows: list[dict[str, Any]] = []
    for change in list(changes)[:limit]:
        day = to_local_day(change.get("ts"))
        row: dict[str, Any] = {
            "ts": change.get("ts"),
            "day": day.isoformat() if day else None,
            "object": change.get("object"),
            "field": change.get("field"),
            "old": change.get("old"),
            "new": change.get("new"),
            "note": change.get("note"),
            "before": None,
            "after": None,
        }
        if day is not None:
            before = within(samples, day - timedelta(days=days), day - timedelta(days=1))
            after = within(samples, day, day + timedelta(days=days - 1))
            if before:
                row["before"] = summarize(before) | {"outdoor": _outdoor_mean(before)}
            if after:
                row["after"] = summarize(after) | {"outdoor": _outdoor_mean(after)}
        rows.append(row)
    return rows


def _cop(result: CopResult) -> dict[str, Any]:
    return {
        "value": _r(result.cop),
        "heat_kwh": _r(result.heat_kwh, 1),
        "power_kwh": _r(result.power_kwh, 1),
        "days": result.days,
        "source": result.source,
    }


def _bins_cop(bins: Sequence[CopBin]) -> list[dict[str, Any]]:
    return [{"lower": b.lower, "upper": b.upper, "cop": _r(b.cop), "days": b.days} for b in bins]


def _bins_curve(bins: Sequence[CurveBin]) -> list[dict[str, Any]]:
    return [{"lower": b.lower, "upper": b.upper, "target_flow": _r(b.target_flow_c, 1), "days": b.days} for b in bins]


def build_summary(
    snapshot: Any,
    *,
    version: str,
    title: str,
    language: str | None,
    rooms: Sequence[Mapping[str, Any]],
    circuits: Sequence[Mapping[str, Any]],
    sources: Mapping[str, str | None],
    history: Sequence[DaySample],
    changes: Sequence[Mapping[str, Any]],
    inventory: Mapping[str, Any],
    to_local_day,
    generated: datetime | None = None,
) -> dict[str, Any]:
    """Antwort für ``heizungsanalyse/summary``.

    ``snapshot`` ist ein ``AnalysisSnapshot`` (Duck-Typing, damit die Tests
    ohne Coordinator auskommen). ``history`` sind Roll-ups plus frische Proben.
    """
    circuit_names = {str(c.get("id")): str(c.get("name") or c.get("id")) for c in circuits}
    room_rows = []
    for room in rooms:
        room_id = str(room.get("id"))
        stats = snapshot.rooms.get(room_id)
        room_rows.append(
            {
                "id": room_id,
                "name": room.get("name") or room_id,
                "circuit": room.get("circuit"),
                "circuit_name": circuit_names.get(str(room.get("circuit"))),
                "climate_entity": room.get("climate_entity"),
                "valve_available": bool(room.get("valve_position_entity")),
                "deviation": stats.as_dict() if stats is not None else None,
                "heating_up_min": _r(snapshot.heating_up.get(room_id), 0),
            }
        )
    circuit_rows = []
    for circuit in circuits:
        circuit_id = str(circuit.get("id"))
        pump = snapshot.circuits.get(circuit_id)
        mixer = snapshot.mixer.get(circuit_id)
        circuit_rows.append(
            {
                "id": circuit_id,
                "name": circuit.get("name") or circuit_id,
                "type": circuit.get("type"),
                "has_pump": bool(circuit.get("pump_entity")),
                "has_mixer": bool(circuit.get("mixer_open_entity") or circuit.get("mixer_close_entity")),
                "pump": pump.as_dict() if pump is not None else None,
                "mixer": mixer.as_dict() if mixer is not None else None,
                "rooms": [r["name"] for r in room_rows if str(r["circuit"]) == circuit_id],
            }
        )

    missing = sorted({unlock for key, unlocks in UNLOCKS.items() if not sources.get(key) for unlock in unlocks})
    deviation = snapshot.deviation
    findings = list(snapshot.findings)
    thresholds = snapshot.thresholds.as_dict() if hasattr(snapshot.thresholds, "as_dict") else {}

    return {
        "version": version,
        "title": title,
        "generated": (generated or datetime.now()).isoformat(),
        "score": score(findings, snapshot.days_with_data),
        "kpis": {
            "cop_short": _cop(snapshot.cop_short),
            "cop_long": _cop(snapshot.cop_long),
            "starts_per_day": _r(snapshot.starts_per_day, 1),
            "runtime_per_cycle": _r(snapshot.runtime_per_cycle, 1),
            "flow_deviation": {
                "median": _r(getattr(deviation, "median", None), 2),
                "p90": _r(getattr(deviation, "p90", None), 2),
                "hours": getattr(deviation, "count", 0),
                "compressor_filtered": bool(snapshot.compressor_filtered),
            },
            "days_with_data": snapshot.days_with_data,
            "power_source": snapshot.power_source,
        },
        "thresholds": thresholds,
        "findings": finding_rows(findings, language),
        "series": daily_series(history),
        "cop_bins": _bins_cop(snapshot.cop_trend),
        "curve_bins": _bins_curve(snapshot.curve),
        "rooms": room_rows,
        "circuits": circuit_rows,
        "changes": change_rows(changes, list(history), to_local_day=to_local_day),
        "inventory": dict(inventory),
        "sources": {key: bool(value) for key, value in sources.items()},
        "missing": missing,
    }


def local_day(value: Any, convert) -> date | None:
    """Hilfsfunktion: Zeitstempel-String über ``convert`` in einen Tag umwandeln."""
    if not value:
        return None
    try:
        return convert(str(value))
    except (TypeError, ValueError):
        return None
