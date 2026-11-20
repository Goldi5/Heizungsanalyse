"""Betrieb über den Tag: Zeitstreifen, Zyklen, Raumprofil (reines Python)."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, tzinfo

CYCLE_BINS: tuple[int, ...] = (0, 10, 20, 30, 45, 60, 90, 120, 180)


def timeline(spans: Sequence[tuple[datetime, datetime]], since: datetime) -> list[list[int]]:
    """An-Zeiten ab ``since`` als [Start, Ende] in Sekunden seit 1970 (kompakt fürs Frontend)."""
    out: list[list[int]] = []
    for start, end in spans:
        if end <= since:
            continue
        out.append([int(max(start, since).timestamp()), int(end.timestamp())])
    return out


def cycle_histogram(spans: Sequence[tuple[datetime, datetime]], since: datetime, *, open_end: datetime | None = None) -> dict:
    """Laufzeiten je Verdichterstart in Klassen (Minuten). Ein noch laufender Zyklus zählt nicht."""
    counts = [0] * len(CYCLE_BINS)
    minutes: list[float] = []
    for start, end in spans:
        if start < since or (open_end is not None and end >= open_end):
            continue
        length = (end - start).total_seconds() / 60
        minutes.append(length)
        index = 0
        for i, lower in enumerate(CYCLE_BINS):
            if length >= lower:
                index = i
        counts[index] += 1
    short = sum(1 for value in minutes if value < 20)
    return {
        "bins": list(CYCLE_BINS),
        "counts": counts,
        "cycles": len(minutes),
        "short_share": round(short / len(minutes), 3) if minutes else None,
        "median_min": round(sorted(minutes)[len(minutes) // 2], 0) if minutes else None,
    }


def hour_profile(readings: Sequence, tz: tzinfo) -> list[float | None]:
    """Median Ist − Soll je Uhrzeit (0–23 Uhr, Ortszeit) über alle Stichproben."""
    buckets: list[list[float]] = [[] for _ in range(24)]
    for reading in readings:
        hour = reading.at.astimezone(tz).hour
        buckets[hour].append(reading.current_c - reading.target_c)
    out: list[float | None] = []
    for values in buckets:
        if len(values) < 3:
            out.append(None)
            continue
        ordered = sorted(values)
        mid = len(ordered) // 2
        median = ordered[mid] if len(ordered) % 2 else (ordered[mid - 1] + ordered[mid]) / 2
        out.append(round(median, 2))
    return out
