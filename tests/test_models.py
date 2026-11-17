"""Datenmodell fuer Heizkreise und Raeume (ohne Home Assistant)."""

from __future__ import annotations

from hz.models import HeatingCircuit, Room, slug, unique_id


def test_slug_transliterates_umlauts() -> None:
    assert slug("Fussbodenheizung Kueche") == "fussbodenheizung_kueche"
    assert slug("Gästezimmer") == "gastezimmer"
    assert slug("HK 2 / oben") == "hk_2_oben"


def test_slug_falls_back_for_empty_text() -> None:
    assert slug("---") == "item"


def test_unique_id_appends_counter() -> None:
    existing = ["bad", "bad_2"]
    assert unique_id(existing, "Bad") == "bad_3"
    assert unique_id([], "Bad oben") == "bad_oben"


def test_circuit_roundtrip() -> None:
    circuit = HeatingCircuit(
        id="hk2",
        name="Heizkreis oben",
        type="radiators",
        temperature_entity="sensor.hk2",
        pump_entity="binary_sensor.hk2_pumpe",
    )

    restored = HeatingCircuit.from_dict(circuit.as_dict())

    assert restored == circuit
    assert restored.mixer_open_entity is None


def test_circuit_from_dict_defaults() -> None:
    circuit = HeatingCircuit.from_dict({"id": "hk1", "name": "Puffer"})

    assert circuit.type == "radiators"
    assert circuit.temperature_entity is None


def test_room_roundtrip_without_control() -> None:
    room = Room(id="schlafzimmer", name="Schlafzimmer", circuit="hk3")

    restored = Room.from_dict(room.as_dict())

    assert restored == room
    assert restored.climate_entity is None
    assert restored.valve_position_entity is None
