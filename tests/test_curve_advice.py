"""Heizkurven-Assistent: senken, anheben, Engpass."""

from __future__ import annotations

from hz.analysis.curve_advice import advise

DAY = {"key": "number.tag_hk3", "circuit": "hk3", "field": "room_day", "value": 22.0, "min": 16.0, "max": 25.0}
NIGHT = {"key": "number.abs_hk3", "circuit": "hk3", "field": "room_night", "value": 22.0, "min": 14.0, "max": 25.0}


def room(name: str, med: float, under: float, circuit: str = "hk3") -> dict:
    return {"name": name, "circuit": circuit, "circuit_name": "HK3", "deviation": {"median": med, "under_share": under, "samples": 2000}}


def test_alle_raeume_zu_warm_heisst_senken() -> None:
    [res] = advise([room("Wohnzimmer", 1.2, 0.0), room("Küche", 0.4, 0.0)], [DAY, NIGHT])
    assert res["action"] == "lower"
    assert res["changes"] == [{"key": "number.tag_hk3", "from": 22.0, "to": 21.5}, {"key": "number.abs_hk3", "from": 22.0, "to": 21.5}]


def test_einzelner_kalter_raum_ist_ein_engpass() -> None:
    rooms = [room("Arbeitszimmer", 0.1, 0.14), room("Sportzimmer", 0.2, 0.25), room("Finja", 0.4, 0.01)]
    [res] = advise(rooms, [DAY])
    assert res["action"] == "bottleneck"
    assert res["cold_rooms"] == ["Sportzimmer"]
    assert res["changes"] == []


def test_mehrheit_zu_kalt_heisst_anheben() -> None:
    [res] = advise([room("A", -0.6, 0.4), room("B", -0.3, 0.3), room("C", 0.2, 0.0)], [DAY])
    assert res["action"] == "raise"
    assert res["changes"][0]["to"] == 22.5


def test_zu_wenig_daten_kein_vorschlag() -> None:
    thin = room("A", 1.0, 0.0)
    thin["deviation"]["samples"] = 10
    assert advise([thin], [DAY]) == []
