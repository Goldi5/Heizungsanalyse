"""An/Aus-Verläufe auswerten (reines Python).

Binärsensoren (Verdichter, Abtauung, Heizstab, Pumpen, Mischer) haben in Home
Assistant keine Langzeitstatistik. Ihr Zustandsverlauf reicht aber für
Laufzeiten, Starts und Stundenanteile. Eingang sind Zustandswechsel als
``(zeitpunkt, an)``; ``an`` ist ``None`` bei unbekanntem Zustand.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable, Sequence
from datetime import date, datetime, timedelta, tzinfo

Change = tuple[datetime, bool | None]
Interval = tuple[datetime, datetime]


def intervals(changes: Iterable[Change], start: datetime, end: datetime) -> list[Interval]:
    """Zeiträume mit Zustand „an“ innerhalb ``[start, end]``."""
    ordered = sorted(changes, key=lambda item: item[0])
    result: list[Interval] = []
    on_since: datetime | None = None
    for at, on in ordered:
        at = max(at, start)
        if at > end:
            break
        if on and on_since is None:
            on_since = at
        elif not on and on_since is not None:
            if at > on_since:
                result.append((on_since, at))
            on_since = None
    if on_since is not None and end > on_since:
        result.append((on_since, end))
    return result


def _split_by_day(interval: Interval, tz: tzinfo) -> Iterable[tuple[date, float]]:
    start, end = interval
    cursor = start
    while cursor < end:
        local = cursor.astimezone(tz)
        next_midnight = datetime.combine(local.date() + timedelta(days=1), datetime.min.time(), tz)
        stop = min(end, next_midnight)
        yield local.date(), (stop - cursor).total_seconds() / 3600
        cursor = stop


def hours_per_day(spans: Sequence[Interval], tz: tzinfo) -> dict[date, float]:
    """Stunden „an“ je lokalem Tag."""
    result: dict[date, float] = {}
    for span in spans:
        for day, hours in _split_by_day(span, tz):
            result[day] = result.get(day, 0.0) + hours
    return {day: round(hours, 3) for day, hours in result.items()}


def starts_per_day(spans: Sequence[Interval], tz: tzinfo, window_start: datetime) -> dict[date, int]:
    """Einschaltvorgänge je Tag. Ein Lauf, der schon vor dem Fenster lief, zählt nicht."""
    result: dict[date, int] = {}
    for start, _end in spans:
        if start <= window_start:
            continue
        day = start.astimezone(tz).date()
        result[day] = result.get(day, 0) + 1
    return result


def share_per_hour(spans: Sequence[Interval], hours: Iterable[datetime]) -> dict[datetime, float]:
    """Anteil „an“ je Stunde (Stundenbeginn als Schlüssel)."""
    result: dict[datetime, float] = {}
    for hour in hours:
        stop = hour + timedelta(hours=1)
        on = 0.0
        for start, end in spans:
            if end <= hour or start >= stop:
                continue
            on += (min(end, stop) - max(start, hour)).total_seconds()
        result[hour] = round(on / 3600, 3)
    return result


def value_at(changes: Sequence[tuple[datetime, object]], times: Iterable[datetime]) -> list[tuple[datetime, object]]:
    """Wert zu festen Zeitpunkten: jeweils der letzte Wechsel davor (Raster-Abtastung)."""
    ordered = sorted(changes, key=lambda item: item[0])
    result: list[tuple[datetime, object]] = []
    index = -1
    for at in sorted(times):
        while index + 1 < len(ordered) and ordered[index + 1][0] <= at:
            index += 1
        if index >= 0:
            result.append((at, ordered[index][1]))
    return result


def grid(start: datetime, end: datetime, minutes: int) -> list[datetime]:
    """Gleichmäßige Zeitpunkte von ``start`` bis ``end`` (ohne ``end``)."""
    step = timedelta(minutes=minutes)
    out: list[datetime] = []
    cursor = start
    while cursor < end:
        out.append(cursor)
        cursor += step
    return out


def as_on(state: str | None, is_on: Callable[[str], bool] | None = None) -> bool | None:
    """Zustandstext in an/aus übersetzen; unbekannt bleibt ``None``."""
    if state is None or state in ("unavailable", "unknown", ""):
        return None
    if is_on is not None:
        return is_on(state)
    return state in ("on", "true", "heat", "heating", "running", "1")
