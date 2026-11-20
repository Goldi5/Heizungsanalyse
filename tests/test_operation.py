"""Zeitstreifen, Zyklen, Raumprofil (ohne Home Assistant)."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from hz.analysis.operation import cycle_histogram, hour_profile, timeline
from hz.analysis.rooms import RoomReading

T0 = datetime(2026, 11, 19, 0, 0, tzinfo=UTC)


def test_timeline_schneidet_am_fensterbeginn() -> None:
    spans = [(T0 - timedelta(hours=2), T0 + timedelta(hours=1)), (T0 - timedelta(hours=5), T0 - timedelta(hours=4))]
    assert timeline(spans, T0) == [[int(T0.timestamp()), int((T0 + timedelta(hours=1)).timestamp())]]


def test_zyklen_klassen_und_kurz_anteil() -> None:
    spans = [(T0, T0 + timedelta(minutes=m)) for m in (8, 15, 95, 130)]
    result = cycle_histogram(spans, T0 - timedelta(days=1))
    assert result["cycles"] == 4
    assert result["counts"][0] == 1  # 0–10 min
    assert result["counts"][1] == 1  # 10–20 min
    assert result["short_share"] == 0.5


def test_raumprofil_je_stunde() -> None:
    readings = [RoomReading(at=T0 + timedelta(days=d, hours=6), room_id="bad", current_c=19.0, target_c=20.0) for d in range(3)]
    profile = hour_profile(readings, UTC)
    assert profile[6] == -1.0
    assert profile[7] is None
