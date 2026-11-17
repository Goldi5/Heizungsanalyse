"""An/Aus-Verläufe: Laufzeiten, Starts, Stundenanteile (ohne Home Assistant)."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta

from hz.analysis.onoff import as_on, grid, hours_per_day, intervals, share_per_hour, starts_per_day, value_at

T0 = datetime(2026, 11, 10, 0, 0, tzinfo=UTC)


def _h(hours: float) -> datetime:
    return T0 + timedelta(hours=hours)


def test_intervals_with_open_end_and_unknown() -> None:
    changes = [(_h(-1), True), (_h(1), False), (_h(2), None), (_h(3), True)]
    spans = intervals(changes, T0, _h(5))
    assert spans == [(T0, _h(1)), (_h(3), _h(5))]


def test_hours_and_starts_per_day() -> None:
    spans = [(T0, _h(1)), (_h(3), _h(5)), (_h(23), _h(25))]
    assert hours_per_day(spans, UTC) == {date(2026, 11, 10): 4.0, date(2026, 11, 11): 1.0}
    # der Lauf ab Fensterbeginn zählt nicht als Start
    assert starts_per_day(spans, UTC, T0) == {date(2026, 11, 10): 2}


def test_share_per_hour() -> None:
    spans = [(_h(0.5), _h(1.25))]
    shares = share_per_hour(spans, [T0, _h(1), _h(2)])
    assert shares == {T0: 0.5, _h(1): 0.25, _h(2): 0.0}


def test_value_at_grid() -> None:
    changes = [(_h(0), "a"), (_h(1), "b")]
    times = grid(_h(0.5), _h(2), 30)
    assert value_at(changes, times) == [(_h(0.5), "a"), (_h(1), "b"), (_h(1.5), "b")]
    assert value_at(changes, [_h(-1)]) == []


def test_as_on() -> None:
    assert as_on("on") is True
    assert as_on("off") is False
    assert as_on("unavailable") is None
