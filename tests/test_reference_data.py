"""Referenzdaten aus dem Plan: 14 Tage, COP ca. 3,8, Starts 7 bis 13 pro Tag."""

from __future__ import annotations

from datetime import date
import json
from pathlib import Path

import pytest

from hz.analysis.cop import cop_curve, cop_per_day, cop_window
from hz.analysis.cycling import mean_runtime_per_cycle, starts_per_day
from hz.analysis.series import build_samples
from hz.analysis.types import DaySample

FIXTURE = Path(__file__).parent / "fixtures" / "reference_14_days.json"


def _load() -> tuple[dict, list[DaySample]]:
    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    samples = build_samples(
        heat={date.fromisoformat(item["day"]): item["heat_kwh"] for item in data["days"]},
        power={date.fromisoformat(item["day"]): item["power_kwh"] for item in data["days"]},
        outdoor={date.fromisoformat(item["day"]): item["outdoor_c"] for item in data["days"]},
        starts={date.fromisoformat(item["day"]): item["starts"] for item in data["days"]},
        runtime={date.fromisoformat(item["day"]): item["runtime_h"] for item in data["days"]},
    )
    return data, samples


def test_overall_cop_matches_plan() -> None:
    data, samples = _load()

    result = cop_window(samples)

    assert result.days == 14
    assert result.cop == pytest.approx(data["expected"]["cop_overall"], abs=0.05)
    assert result.heat_kwh == pytest.approx(1294.0)
    assert result.power_kwh == pytest.approx(340.0)


def test_daily_cop_within_plan_range() -> None:
    data, samples = _load()

    daily = cop_per_day(samples)

    assert len(daily) == 14
    for _, value in daily:
        assert data["expected"]["cop_daily_min"] <= value <= data["expected"]["cop_daily_max"]


def test_starts_per_day_within_plan_range() -> None:
    data, samples = _load()

    value = starts_per_day(samples)

    assert value is not None
    assert data["expected"]["starts_per_day_min"] <= value <= data["expected"]["starts_per_day_max"]


def test_runtime_per_cycle_is_plausible() -> None:
    _, samples = _load()

    value = mean_runtime_per_cycle(samples)

    assert value is not None
    assert 25 <= value <= 40


def test_cop_curve_bins() -> None:
    _, samples = _load()

    curve = cop_curve(samples, bin_width=2.0)

    assert [item.lower for item in curve] == [4.0, 6.0]
    assert all(item.cop is not None and 3.0 < item.cop < 4.5 for item in curve)
    assert sum(item.days for item in curve) == 14


def test_window_limits_days() -> None:
    _, samples = _load()

    result = cop_window(samples, days=7)

    assert result.days == 7
    assert result.cop is not None
