"""Tagesreihen aus Statistikwerten bauen."""

from __future__ import annotations

from datetime import date

from hz.analysis.series import build_samples, counter_by_day, energy_by_day, mean_by_day
from hz.analysis.types import DayValue


def test_energy_prefers_change() -> None:
    values = [DayValue(date(2026, 11, 1), change=5.0, state=1000.0)]

    assert energy_by_day(values) == {date(2026, 11, 1): 5.0}


def test_energy_falls_back_to_state_delta() -> None:
    """Bei state_class total fehlt change; dann zaehlen die Staende."""
    values = [
        DayValue(date(2026, 11, 1), state=1000.0),
        DayValue(date(2026, 11, 2), state=1030.0),
    ]

    assert energy_by_day(values) == {date(2026, 11, 2): 30.0}


def test_counter_by_day_uses_states() -> None:
    values = [
        DayValue(date(2026, 11, 1), state=100.0),
        DayValue(date(2026, 11, 2), state=107.0),
    ]

    assert counter_by_day(values) == {date(2026, 11, 2): 7.0}


def test_mean_by_day_skips_missing() -> None:
    values = [DayValue(date(2026, 11, 1), mean=6.5), DayValue(date(2026, 11, 2))]

    assert mean_by_day(values) == {date(2026, 11, 1): 6.5}


def test_build_samples_merges_days() -> None:
    heat = {date(2026, 11, 1): 80.0, date(2026, 11, 2): 90.0}
    power = {date(2026, 11, 2): 25.0}
    outdoor = {date(2026, 11, 1): 4.0}

    samples = build_samples(heat=heat, power=power, outdoor=outdoor)

    assert [sample.day for sample in samples] == [date(2026, 11, 1), date(2026, 11, 2)]
    assert samples[0].power_kwh is None
    assert samples[1].outdoor_c is None
    assert samples[1].heat_kwh == 90.0
