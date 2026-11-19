"""Fensterpuffer der Raum- und Kreisdaten (ohne Home Assistant)."""

from __future__ import annotations

from datetime import datetime, timedelta

from hz.analysis.circuits import CircuitSample, MixerSample
from hz.analysis.rooms import RoomReading
from hz.tracking import CircuitTracker, MixerTracker, RoomTracker, rank_rooms_with_circuits

NOW = datetime(2026, 11, 17, 12, 0)


def _reading(at: datetime, room: str = "az", current: float = 20.0, target: float = 21.0) -> RoomReading:
    return RoomReading(at=at, room_id=room, current_c=current, target_c=target)


def test_room_tracker_prunes_old_readings() -> None:
    tracker = RoomTracker(window_days=7)
    tracker.add([_reading(NOW - timedelta(days=10), current=10.0)], NOW)
    tracker.add([_reading(NOW, current=20.0)], NOW)

    readings = tracker.readings("az")

    assert len(readings) == 1
    assert readings[0].current_c == 20.0


def test_room_tracker_separates_rooms() -> None:
    tracker = RoomTracker(window_days=7)
    tracker.add([_reading(NOW, room="az", current=20.0), _reading(NOW, room="bad", current=23.0, target=21.0)], NOW)

    stats = tracker.stats(1.0)

    assert stats["az"].median == -1.0
    assert stats["bad"].median == 2.0
    assert set(stats) == {"az", "bad"}


def test_room_tracker_heating_up_median() -> None:
    tracker = RoomTracker(window_days=7)
    base = NOW - timedelta(minutes=60)
    tracker.add(
        [
            _reading(base, current=19.0, target=19.0),
            _reading(base + timedelta(minutes=5), current=19.0, target=21.0),
            _reading(base + timedelta(minutes=45), current=20.7, target=21.0),
        ],
        NOW,
    )

    assert tracker.heating_up(trigger=0.3, tolerance=0.5, max_minutes=360, min_episodes=1) == {"az": 40.0}
    # Ein einzelner Fall reicht für die Anzeige nicht – sonst bestimmt ein Zufall den Wert
    assert tracker.heating_up(trigger=0.3, tolerance=0.5, max_minutes=360) == {"az": None}


def test_circuit_tracker_stats() -> None:
    tracker = CircuitTracker(window_days=7)
    tracker.add(
        [
            CircuitSample(at=NOW - timedelta(minutes=5), circuit_id="hk2", pump_on=True, compressor_on=False),
            CircuitSample(at=NOW, circuit_id="hk2", pump_on=True, compressor_on=True),
        ],
        NOW,
    )

    stats = tracker.stats(interval_minutes=5)

    assert stats["hk2"].idle_share == 0.5


def test_mixer_tracker_counts_and_prunes() -> None:
    tracker = MixerTracker(window_days=7)
    tracker.add([MixerSample(at=NOW - timedelta(days=10), circuit_id="hk2", open_on=True, close_on=False)], NOW)
    tracker.add([MixerSample(at=NOW, circuit_id="hk2", open_on=False, close_on=True)], NOW)

    stats = tracker.stats()

    assert stats["hk2"].days == 1
    assert stats["hk2"].pulses == 1


def test_ranking_combines_rooms_and_circuits() -> None:
    readings = [
        _reading(NOW, room="az", current=18.0),
        _reading(NOW, room="bad", current=21.0),
    ]
    tracker = RoomTracker(window_days=7)
    tracker.add(readings, NOW)

    result = rank_rooms_with_circuits(tracker.stats(1.0), {"az": "hk2", "bad": "hk2"})

    assert result["rooms"][0] == {"room_id": "az", "median": -3.0}
    assert result["by_circuit"]["hk2"]["rooms"] == 2
