"""Statistikzeilen in neutrale Werte umwandeln."""

from __future__ import annotations

from datetime import UTC, date, datetime

from homeassistant.util import dt as dt_util

from custom_components.heizungsanalyse.data_access import parse_daily_rows, parse_hourly_rows


def _local_midnight_utc(year: int, month: int, day: int) -> datetime:
    """Tagesstatistik startet um lokale Mitternacht, gespeichert in UTC."""
    local = datetime(year, month, day, tzinfo=dt_util.DEFAULT_TIME_ZONE)
    return dt_util.as_utc(local)


def test_parse_daily_rows() -> None:
    rows = [
        {"start": _local_midnight_utc(2026, 11, 1), "mean": None, "change": 5.5, "state": 1000.0},
        {"start": _local_midnight_utc(2026, 11, 2), "mean": None, "change": None, "state": 1030.0},
    ]

    values = parse_daily_rows(rows)

    assert values[0].day == date(2026, 11, 1)
    assert values[0].change == 5.5
    assert values[1].change is None
    assert values[1].state == 1030.0


def test_parse_daily_rows_skips_invalid() -> None:
    rows = [{"start": "kein Datum", "change": 1.0}, {"start": _local_midnight_utc(2026, 11, 1)}]

    values = parse_daily_rows(rows)

    assert len(values) == 1
    assert values[0].change is None


def test_parse_hourly_rows_sorted() -> None:
    rows = [
        {"start": datetime(2026, 11, 1, 11, tzinfo=UTC), "mean": 35.0},
        {"start": datetime(2026, 11, 1, 10, tzinfo=UTC), "mean": 34.0},
    ]

    values = parse_hourly_rows(rows)

    assert [value.mean for value in values] == [34.0, 35.0]
