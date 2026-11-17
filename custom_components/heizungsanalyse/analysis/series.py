"""Tagesreihen aus Statistikwerten bauen (reines Python)."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import date
import math

from .counters import deltas_from_states
from .types import DaySample, DayValue


def energy_by_day(values: Sequence[DayValue]) -> dict[date, float]:
    """Energieverbrauch je Tag.

    Bevorzugt die vom Recorder berechnete Differenz (``change``). Fehlt sie
    (z. B. bei ``state_class: total``), wird sie aus den Zählerständen
    berechnet, inklusive Reset-Erkennung.
    """
    by_day: dict[date, float] = {}
    states: list[tuple[date, float]] = []
    for value in values:
        if value.change is not None and value.change >= 0:
            by_day[value.day] = value.change
        elif value.state is not None:
            states.append((value.day, value.state))

    if states:
        for day, delta in deltas_from_states(states).items():
            by_day.setdefault(day, delta)
    return by_day


def counter_by_day(values: Sequence[DayValue]) -> dict[date, float]:
    """Zählerdifferenz je Tag (Starts, Laufzeit, ...)."""
    states = [(value.day, value.state) for value in values if value.state is not None]
    return deltas_from_states(states)


def mean_by_day(values: Sequence[DayValue]) -> dict[date, float]:
    """Tagesmittel je Tag (Außentemperatur, Vorlauf, ...)."""
    return {value.day: value.mean for value in values if value.mean is not None}


def build_samples(
    *,
    heat: dict[date, float] | None = None,
    power: dict[date, float] | None = None,
    outdoor: dict[date, float] | None = None,
    starts: dict[date, float] | None = None,
    runtime: dict[date, float] | None = None,
    flow: dict[date, float] | None = None,
    target_flow: dict[date, float] | None = None,
    dhw_heat: dict[date, float] | None = None,
    aux_hours: dict[date, float] | None = None,
    defrost_hours: dict[date, float] | None = None,
) -> list[DaySample]:
    """Tagesproben aus den vorhandenen Reihen zusammensetzen.

    Maßgeblich ist der Tag, an dem Wärme oder Strom vorliegt; weitere Reihen
    füllen nur auf. Tage ohne Wärme und ohne Strom entfallen.
    """
    heat = heat or {}
    power = power or {}
    days = sorted(set(heat) | set(power))
    samples: list[DaySample] = []
    for day in days:
        samples.append(
            DaySample(
                day=day,
                heat_kwh=heat.get(day),
                power_kwh=power.get(day),
                outdoor_c=(outdoor or {}).get(day),
                starts=(starts or {}).get(day),
                runtime_h=(runtime or {}).get(day),
                flow_c=(flow or {}).get(day),
                target_flow_c=(target_flow or {}).get(day),
                dhw_heat_kwh=(dhw_heat or {}).get(day),
                aux_hours=(aux_hours or {}).get(day),
                defrost_hours=(defrost_hours or {}).get(day),
            )
        )
    return samples


def bin_index(value: float, width: float) -> int:
    """Index des Bins, in den ``value`` fällt."""
    return math.floor(value / width)
