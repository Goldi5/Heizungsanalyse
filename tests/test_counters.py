"""Zaehlerdifferenzen und Reset-Erkennung."""

from __future__ import annotations

from datetime import date

from hz.analysis.counters import counter_delta, deltas_from_states


def test_counter_delta_normal() -> None:
    assert counter_delta(100.0, 112.5) == 12.5


def test_counter_delta_handles_reset() -> None:
    """Nach einem Reset gilt der neue Stand als Verbrauch seit dem Reset."""
    assert counter_delta(5000.0, 12.0) == 12.0


def test_counter_delta_unknown_stays_unknown() -> None:
    assert counter_delta(None, 10.0) is None
    assert counter_delta(10.0, None) is None


def test_counter_delta_ignores_negative_current() -> None:
    assert counter_delta(100.0, -5.0) == 0.0


def test_deltas_skip_first_day() -> None:
    states = [
        (date(2026, 11, 1), 100.0),
        (date(2026, 11, 2), 120.0),
        (date(2026, 11, 3), 150.0),
    ]

    deltas = deltas_from_states(states)

    assert deltas == {date(2026, 11, 2): 20.0, date(2026, 11, 3): 30.0}
