"""Zeitfenster vergleichen (reines Python)."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from datetime import date, timedelta
from typing import Any

from .cop import cop_window
from .cycling import mean_runtime_per_cycle, starts_per_day
from .types import DaySample


def samples_from_rollups(rollups: Mapping[str, Mapping[str, Any]]) -> list[DaySample]:
    """Gespeicherte Tageswerte in Proben umwandeln."""
    samples: list[DaySample] = []
    for day, values in rollups.items():
        samples.append(
            DaySample(
                day=date.fromisoformat(day),
                heat_kwh=values.get("heat_kwh"),
                power_kwh=values.get("power_kwh"),
                outdoor_c=values.get("outdoor_c"),
                starts=values.get("starts"),
                runtime_h=values.get("runtime_h"),
                flow_c=values.get("flow_c"),
                target_flow_c=values.get("target_flow_c"),
                dhw_heat_kwh=values.get("dhw_heat_kwh"),
                dhw_power_kwh=values.get("dhw_power_kwh"),
            )
        )
    return sorted(samples, key=lambda sample: sample.day)


def merge_samples(base: Sequence[DaySample], fresh: Sequence[DaySample]) -> list[DaySample]:
    """Roll-ups mit frischen Werten zusammenführen; frische Werte gewinnen."""
    merged: dict[date, DaySample] = {sample.day: sample for sample in base}
    merged.update({sample.day: sample for sample in fresh})
    return sorted(merged.values(), key=lambda sample: sample.day)


def within(samples: Sequence[DaySample], start: date, end: date) -> list[DaySample]:
    """Proben im geschlossenen Intervall [start, end]."""
    return [sample for sample in samples if start <= sample.day <= end]


def summarize(samples: Sequence[DaySample]) -> dict[str, Any]:
    """Kennzahlen eines Fensters, ohne Quellen zu verschweigen."""
    cop = cop_window(samples)
    return {
        "days": cop.days,
        "heat_kwh": round(cop.heat_kwh, 1),
        "power_kwh": round(cop.power_kwh, 1),
        "cop": None if cop.cop is None else round(cop.cop, 2),
        "starts_per_day": _rounded(starts_per_day(samples), 1),
        "runtime_per_cycle_min": _rounded(mean_runtime_per_cycle(samples), 1),
    }


def compare_periods(
    samples: Sequence[DaySample],
    *,
    change_day: date,
    days: int,
) -> dict[str, Any]:
    """Fenster vor und nach einem Stichtag vergleichen."""
    before = within(samples, change_day - timedelta(days=days), change_day - timedelta(days=1))
    after = within(samples, change_day, change_day + timedelta(days=days - 1))
    return {
        "change_day": change_day.isoformat(),
        "window_days": days,
        "before": summarize(before),
        "after": summarize(after),
    }


def _rounded(value: float | None, digits: int) -> float | None:
    return None if value is None else round(value, digits)
