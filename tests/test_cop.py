"""COP-Berechnung und Kennlinie."""

from __future__ import annotations

from datetime import date

from hz.analysis.cop import cop_from_totals, cop_per_day, cop_window
from hz.analysis.types import DaySample


def test_cop_from_totals() -> None:
    result = cop_from_totals(80.0, 25.0, days=1, source="primary")

    assert result.cop == 3.2
    assert result.source == "primary"


def test_cop_without_power_is_unknown() -> None:
    result = cop_from_totals(80.0, 0.0, days=1)

    assert result.cop is None
    assert result.power_kwh == 0.0


def test_cop_window_skips_incomplete_days() -> None:
    samples = [
        DaySample(date(2026, 11, 1), heat_kwh=80.0, power_kwh=25.0),
        DaySample(date(2026, 11, 2), heat_kwh=90.0),
        DaySample(date(2026, 11, 3), heat_kwh=100.0, power_kwh=25.0),
    ]

    result = cop_window(samples)

    assert result.days == 2
    assert result.heat_kwh == 180.0
    assert result.cop == 3.6


def test_cop_window_empty() -> None:
    result = cop_window([])

    assert result.cop is None
    assert result.days == 0


def test_cop_per_day_skips_zero_power() -> None:
    samples = [
        DaySample(date(2026, 11, 1), heat_kwh=80.0, power_kwh=20.0),
        DaySample(date(2026, 11, 2), heat_kwh=80.0, power_kwh=0.0),
    ]

    assert cop_per_day(samples) == [(date(2026, 11, 1), 4.0)]
