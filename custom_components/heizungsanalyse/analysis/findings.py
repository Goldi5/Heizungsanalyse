"""Findings-Engine: Hinweise mit Beleg (reines Python).

Jedes Finding nennt Kennzahl, Schwellenwert und Zeitfenster. Die Texte selbst
liegen in den Übersetzungen; hier stehen nur Schlüssel und Parameter.
Keine Regel erzeugt einen Hinweis ohne Messwerte.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field, fields
from typing import Any

from .circuits import CircuitStats, MixerStats
from .cop import CopBin
from .rooms import RoomDeviation
from .types import DaySample

SEVERITY_WARNING = "warning"
SEVERITY_INFO = "info"

ROOM_TYPE_TARGETS: dict[str, tuple[float, float, float]] = {
    "living": (20.0, 17.0, 23.0),
    "kitchen": (19.0, 16.0, 22.0),
    "bedroom": (17.0, 15.0, 20.0),
    "bathroom": (22.0, 19.0, 24.0),
    "office": (20.0, 17.0, 23.0),
    "hallway": (18.0, 15.0, 21.0),
    "guest": (18.0, 16.0, 21.0),
    "child": (20.0, 18.0, 23.0),
    "utility": (17.0, 15.0, 20.0),
}


@dataclass(slots=True, frozen=True)
class Thresholds:
    """Schwellen der Findings, per Optionsdialog änderbar."""

    flow_deviation_k: float = 2.0
    starts_per_day: float = 12.0
    runtime_minutes: float = 20.0
    pump_idle_share: float = 0.4
    room_deviation_k: float = 1.0
    aux_hours_per_day: float = 1.0
    defrost_hours_per_day: float = 2.0
    cop_curve_deviation: float = 0.15
    mixer_pulses_per_day: float = 12.0
    power_source_deviation: float = 0.15
    spread_min_k: float = 3.0
    spread_max_k: float = 8.0
    return_temp_max_c: float = 45.0

    @classmethod
    def from_options(cls, options: Mapping[str, Any] | None) -> Thresholds:
        values = dict(options or {})
        allowed = {item.name: item.type for item in fields(cls)}
        clean: dict[str, float] = {}
        for key, _kind in allowed.items():
            raw = values.get(key)
            if isinstance(raw, (int, float)) and not isinstance(raw, bool):
                clean[key] = float(raw)
            elif isinstance(raw, str):
                try:
                    clean[key] = float(raw.replace(",", "."))
                except ValueError:
                    continue
        return cls(**clean)

    def as_dict(self) -> dict[str, float]:
        return {item.name: getattr(self, item.name) for item in fields(self)}


@dataclass(slots=True, frozen=True)
class Finding:
    """Ein Hinweis mit Beleg."""

    id: str
    severity: str
    key: str
    params: dict[str, Any] = field(default_factory=dict)
    evidence: dict[str, Any] = field(default_factory=dict)
    since: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "severity": self.severity,
            "key": self.key,
            "params": self.params,
            "evidence": self.evidence,
            "since": self.since,
        }

    def signature(self) -> str:
        """Stabile Kennung für den Ereignisvergleich."""
        return f"{self.id}:{self.key}:{sorted(self.params.items())}:{sorted(self.evidence.items())}"


@dataclass(slots=True)
class FindingsInput:
    """Alle Messwerte, die die Regeln beurteilen dürfen."""

    cop: float | None = None
    cop_days: int = 0
    cop_long: float | None = None
    cop_trend: Sequence[CopBin] = ()
    outdoor_mean: float | None = None
    deviation_median: float | None = None
    deviation_p90: float | None = None
    deviation_hours: int = 0
    starts_per_day: float | None = None
    runtime_per_cycle: float | None = None
    room_stats: Mapping[str, RoomDeviation] = field(default_factory=dict)
    room_names: Mapping[str, str] = field(default_factory=dict)
    room_types: Mapping[str, str] = field(default_factory=dict)
    circuit_stats: Mapping[str, CircuitStats] = field(default_factory=dict)
    circuit_names: Mapping[str, str] = field(default_factory=dict)
    mixer_stats: Mapping[str, MixerStats] = field(default_factory=dict)
    samples: Sequence[DaySample] = ()
    duplicate_pairs: Sequence[tuple[str, str]] = ()
    missing_statistics: Sequence[str] = ()
    unavailable_hours: Mapping[str, float] = field(default_factory=dict)
    power_source: str | None = None
    primary_energy: float | None = None
    fallback_energy: float | None = None
    spread_median: float | None = None
    spread_hours: int = 0
    return_temp_median: float | None = None
    # Heizkreise hinter einem Puffer: Die Pumpe darf laufen, während der Verdichter steht –
    # der Puffer liefert die Wärme. „Pumpe ohne Verdichter“ ist dort keine Verschwendung.
    buffer_system: bool = False


def _mean(values: Sequence[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


def _room(results: FindingsInput, room_id: str) -> str:
    return results.room_names.get(room_id, room_id)


def _flow_deviation(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    if results.deviation_median is None or results.deviation_median <= thresholds.flow_deviation_k:
        return []
    return [
        Finding(
            id="F01",
            severity=SEVERITY_WARNING,
            key="flow_deviation",
            params={"median": round(results.deviation_median, 1), "threshold": thresholds.flow_deviation_k},
            evidence={"median_k": results.deviation_median, "p90_k": results.deviation_p90, "hours": results.deviation_hours},
        )
    ]


def _cycling(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    findings: list[Finding] = []
    cold_ok = results.outdoor_mean is None or results.outdoor_mean > 0
    if results.starts_per_day is not None and results.starts_per_day > thresholds.starts_per_day and cold_ok:
        findings.append(
            Finding(
                id="F02",
                severity=SEVERITY_WARNING,
                key="too_many_starts",
                params={"starts": round(results.starts_per_day, 1), "threshold": thresholds.starts_per_day},
                evidence={"starts_per_day": results.starts_per_day, "outdoor_mean_c": results.outdoor_mean},
            )
        )
    if (
        results.starts_per_day
        and results.runtime_per_cycle is not None
        and results.runtime_per_cycle < thresholds.runtime_minutes
    ):
        findings.append(
            Finding(
                id="F02",
                severity=SEVERITY_WARNING,
                key="short_cycles",
                params={"minutes": round(results.runtime_per_cycle, 1), "threshold": thresholds.runtime_minutes},
                evidence={"runtime_per_cycle_min": results.runtime_per_cycle, "starts_per_day": results.starts_per_day},
            )
        )
    return findings


def _pump_idle(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    if results.buffer_system:
        return []
    findings: list[Finding] = []
    for circuit_id, stats in results.circuit_stats.items():
        if stats.idle_share is None or stats.idle_share <= thresholds.pump_idle_share:
            continue
        findings.append(
            Finding(
                id="F03",
                severity=SEVERITY_WARNING,
                key="pump_idle",
                params={
                    "circuit": results.circuit_names.get(circuit_id, circuit_id),
                    "share": round(stats.idle_share * 100, 1),
                    "threshold": round(thresholds.pump_idle_share * 100, 1),
                },
                evidence={"idle_minutes": stats.idle_minutes, "pump_minutes": stats.pump_minutes},
            )
        )
    return findings


# Mindestens 12 Stunden Stichproben (5-min-Takt), bevor ein Raum bewertet wird –
# vorher reicht eine einzelne Messung für eine Warnung.
MIN_ROOM_SAMPLES = 144


def _room_deviation(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    findings: list[Finding] = []
    for room_id, stats in results.room_stats.items():
        if stats.median is None or stats.samples < MIN_ROOM_SAMPLES:
            continue
        if stats.median < -thresholds.room_deviation_k:
            findings.append(
                Finding(
                    id="F04",
                    severity=SEVERITY_WARNING,
                    key="room_underheated",
                    params={
                        "room": _room(results, room_id),
                        "median": round(stats.median, 1),
                        "threshold": thresholds.room_deviation_k,
                    },
                    evidence={"samples": stats.samples, "under_share": stats.under_share},
                )
            )
        elif stats.median > thresholds.room_deviation_k:
            findings.append(
                Finding(
                    id="F05",
                    severity=SEVERITY_WARNING,
                    key="room_overheated",
                    params={
                        "room": _room(results, room_id),
                        "median": round(stats.median, 1),
                        "threshold": thresholds.room_deviation_k,
                    },
                    evidence={"samples": stats.samples, "over_share": stats.over_share},
                )
            )
    return findings


def _aux_heater(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    hours = _mean([sample.aux_hours for sample in results.samples if sample.aux_hours is not None])
    if hours is None or hours <= thresholds.aux_hours_per_day:
        return []
    return [
        Finding(
            id="F06",
            severity=SEVERITY_INFO,
            key="aux_heater",
            params={"hours": hours, "threshold": thresholds.aux_hours_per_day},
            evidence={"mean_hours_per_day": hours, "days": len(results.samples)},
        )
    ]


def _duplicate_sensors(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    del thresholds
    if not results.duplicate_pairs:
        return []
    pairs = [f"{left} = {right}" for left, right in results.duplicate_pairs]
    return [
        Finding(
            id="F07",
            severity=SEVERITY_INFO,
            key="duplicate_sensors",
            params={"count": len(pairs)},
            evidence={"pairs": pairs},
        )
    ]


def _unavailable_sources(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    del thresholds
    findings: list[Finding] = []
    for entity_id, hours in results.unavailable_hours.items():
        if hours <= 1.0:
            continue
        findings.append(
            Finding(
                id="F08",
                severity=SEVERITY_WARNING,
                key="source_unavailable",
                params={"entity": entity_id, "hours": round(hours, 1)},
                evidence={"entity_id": entity_id, "hours": round(hours, 1)},
            )
        )
    return findings


def _defrost(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    hours = _mean([sample.defrost_hours for sample in results.samples if sample.defrost_hours is not None])
    if hours is None or hours <= thresholds.defrost_hours_per_day:
        return []
    if results.outdoor_mean is not None and not 0 <= results.outdoor_mean <= 7:
        return []
    return [
        Finding(
            id="F09",
            severity=SEVERITY_INFO,
            key="defrost",
            params={"hours": hours, "threshold": thresholds.defrost_hours_per_day},
            evidence={"mean_hours_per_day": hours, "outdoor_mean_c": results.outdoor_mean},
        )
    ]


def _cop_curve(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    if results.cop is None or results.cop_days < 7 or results.outdoor_mean is None:
        return []
    expected = None
    for point in results.cop_trend:
        if point.cop is not None and point.days >= 2 and point.lower <= results.outdoor_mean < point.upper:
            expected = point.cop
            break
    if not expected:
        return []
    deviation = (results.cop - expected) / expected
    if abs(deviation) <= thresholds.cop_curve_deviation:
        return []
    return [
        Finding(
            id="F10",
            severity=SEVERITY_INFO,
            key="cop_curve",
            params={
                "cop": round(results.cop, 2),
                "expected": round(expected, 2),
                "deviation": round(deviation * 100, 1),
                "threshold": round(thresholds.cop_curve_deviation * 100, 1),
            },
            evidence={"cop": results.cop, "expected": expected, "outdoor_mean_c": results.outdoor_mean},
        )
    ]


def _mixer(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    findings: list[Finding] = []
    for circuit_id, stats in results.mixer_stats.items():
        if stats.pulses_per_day is None or stats.pulses_per_day <= thresholds.mixer_pulses_per_day:
            continue
        findings.append(
            Finding(
                id="F11",
                severity=SEVERITY_INFO,
                key="mixer_unrest",
                params={
                    "circuit": results.circuit_names.get(circuit_id, circuit_id),
                    "pulses": stats.pulses_per_day,
                    "threshold": thresholds.mixer_pulses_per_day,
                },
                evidence={"pulses": stats.pulses, "days": stats.days, "resolution_minutes": stats.resolution_minutes},
            )
        )
    return findings


def _missing_statistics(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    del thresholds
    if not results.missing_statistics:
        return []
    return [
        Finding(
            id="F12",
            severity=SEVERITY_INFO,
            key="missing_statistics",
            params={"count": len(results.missing_statistics)},
            evidence={"entities": list(results.missing_statistics)},
        )
    ]


def _power_source(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    if results.power_source == "fallback":
        return [
            Finding(
                id="F13",
                severity=SEVERITY_WARNING,
                key="power_source_fallback",
                params={},
                evidence={"power_source": results.power_source},
            )
        ]
    if not results.primary_energy or not results.fallback_energy:
        return []
    deviation = (results.primary_energy - results.fallback_energy) / results.fallback_energy
    if abs(deviation) <= thresholds.power_source_deviation:
        return []
    return [
        Finding(
            id="F13",
            severity=SEVERITY_WARNING,
            key="power_source_deviation",
            params={
                "deviation": round(deviation * 100, 1),
                "threshold": round(thresholds.power_source_deviation * 100, 1),
            },
            evidence={
                "primary_kwh": round(results.primary_energy, 1),
                "fallback_kwh": round(results.fallback_energy, 1),
            },
        )
    ]


def _return_temp(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    value = results.return_temp_median
    if value is None:
        return []
    if value <= thresholds.return_temp_max_c:
        return []
    return [
        Finding(
            id="F15",
            severity=SEVERITY_INFO,
            key="return_temp_high",
            params={"value": round(value, 1), "threshold": thresholds.return_temp_max_c},
            evidence={"return_temp_c": round(value, 2)},
        )
    ]


# Mindestens ein Tag Laufstunden, bevor die Spreizung bewertet wird
MIN_SPREAD_HOURS = 24


def _spread(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    median = results.spread_median
    if median is None or results.spread_hours < MIN_SPREAD_HOURS:
        return []
    if median < thresholds.spread_min_k:
        key, threshold = "spread_low", thresholds.spread_min_k
    elif median > thresholds.spread_max_k:
        key, threshold = "spread_high", thresholds.spread_max_k
    else:
        return []
    return [
        Finding(
            id="F14",
            severity=SEVERITY_INFO,
            key=key,
            params={"spread": round(median, 1), "threshold": threshold},
            evidence={"median_k": round(median, 2), "hours": results.spread_hours},
        )
    ]



def _heating_curve_suggestion(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    median = results.deviation_median
    if median is None or results.deviation_hours < 168:
        return []
    if abs(median) < 1.5:
        return []
    suggested = round(-median, 1)
    gain = round(abs(median) * 2.5, 1)
    severity = SEVERITY_INFO if abs(median) < 2.0 else SEVERITY_WARNING
    return [
        Finding(
            id="F16",
            severity=severity,
            key="heating_curve_adjust",
            params={"median": round(median, 1), "suggested": suggested, "gain": gain},
            evidence={"median_k": round(median, 2), "hours": results.deviation_hours, "p90_k": results.deviation_p90},
        )
    ]



def _room_target_plausible(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    findings: list[Finding] = []
    for room_id, stats in (results.room_stats or {}).items():
        median = getattr(stats, "median", None)
        if median is None:
            continue
        if abs(median) < 3.0:
            continue
        name = results.room_names.get(room_id, room_id)
        findings.append(
            Finding(
                id="F17",
                severity=SEVERITY_INFO,
                key="room_target_check",
                params={"room": name, "deviation": round(median, 1)},
                evidence={"median_k": round(median, 2), "samples": getattr(stats, "samples", 0)},
            )
        )
    return findings



def _daily_cop_points(samples) -> list[tuple[float, float]]:
    points = []
    for sample in samples:
        if sample.heat_kwh is None or not sample.power_kwh or sample.outdoor_c is None:
            continue
        if sample.power_kwh < 1.0:
            continue  # Tage fast ohne Lauf verzerren die Kennlinie
        points.append((sample.outdoor_c, sample.heat_kwh / sample.power_kwh))
    return points


def expected_cop(samples, *, recent_days: int = 7, min_days: int = 10) -> tuple[float | None, int]:
    """Erwarteter COP der letzten Tage nach der eigenen Kennlinie (COP über Außentemperatur).

    Die Kennlinie wird aus den Tagen *vor* dem Prüfzeitraum gerechnet, damit ein
    echter Einbruch sie nicht selbst nach unten zieht. Ergebnis: Mittel der
    erwarteten Tages-COPs bei den tatsächlichen Außentemperaturen.
    """
    samples = list(samples)
    base = _daily_cop_points(samples[:-recent_days])
    recent = _daily_cop_points(samples[-recent_days:])
    if len(base) < min_days or not recent:
        return None, len(base)
    n = len(base)
    mx = sum(x for x, _ in base) / n
    my = sum(y for _, y in base) / n
    sxx = sum((x - mx) ** 2 for x, _ in base)
    if sxx < 1e-6:
        return my, n
    slope = sum((x - mx) * (y - my) for x, y in base) / sxx
    return sum(my + slope * (x - mx) for x, _ in recent) / len(recent), n


def _cop_drop(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    """F18: COP deutlich unter dem, was bei diesem Wetter zu erwarten ist.

    Früher gegen den 30-Tage-Wert verglichen – dann schlug jede Kältewelle an.
    """
    if results.cop is None or results.cop_days < 7:
        return []
    expected, base_days = expected_cop(results.samples)
    if expected is None or expected <= 0:
        return []
    drop = expected - results.cop
    if drop < 0.5 or drop / expected < 0.10:
        return []
    return [
        Finding(
            id="F18",
            severity=SEVERITY_WARNING if drop >= 1.0 else SEVERITY_INFO,
            key="cop_drop",
            params={"cop": round(results.cop, 2), "cop_long": round(expected, 2), "drop": round(drop, 2)},
            evidence={
                "cop_7d": round(results.cop, 2),
                "expected": round(expected, 2),
                "outdoor_mean_c": round(results.outdoor_mean, 1) if results.outdoor_mean is not None else None,
                "curve_days": base_days,
            },
        )
    ]


def _flow_spike(results: FindingsInput, thresholds: Thresholds) -> list[Finding]:
    p90 = results.deviation_p90
    if p90 is None or results.deviation_hours < 168:
        return []
    limit = thresholds.flow_deviation_k * 2
    if p90 <= limit:
        return []
    return [
        Finding(
            id="F19",
            severity=SEVERITY_WARNING if p90 > limit * 1.5 else SEVERITY_INFO,
            key="flow_spike",
            params={"p90": round(p90, 1), "threshold": round(limit, 1)},
            evidence={"p90_k": round(p90, 2), "hours": results.deviation_hours},
        )
    ]


RULES = (
    _flow_deviation,
    _cycling,
    _pump_idle,
    _room_deviation,
    _aux_heater,
    _duplicate_sensors,
    _unavailable_sources,
    _defrost,
    _cop_curve,
    _mixer,
    _missing_statistics,
    _power_source,
    _spread,
    _return_temp,
    _heating_curve_suggestion,
    _room_target_plausible,
    _cop_drop,
    _flow_spike,
)


def evaluate(results: FindingsInput, thresholds: Thresholds | None = None) -> list[Finding]:
    """Alle Regeln anwenden, Warnungen zuerst, innerhalb der Gruppe nach ID."""
    limits = thresholds or Thresholds()
    findings: list[Finding] = []
    for rule in RULES:
        findings.extend(rule(results, limits))
    return sorted(findings, key=lambda item: (item.severity != SEVERITY_WARNING, item.id, item.key))


def signature(findings: Sequence[Finding]) -> str:
    """Kennung des Gesamtergebnisses für Ereignisvergleiche."""
    return "|".join(sorted(finding.signature() for finding in findings))
