"""Zeitfenster vergleichen (ohne Home Assistant)."""

from __future__ import annotations

from datetime import date

from hz.analysis.periods import compare_periods, merge_samples, samples_from_rollups, summarize, within
from hz.analysis.types import DaySample


def test_samples_from_rollups() -> None:
    rollups = {
        "2026-11-02": {"heat_kwh": 90.0, "power_kwh": 24.0, "outdoor_c": 6.0},
        "2026-11-01": {"heat_kwh": 80.0, "power_kwh": 25.0, "outdoor_c": 5.0},
    }

    samples = samples_from_rollups(rollups)

    assert [sample.day for sample in samples] == [date(2026, 11, 1), date(2026, 11, 2)]
    assert samples[0].heat_kwh == 80.0


def test_merge_samples_fresh_wins() -> None:
    base = [DaySample(date(2026, 11, 1), heat_kwh=80.0)]
    fresh = [DaySample(date(2026, 11, 1), heat_kwh=85.0)]

    merged = merge_samples(base, fresh)

    assert len(merged) == 1
    assert merged[0].heat_kwh == 85.0


def test_within_is_inclusive() -> None:
    samples = [DaySample(date(2026, 11, day), heat_kwh=1.0) for day in (1, 2, 3, 4)]

    result = within(samples, date(2026, 11, 2), date(2026, 11, 3))

    assert [sample.day.day for sample in result] == [2, 3]


def test_summarize_rounds() -> None:
    samples = [
        DaySample(date(2026, 11, 1), heat_kwh=80.0, power_kwh=25.0, starts=10.0, runtime_h=5.0),
    ]

    summary = summarize(samples)

    assert summary["cop"] == 3.2
    assert summary["starts_per_day"] == 10.0
    assert summary["runtime_per_cycle_min"] == 30.0


def test_compare_periods_splits_around_change() -> None:
    samples = [DaySample(date(2026, 11, day), heat_kwh=80.0, power_kwh=25.0) for day in range(1, 15)]

    result = compare_periods(samples, change_day=date(2026, 11, 8), days=7)

    assert result["before"]["days"] == 7
    assert result["after"]["days"] == 7
    assert result["before"]["cop"] == 3.2
    assert result["change_day"] == "2026-11-08"


def test_compare_periods_without_data() -> None:
    result = compare_periods([], change_day=date(2026, 11, 8), days=7)

    assert result["before"]["cop"] is None
    assert result["after"]["days"] == 0
