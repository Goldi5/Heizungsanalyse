"""Heizkurve und Vorlauf-Abweichung."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
import math

from .series import bin_index
from .types import DaySample, HourSample


@dataclass(slots=True, frozen=True)
class DeviationResult:
    """Abweichung Ist- gegen Soll-Vorlauf."""

    median: float | None
    p90: float | None
    count: int


@dataclass(slots=True, frozen=True)
class CurveBin:
    """Ein Punkt der Ist-Heizkurve."""

    lower: float
    upper: float
    target_flow_c: float | None
    days: int


def percentile(values: Sequence[float], percent: float) -> float | None:
    """Perzentil nach Nearest-Rank (keine Interpolation)."""
    if not values:
        return None
    ordered = sorted(values)
    rank = math.ceil(percent / 100 * len(ordered))
    index = min(max(rank - 1, 0), len(ordered) - 1)
    return ordered[index]


def deviation(hours: Sequence[HourSample], *, compressor_only: bool = True) -> DeviationResult:
    """Median und P90 von Ist minus Soll, nur bei laufendem Verdichter."""
    values = [
        hour.flow_c - hour.target_flow_c
        for hour in hours
        if hour.flow_c is not None and hour.target_flow_c is not None and (not compressor_only or hour.compressor_on is True)
    ]
    if not values:
        return DeviationResult(None, None, 0)
    values.sort()
    median = values[len(values) // 2] if len(values) % 2 else (values[len(values) // 2 - 1] + values[len(values) // 2]) / 2
    return DeviationResult(median, percentile(values, 90), len(values))


def curve_bins(samples: Sequence[DaySample], *, bin_width: float = 2.0) -> list[CurveBin]:
    """Soll-Vorlauf gegen Aussentemperatur, gebuendelt in ``bin_width``-Schritten."""
    groups: dict[int, list[float]] = {}
    outdoor: dict[int, list[float]] = {}
    for sample in samples:
        if sample.outdoor_c is None or sample.target_flow_c is None:
            continue
        index = bin_index(sample.outdoor_c, bin_width)
        groups.setdefault(index, []).append(sample.target_flow_c)
        outdoor.setdefault(index, []).append(sample.outdoor_c)

    bins: list[CurveBin] = []
    for index in sorted(groups):
        values = groups[index]
        bins.append(
            CurveBin(
                lower=index * bin_width,
                upper=(index + 1) * bin_width,
                target_flow_c=sum(values) / len(values),
                days=len(outdoor[index]),
            )
        )
    return bins
