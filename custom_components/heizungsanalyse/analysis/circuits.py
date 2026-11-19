"""Kreiskennzahlen: Pumpen-Leerlauf und Mischer-Impulse (reines Python).

Grundlage sind Stichproben im Takt des Coordinators (Standard: fünf Minuten).
Mischer-Impulse werden deshalb nur im Stichprobenraster erkannt; schnelleres
Takten wird unterschätzt und das ist an den Sensoren ausgewiesen.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date, datetime


@dataclass(slots=True, frozen=True)
class CircuitSample:
    """Eine Stichprobe von Pumpe und Verdichter eines Kreises."""

    at: datetime
    circuit_id: str
    pump_on: bool
    compressor_on: bool


@dataclass(slots=True, frozen=True)
class CircuitStats:
    """Pumpenlaufzeit und Anteil ohne Wärmebedarf."""

    pump_minutes: float
    idle_minutes: float
    idle_share: float | None
    samples: int
    run_share: float | None = None  # Anteil der Zeit, in der die Pumpe läuft
    total_samples: int = 0

    def as_dict(self) -> dict[str, float | int | None]:
        return {
            "pump_minutes": self.pump_minutes,
            "idle_minutes": self.idle_minutes,
            "idle_share": self.idle_share,
            "samples": self.samples,
            "run_share": self.run_share,
            "total_samples": self.total_samples,
        }


def pump_idle(samples: Sequence[CircuitSample], *, interval_minutes: float = 5.0) -> CircuitStats:
    """Anteil der Pumpenlaufzeit ohne laufenden Verdichter.

    Nur Stichproben mit laufender Pumpe zählen; steht die Pumpe still, ist das
    kein Leerlauf, sondern Ruhe.
    """
    running = [sample for sample in samples if sample.pump_on]
    total = len(samples)
    run_share = round(len(running) / total, 3) if total else None
    if not running:
        return CircuitStats(0.0, 0.0, None, 0, run_share, total)
    idle = sum(1 for sample in running if not sample.compressor_on)
    return CircuitStats(
        pump_minutes=round(len(running) * interval_minutes, 1),
        idle_minutes=round(idle * interval_minutes, 1),
        idle_share=round(idle / len(running), 3),
        samples=len(running),
        run_share=run_share,
        total_samples=total,
    )


@dataclass(slots=True, frozen=True)
class MixerStats:
    """Mischer-Impulse eines Kreises im Beobachtungsfenster."""

    pulses: int
    pulses_per_day: float | None
    days: int
    resolution_minutes: int = 5

    def as_dict(self) -> dict[str, int | float | None]:
        return {
            "pulses": self.pulses,
            "pulses_per_day": self.pulses_per_day,
            "days": self.days,
            "resolution_minutes": self.resolution_minutes,
        }


@dataclass(slots=True, frozen=True)
class MixerSample:
    """Stichprobe der Mischer-Stellglieder eines Kreises."""

    at: datetime
    circuit_id: str
    open_on: bool
    close_on: bool


def mixer_pulses(samples: Sequence[MixerSample]) -> dict[str, dict[date, int]]:
    """Steigende Flanken der Mischer-Stellglieder je Kreis und Tag."""
    previous: dict[tuple[str, str], bool] = {}
    pulses: dict[str, dict[date, int]] = {}

    for sample in sorted(samples, key=lambda item: item.at):
        for name, active in (("open", sample.open_on), ("close", sample.close_on)):
            key = (sample.circuit_id, name)
            was_active = previous.get(key, False)
            previous[key] = active
            if active and not was_active:
                day = sample.at.date()
                per_circuit = pulses.setdefault(sample.circuit_id, {})
                per_circuit[day] = per_circuit.get(day, 0) + 1
    return pulses


def pulses_per_day(pulses: Mapping[date, int]) -> float | None:
    """Mittlere Impulse pro Tag mit mindestens einer Stichprobe."""
    if not pulses:
        return None
    return round(sum(pulses.values()) / len(pulses), 1)


def rank_circuits(stats: Mapping[str, CircuitStats]) -> list[tuple[str, float]]:
    """Kreise mit Leerlaufanteil, höchster Anteil zuerst."""
    scored = [(circuit_id, result.idle_share) for circuit_id, result in stats.items() if result.idle_share is not None]
    return sorted(scored, key=lambda item: item[1], reverse=True)
