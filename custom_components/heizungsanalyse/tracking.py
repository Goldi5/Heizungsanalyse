"""Fensterpuffer fuer Raum- und Kreiskennzahlen (reines Python).

Die Stichproben leben im Arbeitsspeicher und werden nach dem in
``window_days`` festgelegten Zeitraum verworfen. Nach einem Neustart von Home
Assistant beginnt das Fenster leer; das ist an den Sensoren an der
Stichprobenzahl ablesbar.
"""

from __future__ import annotations

from collections import defaultdict, deque
from collections.abc import Iterable, Sequence
from datetime import datetime, timedelta

from .analysis.circuits import CircuitSample, CircuitStats, MixerSample, MixerStats, pump_idle
from .analysis.rooms import (
    RoomDeviation,
    RoomReading,
    circuit_ranking,
    deviation_stats,
    heating_up_times,
    median_heating_up,
    rank_rooms,
)


class RoomTracker:
    """Haelt die letzten Stichproben je Raum."""

    def __init__(self, window_days: int = 7, max_per_room: int = 3000) -> None:
        self._window = timedelta(days=window_days)
        self._max = max_per_room
        self._readings: dict[str, deque[RoomReading]] = defaultdict(lambda: deque(maxlen=max_per_room))

    def add(self, readings: Iterable[RoomReading], now: datetime) -> None:
        cutoff = now - self._window
        for reading in readings:
            bucket = self._readings[reading.room_id]
            bucket.append(reading)
            while bucket and bucket[0].at < cutoff:
                bucket.popleft()

    def readings(self, room_id: str) -> list[RoomReading]:
        return list(self._readings.get(room_id, ()))

    def stats(self, tolerance: float) -> dict[str, RoomDeviation]:
        return {room_id: deviation_stats(room_readings, tolerance=tolerance) for room_id, room_readings in self._readings.items()}

    def heating_up(self, *, trigger: float, tolerance: float, max_minutes: float) -> dict[str, float | None]:
        result: dict[str, float | None] = {}
        for room_id, room_readings in self._readings.items():
            minutes = heating_up_times(
                room_readings,
                trigger=trigger,
                tolerance=tolerance,
                max_minutes=max_minutes,
            )
            result[room_id] = median_heating_up(minutes)
        return result


class CircuitTracker:
    """Haelt die letzten Stichproben je Kreis."""

    def __init__(self, window_days: int = 7, max_per_circuit: int = 3000) -> None:
        self._window = timedelta(days=window_days)
        self._samples: dict[str, deque[CircuitSample]] = defaultdict(lambda: deque(maxlen=max_per_circuit))

    def add(self, samples: Iterable[CircuitSample], now: datetime) -> None:
        cutoff = now - self._window
        for sample in samples:
            bucket = self._samples[sample.circuit_id]
            bucket.append(sample)
            while bucket and bucket[0].at < cutoff:
                bucket.popleft()

    def stats(self, interval_minutes: float) -> dict[str, CircuitStats]:
        return {
            circuit_id: pump_idle(list(samples), interval_minutes=interval_minutes)
            for circuit_id, samples in self._samples.items()
        }


class MixerTracker:
    """Zaehlt steigende Flanken der Mischer-Stellglieder je Tag."""

    def __init__(self, window_days: int = 7) -> None:
        self._window_days = window_days
        self._previous: dict[tuple[str, str], bool] = {}
        self._pulses: dict[str, dict] = defaultdict(dict)
        self._seen: set[str] = set()

    def add(self, samples: Sequence[MixerSample], now: datetime) -> None:
        for sample in samples:
            self._seen.add(sample.circuit_id)
            for name, active in (("open", sample.open_on), ("close", sample.close_on)):
                key = (sample.circuit_id, name)
                was_active = self._previous.get(key, False)
                self._previous[key] = active
                if active and not was_active:
                    day = sample.at.date()
                    per_day = self._pulses[sample.circuit_id]
                    per_day[day] = per_day.get(day, 0) + 1
        self._prune(now)

    def _prune(self, now: datetime) -> None:
        cutoff = now.date() - timedelta(days=self._window_days)
        for per_day in self._pulses.values():
            for day in [day for day in per_day if day < cutoff]:
                del per_day[day]

    def stats(self) -> dict[str, MixerStats]:
        result: dict[str, MixerStats] = {}
        for circuit_id in self._seen | set(self._pulses):
            per_day = self._pulses.get(circuit_id) or {}
            total = sum(per_day.values())
            result[circuit_id] = MixerStats(
                pulses=total,
                pulses_per_day=round(total / len(per_day), 1) if per_day else 0.0,
                days=len(per_day),
            )
        return result


def rank_rooms_with_circuits(stats: dict[str, RoomDeviation], circuit_of: dict[str, str | None]) -> dict[str, object]:
    """Rangliste der Raeume und Mittel je Kreis."""
    ranked = [{"room_id": room_id, "median": median} for room_id, median in rank_rooms(stats)]
    return {"rooms": ranked, "by_circuit": circuit_ranking(stats, circuit_of)}
