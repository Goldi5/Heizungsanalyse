"""Raumkennzahlen (ohne Home Assistant)."""

from __future__ import annotations

from datetime import datetime, timedelta

from hz.analysis.rooms import (
    RoomDeviation,
    RoomReading,
    circuit_ranking,
    deviation_stats,
    heating_up_times,
    median_heating_up,
    rank_rooms,
)

BASE = datetime(2026, 11, 10, 8, 0)


def _reading(minutes: int, current: float, target: float = 21.0, room: str = "az") -> RoomReading:
    return RoomReading(
        at=BASE + timedelta(minutes=minutes),
        room_id=room,
        current_c=current,
        target_c=target,
    )


def test_deviation_stats() -> None:
    readings = [_reading(0, 21.0), _reading(5, 20.0), _reading(10, 19.0), _reading(15, 23.0)]

    stats = deviation_stats(readings)

    assert stats.samples == 4
    assert stats.median == -0.5
    assert stats.under_share == 0.25
    assert stats.over_share == 0.25
    assert stats.p90 == 2.0


def test_deviation_stats_empty() -> None:
    stats = deviation_stats([])

    assert stats == RoomDeviation(None, None, None, None, 0)


def test_heating_up_reaches_target() -> None:
    readings = [
        _reading(0, 20.0, target=20.0),
        _reading(5, 20.0, target=22.0),
        _reading(15, 21.0, target=22.0),
        _reading(45, 21.6, target=22.0),
    ]

    assert heating_up_times(readings) == [40.0]


def test_heating_up_ignores_small_change() -> None:
    readings = [_reading(0, 20.0, 20.0), _reading(5, 20.0, 20.2), _reading(10, 20.3, 20.2)]

    assert heating_up_times(readings) == []


def test_heating_up_timeout() -> None:
    readings = [
        _reading(0, 19.0, 19.0),
        _reading(5, 19.0, 21.0),
        _reading(400, 20.0, 21.0),
    ]

    assert heating_up_times(readings, max_minutes=360) == []


def test_heating_up_drop_cancels() -> None:
    readings = [
        _reading(0, 19.0, 19.0),
        _reading(5, 19.0, 21.0),
        _reading(10, 19.5, 18.0),
        _reading(20, 20.5, 18.0),
    ]

    assert heating_up_times(readings) == []


def test_median_heating_up() -> None:
    assert median_heating_up([10.0, 20.0, 60.0]) == 20.0
    assert median_heating_up([]) is None


def test_rank_rooms_coldest_first() -> None:
    stats = {
        "warm": RoomDeviation(1.5, 2.0, 0.0, 0.4, 10),
        "kalt": RoomDeviation(-1.2, -0.5, 0.6, 0.0, 10),
        "leer": RoomDeviation(None, None, None, None, 0),
    }

    assert rank_rooms(stats) == [("kalt", -1.2), ("warm", 1.5)]


def test_circuit_ranking_groups_rooms() -> None:
    stats = {
        "az": RoomDeviation(-0.5, 0.0, 0.2, 0.0, 10),
        "wohnen": RoomDeviation(0.5, 1.0, 0.0, 0.3, 10),
        "bad": RoomDeviation(-1.5, -1.0, 0.5, 0.0, 10),
    }
    circuit_of = {"az": "hk2", "wohnen": "hk3", "bad": "hk2"}

    ranked = circuit_ranking(stats, circuit_of)

    assert ranked["hk2"] == {"median": -1.0, "rooms": 2, "samples": 20}
    assert ranked["hk3"] == {"median": 0.5, "rooms": 1, "samples": 10}


def test_heating_up_ignoriert_kleines_nachstellen() -> None:
    """Soll +0,5 K bei einem Raum, der schon fast warm ist, ist keine Aufheizung."""
    readings = [
        _reading(0, 19.8, target=19.5),
        _reading(5, 19.8, target=20.0),
        _reading(10, 19.9, target=20.0),
    ]

    assert heating_up_times(readings) == []


def test_climate_values_raumklima_und_trv() -> None:
    from hz.analysis.rooms import climate_values

    # Normales Thermostat
    assert climate_values("heat", {"current_temperature": 17.4, "temperature": 20.0}) == (17.4, 20.0, None)
    assert climate_values("off", {"current_temperature": 17.4, "temperature": 20.0}) is None
    # Raumklima: echter Raumfühler, Ventil in Prozent
    rk = {"plan_reason": "normal", "current_temperature": 18.6, "temperature": 20.0, "valve_position": 38.0}
    assert climate_values("heat", rk) == (18.6, 20.0, 38.0)
    # Raumklima im Beobachtungsmodus (Fußboden ohne Thermostat): Komfort als Soll
    monitor = {"plan_reason": "monitor", "monitor": True, "current_temperature": 21.9, "comfort_temperature": 20.0}
    assert climate_values("unknown", monitor) == (21.9, 20.0, None)
    assert climate_values("unknown", {"current_temperature": 21.9}) is None
