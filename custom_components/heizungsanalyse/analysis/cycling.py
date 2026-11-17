"""Taktung: Starts pro Tag und mittlere Laufzeit je Zyklus."""

from __future__ import annotations

from collections.abc import Sequence

from .types import DaySample


def _usable(samples: Sequence[DaySample], days: int | None) -> list[DaySample]:
    return list(samples) if days is None else list(samples)[-days:]


def starts_per_day(samples: Sequence[DaySample], *, days: int | None = None) -> float | None:
    """Durchschnittliche Verdichterstarts pro Tag mit Zählerwerten."""
    usable = [sample for sample in _usable(samples, days) if sample.starts is not None]
    if not usable:
        return None
    total = sum(sample.starts for sample in usable if sample.starts is not None)
    return total / len(usable)


def mean_runtime_per_cycle(
    samples: Sequence[DaySample],
    *,
    days: int | None = None,
) -> float | None:
    """Mittlere Laufzeit je Start in Minuten."""
    usable = [sample for sample in _usable(samples, days) if sample.starts is not None and sample.runtime_h is not None]
    total_starts = sum(sample.starts for sample in usable if sample.starts is not None)
    if not usable or total_starts <= 0:
        return None
    total_minutes = sum(sample.runtime_h * 60 for sample in usable if sample.runtime_h is not None)
    return total_minutes / total_starts


def runtime_hours(samples: Sequence[DaySample], *, days: int | None = None) -> float | None:
    """Summierte Verdichterlaufzeit in Stunden."""
    usable = [sample.runtime_h for sample in _usable(samples, days) if sample.runtime_h is not None]
    if not usable:
        return None
    return sum(usable)
