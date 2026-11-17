"""Spreizung, Wärmeleistung, Puffer-Ladung und COP mit Warmwasser (ohne Home Assistant)."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta

from hz.analysis.findings import Thresholds, evaluate
from hz.analysis.hydraulics import (
    cop_with_dhw,
    daily_median,
    heat_kw,
    live,
    overshoot_hours,
    power_kw,
    spread_hours,
    spread_stats,
)
from hz.analysis.types import DaySample

H0 = datetime(2026, 11, 10, 0, tzinfo=UTC)


def _h(n: int) -> datetime:
    return H0 + timedelta(hours=n)


def test_spread_only_running_hours() -> None:
    flow = {_h(0): 36.5, _h(1): 34.0, _h(2): 37.0}
    ret = {_h(0): 34.2, _h(1): 33.9, _h(2): 33.5}
    running = {_h(0): 1.0, _h(1): 0.1, _h(2): 0.8}
    spreads = spread_hours(flow, ret, running)
    assert spreads == {_h(0): 2.3, _h(2): 3.5}
    stats = spread_stats(spreads)
    assert stats.hours == 2 and stats.median == 2.9
    assert daily_median(spreads, UTC) == {date(2026, 11, 10): 2.9}
    # ohne Laufdaten zählen alle Stunden
    assert len(spread_hours(flow, ret, None)) == 3


def test_heat_and_live_cop() -> None:
    assert heat_kw(20.0, 2.3) == 3.21
    assert heat_kw(0.0, 2.3) is None
    assert power_kw(600.0, "W") == 0.6
    now = live(hp_flow=36.5, hp_return=34.2, volume_l_min=20.0, power=0.6, running=True)
    assert now["spread"] == 2.3 and now["heat_kw"] == 3.21 and now["cop"] == 5.35
    off = live(hp_flow=33.0, hp_return=33.0, volume_l_min=0.0, power=0.0, running=False)
    assert off["cop"] is None and off["heat_kw"] == 0.0


def test_overshoot() -> None:
    over = overshoot_hours({_h(0): 36.5}, {_h(0): 32.4}, {_h(0): 1.0})
    assert over == {_h(0): 4.1}


def test_cop_with_dhw() -> None:
    samples = [
        DaySample(date(2026, 11, d), heat_kwh=90.0, power_kwh=22.0, dhw_heat_kwh=10.0, dhw_power_kwh=3.0) for d in range(1, 8)
    ]
    out = cop_with_dhw(samples, 7)
    assert out["value"] == 4.0 and out["days"] == 7
    assert cop_with_dhw([DaySample(date(2026, 11, 1), heat_kwh=90.0, power_kwh=22.0)], 7)["value"] is None


def _base(**kw):
    from hz.analysis.findings import FindingsInput

    return FindingsInput(**kw)


def test_f14_spread_low_and_high() -> None:
    assert [f.key for f in evaluate(_base(spread_median=2.3, spread_hours=40))] == ["spread_low"]
    assert [f.key for f in evaluate(_base(spread_median=9.0, spread_hours=40))] == ["spread_high"]
    assert evaluate(_base(spread_median=5.0, spread_hours=40)) == []
    assert evaluate(_base(spread_median=2.0, spread_hours=5)) == []
    assert evaluate(_base(spread_median=2.8, spread_hours=40), Thresholds(spread_min_k=2.5)) == []
