"""COP und COP-Kennlinie."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date

from .series import bin_index
from .types import DaySample


@dataclass(slots=True, frozen=True)
class CopResult:
    """COP eines Zeitfensters samt ausgewiesener Quellen."""

    cop: float | None
    heat_kwh: float
    power_kwh: float
    days: int
    source: str | None = None


@dataclass(slots=True, frozen=True)
class CopBin:
    """Ein Punkt der COP-Kennlinie."""

    lower: float
    upper: float
    cop: float | None
    days: int


def cop_from_totals(
    heat_kwh: float,
    power_kwh: float,
    *,
    days: int = 0,
    source: str | None = None,
) -> CopResult:
    """COP aus zwei Mengen. Ohne Strom oder Waerme bleibt er unbekannt."""
    if heat_kwh <= 0 or power_kwh <= 0:
        return CopResult(None, heat_kwh, power_kwh, days, source)
    return CopResult(heat_kwh / power_kwh, heat_kwh, power_kwh, days, source)


def cop_window(
    samples: Sequence[DaySample],
    *,
    days: int | None = None,
    source: str | None = None,
) -> CopResult:
    """COP ueber die letzten ``days`` Tagesproben.

    Nur Tage mit Waerme und Strom gehen ein; fehlende Tage werden nicht durch
    Nullen ersetzt.
    """
    selected = list(samples) if days is None else list(samples)[-days:]
    usable = [sample for sample in selected if sample.heat_kwh is not None and sample.power_kwh is not None]
    if not usable:
        return CopResult(None, 0.0, 0.0, 0, source)
    heat = sum(sample.heat_kwh for sample in usable if sample.heat_kwh is not None)
    power = sum(sample.power_kwh for sample in usable if sample.power_kwh is not None)
    return cop_from_totals(heat, power, days=len(usable), source=source)


def cop_per_day(samples: Sequence[DaySample]) -> list[tuple[date, float]]:
    """Tages-COP je Tag."""
    result: list[tuple[date, float]] = []
    for sample in samples:
        if sample.heat_kwh is None or sample.power_kwh is None or sample.power_kwh <= 0:
            continue
        result.append((sample.day, sample.heat_kwh / sample.power_kwh))
    return result


def cop_curve(samples: Sequence[DaySample], *, bin_width: float = 2.0) -> list[CopBin]:
    """Tages-COP gegen Aussentemperatur, gebuendelt in ``bin_width``-Schritten."""
    groups: dict[int, list[float]] = {}
    heat: dict[int, float] = {}
    power: dict[int, float] = {}
    for sample in samples:
        if sample.outdoor_c is None or sample.heat_kwh is None or sample.power_kwh is None:
            continue
        if sample.power_kwh <= 0:
            continue
        index = bin_index(sample.outdoor_c, bin_width)
        groups.setdefault(index, []).append(sample.outdoor_c)
        heat[index] = heat.get(index, 0.0) + sample.heat_kwh
        power[index] = power.get(index, 0.0) + sample.power_kwh

    bins: list[CopBin] = []
    for index in sorted(groups):
        total_power = power[index]
        bins.append(
            CopBin(
                lower=index * bin_width,
                upper=(index + 1) * bin_width,
                cop=(heat[index] / total_power) if total_power > 0 else None,
                days=len(groups[index]),
            )
        )
    return bins
