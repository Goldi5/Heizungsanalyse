"""Zählerdifferenzen inklusive Reset-Erkennung."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import date


def counter_delta(previous: float | None, current: float | None) -> float | None:
    """Verbrauch zwischen zwei Zählerständen.

    Ein Rückgang bedeutet einen Reset. Danach gilt der aktuelle Stand als
    seit dem Reset verbrauchte Menge - so verhält sich ein Zähler, der bei
    null beginnt. Unbekannte Werte bleiben ``None``; es wird nichts geschätzt.
    """
    if previous is None or current is None:
        return None
    delta = current - previous
    if delta < 0:
        return max(current, 0.0)
    return delta


def deltas_from_states(states: Sequence[tuple[date, float]]) -> dict[date, float]:
    """Tägliche Deltas aus einer Reihe von Zählerständen.

    Der erste Tag hat keinen Vorgänger und liefert daher keinen Verbrauch.
    """
    result: dict[date, float] = {}
    previous: float | None = None
    for day, state in states:
        delta = counter_delta(previous, state)
        if delta is not None:
            result[day] = delta
        previous = state
    return result
