"""Raumkennzahlen: Soll-Abweichung, Aufheizzeit, Rangliste (reines Python).

Grundlage sind Stichproben aus dem laufenden Betrieb (Standard: alle
fünf Minuten). Die Kennzahlen sind deshalb ausdrücklich stichprobenbasiert
und keine sekundengenaue Auswertung.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime

from .heating_curve import percentile


@dataclass(slots=True, frozen=True)
class RoomReading:
    """Eine Stichprobe eines Raums."""

    at: datetime
    room_id: str
    current_c: float
    target_c: float
    circuit: str | None = None
    valve: float | None = None

    @property
    def deviation(self) -> float:
        return self.current_c - self.target_c


@dataclass(slots=True, frozen=True)
class RoomDeviation:
    """Median, P90 und Zeitanteile der Soll-Abweichung."""

    median: float | None
    p90: float | None
    under_share: float | None
    over_share: float | None
    samples: int

    def as_dict(self) -> dict[str, float | int | None]:
        return {
            "median": self.median,
            "p90": self.p90,
            "under_share": self.under_share,
            "over_share": self.over_share,
            "samples": self.samples,
        }


def _median(values: Sequence[float]) -> float:
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def deviation_stats(readings: Sequence[RoomReading], *, tolerance: float = 1.0) -> RoomDeviation:
    """Abweichung Ist minus Soll.

    ``under``/``over`` zählen Stichproben, die mehr als ``tolerance`` Kelvin
    unter bzw. über dem Soll liegen, als Zeitanteil aller Stichproben.
    """
    values = [reading.deviation for reading in readings]
    if not values:
        return RoomDeviation(None, None, None, None, 0)
    under = sum(1 for value in values if value < -tolerance) / len(values)
    over = sum(1 for value in values if value > tolerance) / len(values)
    p90 = percentile(values, 90)
    return RoomDeviation(
        median=round(_median(values), 2),
        p90=None if p90 is None else round(p90, 2),
        under_share=round(under, 3),
        over_share=round(over, 3),
        samples=len(values),
    )


def heating_up_times(
    readings: Sequence[RoomReading],
    *,
    trigger: float = 0.3,
    tolerance: float = 0.5,
    max_minutes: float = 360.0,
) -> list[float]:
    """Zeit bis zum Erreichen des neuen Solls nach einer Sollwert-Anhebung.

    Flankenerkennung: Steigt das Soll um mindestens ``trigger`` Kelvin, läuft
    die Messung, bis Ist mindestens ``target - tolerance`` erreicht. Wird das
    Ziel nicht innerhalb von ``max_minutes`` erreicht oder sinkt das Soll
    wieder, entfällt der Versuch.
    """
    ordered = sorted(readings, key=lambda item: item.at)
    results: list[float] = []
    start: datetime | None = None
    goal: float | None = None
    previous_target: float | None = None

    for reading in ordered:
        if previous_target is not None and reading.target_c - previous_target >= trigger:
            start = reading.at
            goal = reading.target_c
        previous_target = reading.target_c

        if start is None or goal is None:
            continue

        if reading.target_c < goal - trigger:
            start = None
            goal = None
            continue

        elapsed = (reading.at - start).total_seconds() / 60
        if elapsed > max_minutes:
            start = None
            goal = None
            continue
        if reading.current_c >= goal - tolerance and elapsed > 0:
            results.append(round(elapsed, 1))
            start = None
            goal = None

    return results


def median_heating_up(minutes: Sequence[float]) -> float | None:
    """Median der Aufheizzeiten in Minuten."""
    if not minutes:
        return None
    return round(_median(minutes), 1)


def rank_rooms(stats: Mapping[str, RoomDeviation]) -> list[tuple[str, float]]:
    """Räume nach Median-Abweichung, kalt zuerst (nur mit Stichproben)."""
    scored = [(room_id, result.median) for room_id, result in stats.items() if result.median is not None]
    return sorted(scored, key=lambda item: item[1])


def circuit_ranking(
    stats: Mapping[str, RoomDeviation],
    circuit_of: Mapping[str, str | None],
) -> dict[str, dict[str, float | int | None]]:
    """Je Kreis die mittlere Raum-Abweichung aus den Raum-Medianen."""
    grouped: dict[str, list[float]] = {}
    counts: dict[str, int] = {}
    for room_id, result in stats.items():
        circuit = circuit_of.get(room_id)
        if circuit is None or result.median is None:
            continue
        grouped.setdefault(circuit, []).append(result.median)
        counts[circuit] = counts.get(circuit, 0) + result.samples

    return {
        circuit: {
            "median": round(sum(values) / len(values), 2),
            "rooms": len(values),
            "samples": counts[circuit],
        }
        for circuit, values in sorted(grouped.items())
    }
