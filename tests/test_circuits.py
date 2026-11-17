"""Kreiskennzahlen (ohne Home Assistant)."""

from __future__ import annotations

from datetime import date, datetime, timedelta

from hz.analysis.circuits import (
    CircuitSample,
    MixerSample,
    mixer_pulses,
    pulses_per_day,
    pump_idle,
    rank_circuits,
)

BASE = datetime(2026, 11, 10, 8, 0)


def _sample(minutes: int, pump: bool, compressor: bool, circuit: str = "hk2") -> CircuitSample:
    return CircuitSample(
        at=BASE + timedelta(minutes=minutes),
        circuit_id=circuit,
        pump_on=pump,
        compressor_on=compressor,
    )


def test_pump_idle_share() -> None:
    samples = [
        _sample(0, pump=True, compressor=True),
        _sample(5, pump=True, compressor=True),
        _sample(10, pump=True, compressor=False),
        _sample(15, pump=True, compressor=False),
        _sample(20, pump=False, compressor=False),
    ]

    stats = pump_idle(samples)

    assert stats.samples == 4
    assert stats.pump_minutes == 20.0
    assert stats.idle_minutes == 10.0
    assert stats.idle_share == 0.5


def test_pump_idle_without_pump_runtime() -> None:
    stats = pump_idle([_sample(0, pump=False, compressor=True)])

    assert stats.idle_share is None
    assert stats.samples == 0


def test_mixer_pulses_count_rising_edges() -> None:
    samples = [
        MixerSample(at=BASE, circuit_id="hk2", open_on=False, close_on=False),
        MixerSample(at=BASE + timedelta(minutes=5), circuit_id="hk2", open_on=True, close_on=False),
        MixerSample(at=BASE + timedelta(minutes=10), circuit_id="hk2", open_on=True, close_on=False),
        MixerSample(at=BASE + timedelta(minutes=15), circuit_id="hk2", open_on=False, close_on=False),
        MixerSample(at=BASE + timedelta(minutes=20), circuit_id="hk2", open_on=False, close_on=True),
    ]

    pulses = mixer_pulses(samples)

    assert pulses["hk2"] == {date(2026, 11, 10): 2}


def test_mixer_pulses_split_by_day() -> None:
    late = BASE.replace(hour=23, minute=58)
    samples = [
        MixerSample(at=late, circuit_id="hk3", open_on=True, close_on=False),
        MixerSample(at=late + timedelta(minutes=5), circuit_id="hk3", open_on=False, close_on=False),
        MixerSample(at=late + timedelta(minutes=10), circuit_id="hk3", open_on=True, close_on=False),
    ]

    pulses = mixer_pulses(samples)

    assert pulses["hk3"] == {date(2026, 11, 10): 1, date(2026, 11, 11): 1}


def test_pulses_per_day() -> None:
    assert pulses_per_day({date(2026, 11, 10): 2, date(2026, 11, 11): 4}) == 3.0
    assert pulses_per_day({}) is None


def test_rank_circuits_most_idle_first() -> None:
    stats = {
        "hk2": pump_idle([_sample(0, True, True), _sample(5, True, False)]),
        "hk3": pump_idle([_sample(0, True, True), _sample(5, True, True)]),
    }

    assert rank_circuits(stats) == [("hk2", 0.5), ("hk3", 0.0)]
