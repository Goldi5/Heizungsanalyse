"""Hydraulik der Wärmepumpe: Spreizung, Wärmeleistung, Puffer-Ladung (reines Python).

Eingang sind Stundenmittel aus der Langzeitstatistik (Vorlauf und Rücklauf der
Wärmepumpe, Volumenstrom, elektrische Leistung, Puffer-Soll) und der Laufanteil
des Verdichters je Stunde. Bewertet werden nur Stunden, in denen der Verdichter
überwiegend lief – im Stillstand gleichen sich Vor- und Rücklauf an und die
Spreizung wäre künstlich klein.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import date, datetime, tzinfo

# Wärmekapazität von Wasser in kJ/(kg·K); 1 l ≈ 1 kg
WATER_KJ_PER_KG_K = 4.186
RUNNING_SHARE = 0.5


@dataclass(slots=True, frozen=True)
class SpreadResult:
    """Spreizung (Vorlauf minus Rücklauf der Wärmepumpe) bei laufendem Verdichter."""

    median: float | None
    p10: float | None
    p90: float | None
    hours: int

    def as_dict(self) -> dict[str, float | int | None]:
        return {"median": self.median, "p10": self.p10, "p90": self.p90, "hours": self.hours}


EMPTY_SPREAD = SpreadResult(None, None, None, 0)


def _quantile(values: list[float], q: float) -> float:
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    position = (len(ordered) - 1) * q
    low = int(position)
    high = min(low + 1, len(ordered) - 1)
    return ordered[low] + (ordered[high] - ordered[low]) * (position - low)


def running_hours(
    hours: Mapping[datetime, float] | set[datetime],
    running: Mapping[datetime, float] | None,
) -> list[datetime]:
    """Stunden, in denen der Verdichter überwiegend lief. Ohne Laufdaten: alle."""
    if not running:
        return sorted(hours)
    return sorted(hour for hour in hours if running.get(hour, 0.0) >= RUNNING_SHARE)


def spread_hours(
    hp_flow: Mapping[datetime, float],
    hp_return: Mapping[datetime, float],
    running: Mapping[datetime, float] | None = None,
) -> dict[datetime, float]:
    """Spreizung je Stunde mit laufendem Verdichter."""
    common = set(hp_flow) & set(hp_return)
    return {hour: round(hp_flow[hour] - hp_return[hour], 3) for hour in running_hours(common, running)}


def spread_stats(values: Mapping[datetime, float]) -> SpreadResult:
    data = [v for v in values.values() if v is not None]
    if not data:
        return EMPTY_SPREAD
    return SpreadResult(
        round(_quantile(data, 0.5), 2),
        round(_quantile(data, 0.1), 2),
        round(_quantile(data, 0.9), 2),
        len(data),
    )


def daily_median(values: Mapping[datetime, float], tz: tzinfo) -> dict[date, float]:
    """Tagesmedian einer Stundenreihe (lokaler Tag)."""
    groups: dict[date, list[float]] = {}
    for hour, value in values.items():
        groups.setdefault(hour.astimezone(tz).date(), []).append(value)
    return {day: round(_quantile(items, 0.5), 2) for day, items in groups.items()}


def heat_kw(volume_l_min: float | None, spread_k: float | None) -> float | None:
    """Thermische Leistung aus Volumenstrom und Spreizung."""
    if volume_l_min is None or spread_k is None or volume_l_min <= 0:
        return None
    return round(volume_l_min / 60 * WATER_KJ_PER_KG_K * spread_k, 2)


def power_kw(value: float | None, unit: str | None) -> float | None:
    """Elektrische Leistung in kW (W wird umgerechnet)."""
    if value is None:
        return None
    return round(value / 1000, 3) if (unit or "").strip() == "W" else round(value, 3)


def live(
    *,
    hp_flow: float | None,
    hp_return: float | None,
    volume_l_min: float | None,
    power: float | None,
    running: bool | None,
) -> dict[str, float | bool | None]:
    """Momentanwerte: Spreizung, Wärmeleistung, Strom, COP jetzt."""
    spread = None if hp_flow is None or hp_return is None else round(hp_flow - hp_return, 2)
    heat = heat_kw(volume_l_min, spread) if running is not False else 0.0
    cop = None
    if running is not False and heat is not None and power is not None and power >= 0.1 and heat > 0:
        cop = round(heat / power, 2)
    return {"spread": spread, "heat_kw": heat, "power_kw": power, "cop": cop, "running": running}


def overshoot_hours(
    hp_flow: Mapping[datetime, float],
    target: Mapping[datetime, float],
    running: Mapping[datetime, float] | None = None,
) -> dict[datetime, float]:
    """Puffer-Ladung: wie weit der WP-Vorlauf über dem Puffer-Soll liegt (laufender Verdichter)."""
    common = set(hp_flow) & set(target)
    return {hour: round(hp_flow[hour] - target[hour], 3) for hour in running_hours(common, running)}


def cop_with_dhw(samples, days: int) -> dict[str, float | int | None]:
    """COP inklusive Warmwasser: (Heizwärme + WW-Wärme) / (Heizstrom + WW-Strom)."""
    usable = [
        s
        for s in list(samples)[-days:]
        if s.heat_kwh is not None
        and s.power_kwh is not None
        and getattr(s, "dhw_heat_kwh", None) is not None
        and getattr(s, "dhw_power_kwh", None) is not None
    ]
    heat = sum(s.heat_kwh + s.dhw_heat_kwh for s in usable)
    power = sum(s.power_kwh + s.dhw_power_kwh for s in usable)
    if not usable or power <= 0:
        return {"value": None, "days": len(usable), "heat_kwh": round(heat, 1), "power_kwh": round(power, 1)}
    return {"value": round(heat / power, 2), "days": len(usable), "heat_kwh": round(heat, 1), "power_kwh": round(power, 1)}
