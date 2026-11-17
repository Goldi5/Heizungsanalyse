"""Taktung: Starts und Laufzeit."""

from __future__ import annotations

from datetime import date, datetime

from hz.analysis.cycling import mean_runtime_per_cycle, runtime_hours, starts_per_day
from hz.analysis.heating_curve import curve_bins, deviation, percentile
from hz.analysis.types import DaySample, HourSample


def test_starts_per_day_average() -> None:
    samples = [
        DaySample(date(2026, 11, 1), starts=10.0),
        DaySample(date(2026, 11, 2), starts=14.0),
    ]

    assert starts_per_day(samples) == 12.0


def test_starts_per_day_ignores_missing() -> None:
    samples = [
        DaySample(date(2026, 11, 1), starts=10.0),
        DaySample(date(2026, 11, 2)),
    ]

    assert starts_per_day(samples) == 10.0
    assert starts_per_day([]) is None


def test_mean_runtime_per_cycle() -> None:
    samples = [
        DaySample(date(2026, 11, 1), starts=10.0, runtime_h=5.0),
        DaySample(date(2026, 11, 2), starts=10.0, runtime_h=5.0),
    ]

    assert mean_runtime_per_cycle(samples) == 30.0


def test_mean_runtime_without_starts_is_unknown() -> None:
    samples = [DaySample(date(2026, 11, 1), starts=0.0, runtime_h=5.0)]

    assert mean_runtime_per_cycle(samples) is None


def test_runtime_hours_sums() -> None:
    samples = [
        DaySample(date(2026, 11, 1), runtime_h=4.5),
        DaySample(date(2026, 11, 2), runtime_h=5.5),
    ]

    assert runtime_hours(samples) == 10.0


def test_deviation_only_while_compressor_runs() -> None:
    hours = [
        HourSample(datetime(2026, 11, 1, 10), flow_c=35.0, target_flow_c=30.0, compressor_on=True),
        HourSample(datetime(2026, 11, 1, 11), flow_c=25.0, target_flow_c=30.0, compressor_on=False),
        HourSample(datetime(2026, 11, 1, 12), flow_c=39.0, target_flow_c=30.0, compressor_on=True),
    ]

    result = deviation(hours)

    assert result.count == 2
    assert result.median == 7.0
    assert result.p90 == 9.0


def test_deviation_without_compressor_filter() -> None:
    hours = [
        HourSample(datetime(2026, 11, 1, 10), flow_c=35.0, target_flow_c=30.0),
        HourSample(datetime(2026, 11, 1, 11), flow_c=25.0, target_flow_c=30.0),
    ]

    result = deviation(hours, compressor_only=False)

    assert result.count == 2
    assert result.median == 0.0


def test_deviation_without_values() -> None:
    result = deviation([])

    assert result.median is None
    assert result.count == 0


def test_percentile_nearest_rank() -> None:
    assert percentile([1.0, 2.0, 3.0, 4.0], 90) == 4.0
    assert percentile([], 90) is None


def test_curve_bins_use_outdoor_temperature() -> None:
    samples = [
        DaySample(date(2026, 11, 1), outdoor_c=5.0, target_flow_c=30.0),
        DaySample(date(2026, 11, 2), outdoor_c=5.5, target_flow_c=32.0),
        DaySample(date(2026, 11, 3), outdoor_c=7.0, target_flow_c=28.0),
    ]

    bins = curve_bins(samples)

    assert [item.lower for item in bins] == [4.0, 6.0]
    assert bins[0].target_flow_c == 31.0
