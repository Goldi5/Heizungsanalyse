"""Heizkurven-Assistent: aus den Räumen ableiten, ob ein Heizkreis zu warm oder zu kalt fährt.

Grundlage sind die Raumabweichungen (Ist − Soll) der letzten Tage, die Raumklima
bzw. die Thermostate liefern. Ein Heizkreis ist zu warm eingestellt, wenn alle
seine Räume ihr Ziel praktisch immer halten und im Mittel darüber liegen. Er ist
zu kalt, wenn die Mehrheit seiner Räume oft darunter bleibt. Bleiben nur einzelne
Räume zurück, liegt es an deren Heizkörper (Engpass) – dann hilft eine höhere
Kurve dem Rest nicht, sie kostet nur COP.

Reines Python, ohne Home Assistant.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from statistics import median
from typing import Any

MIN_SAMPLES = 500  # gut 1,5 Tage bei 5-Minuten-Werten
COLD_SHARE = 0.15  # Raum gilt als zu kalt, wenn er so oft unter dem Soll liegt
SAFE_SHARE = 0.05  # „hält sein Ziel“: höchstens so oft darunter
WARM_MEDIAN = 0.3  # im Mittel so viel über dem Soll = Reserve
STEP = 0.5


def advise(rooms: Sequence[Mapping[str, Any]], controls: Sequence[Mapping[str, Any]]) -> list[dict[str, Any]]:
    """Ein Vorschlag je Heizkreis mit Räumen und Raum-Soll-Regler."""
    by_circuit: dict[str, list[Mapping[str, Any]]] = {}
    for room in rooms:
        dev = room.get("deviation") or {}
        if room.get("circuit") and (dev.get("samples") or 0) >= MIN_SAMPLES and dev.get("median") is not None:
            by_circuit.setdefault(str(room["circuit"]), []).append(room)

    result: list[dict[str, Any]] = []
    for circuit, members in by_circuit.items():
        day = next((c for c in controls if c.get("circuit") == circuit and c.get("field") == "room_day"), None)
        night = next((c for c in controls if c.get("circuit") == circuit and c.get("field") == "room_night"), None)
        cold = [r for r in members if (r["deviation"].get("under_share") or 0) > COLD_SHARE]
        medians = [float(r["deviation"]["median"]) for r in members]
        typical = round(median(medians), 2)
        names = [str(r.get("name") or r.get("id")) for r in cold]
        entry: dict[str, Any] = {
            "circuit": circuit,
            "circuit_name": members[0].get("circuit_name"),
            "rooms": len(members),
            "median": typical,
            "cold_rooms": names,
            "changes": [],
        }
        if len(cold) * 2 > len(members):
            entry["action"] = "raise"
            delta = STEP
        elif cold:
            entry["action"] = "bottleneck"
            delta = 0.0
        elif all((r["deviation"].get("under_share") or 0) <= SAFE_SHARE for r in members) and typical >= WARM_MEDIAN:
            entry["action"] = "lower"
            delta = -STEP
        else:
            entry["action"] = "ok"
            delta = 0.0
        if delta and day and day.get("value") is not None:
            new_day = round(float(day["value"]) + delta, 1)
            if day["min"] <= new_day <= day["max"]:
                entry["changes"].append({"key": day["key"], "from": day["value"], "to": new_day})
                # Absenkung mitziehen, wenn sie heute gleich dem Tageswert ist
                if night and night.get("value") == day.get("value") and night["min"] <= new_day <= night["max"]:
                    entry["changes"].append({"key": night["key"], "from": night["value"], "to": new_day})
        result.append(entry)
    return result
