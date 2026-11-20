"""Kosten, Wasser und Warmwasserspeicher (reines Python, ohne Home Assistant).

Strompreise sind bei dynamischen Tarifen stündlich verschieden. Die Kosten
werden deshalb Stunde für Stunde gerechnet: Verbrauch der Stunde × Preis zu
Beginn der Stunde. Ein Monatsverbrauch mal dem gerade aktuellen Preis ergibt
bei dynamischen Tarifen beliebige Werte.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass
from datetime import date, datetime, timedelta, tzinfo

# Ein Wohnhaus braucht selten mehr als ein paar Kubikmeter am Tag. Größere Sprünge
# sind Lesefehler des Zählers (z. B. AI-on-the-Edge „Neg. Rate“ und danach ein Satz).
WATER_MAX_M3_PER_DAY = 5.0


@dataclass(slots=True, frozen=True)
class CostResult:
    """Kosten eines Zeitraums."""

    kwh: float
    eur: float | None
    priced_hours: int
    hours: int

    def as_dict(self) -> dict[str, float | int | None]:
        return {"kwh": self.kwh, "eur": self.eur, "priced_hours": self.priced_hours, "hours": self.hours}


def price_at(prices: Sequence[tuple[datetime, float]], when: datetime) -> float | None:
    """Preis, der zu ``when`` galt (letzte Änderung davor)."""
    value = None
    for at, price in prices:
        if at <= when:
            value = price
        else:
            break
    return value


def weighted_cost(
    usage: Mapping[datetime, float],
    prices: Sequence[tuple[datetime, float]],
    *,
    fallback_price: float | None = None,
    since: datetime | None = None,
) -> CostResult:
    """Kosten aus Stundenverbrauch und zeitabhängigem Preis.

    ``usage``: Stundenbeginn → kWh. Negative Werte (Zählertausch) zählen nicht.
    Stunden ohne bekannten Preis nehmen ``fallback_price`` (z. B. fester Preis
    aus dem Energie-Dashboard); ohne beides bleibt der Betrag offen.
    """
    ordered = sorted(prices, key=lambda item: item[0])
    kwh = 0.0
    eur = 0.0
    priced = 0
    hours = 0
    for hour, value in sorted(usage.items()):
        if since is not None and hour < since:
            continue
        if value is None or value < 0:
            continue
        hours += 1
        kwh += value
        price = price_at(ordered, hour)
        if price is None:
            price = fallback_price
        if price is not None:
            eur += value * price
            priced += 1
    if hours == 0:
        return CostResult(0.0, None, 0, 0)
    return CostResult(round(kwh, 2), round(eur, 2) if priced else None, priced, hours)


def heat_price_ct(cost_eur: float | None, heat_kwh: float | None) -> float | None:
    """Was eine Kilowattstunde Wärme gekostet hat, in Cent."""
    if cost_eur is None or not heat_kwh or heat_kwh <= 0:
        return None
    return round(cost_eur / heat_kwh * 100, 1)


def clean_water_days(changes: Mapping[date, float]) -> dict[date, float]:
    """Tagesverbrauch Wasser ohne Lesefehler (negativ oder unplausibel groß)."""
    return {day: round(value, 4) for day, value in changes.items() if value is not None and 0 <= value <= WATER_MAX_M3_PER_DAY}


def month_start(now: datetime, tz: tzinfo) -> datetime:
    local = now.astimezone(tz)
    return local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def sum_since(values: Mapping[date, float], first_day: date) -> float:
    return round(sum(value for day, value in values.items() if day >= first_day), 4)


@dataclass(slots=True, frozen=True)
class DhwStats:
    """Warmwasserspeicher: Ladungen und Abkühlung."""

    charges_per_day: float | None
    charge_minutes: float | None
    cooling_k_per_h: float | None
    days: int

    def as_dict(self) -> dict[str, float | int | None]:
        return {
            "charges_per_day": self.charges_per_day,
            "charge_minutes": self.charge_minutes,
            "cooling_k_per_h": self.cooling_k_per_h,
            "days": self.days,
        }


def _median(values: Sequence[float]) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    mid = len(ordered) // 2
    return ordered[mid] if len(ordered) % 2 else (ordered[mid - 1] + ordered[mid]) / 2


def dhw_stats(
    charges: Sequence[tuple[datetime, datetime]],
    temperatures: Mapping[datetime, float],
    charging_share: Mapping[datetime, float],
    *,
    window_start: datetime,
    now: datetime,
) -> DhwStats:
    """Ladungen pro Tag, mittlere Ladedauer und Abkühlung im Stillstand.

    Abkühlung: Temperaturänderung von Stunde zu Stunde, nur wenn in beiden Stunden
    nicht geladen wurde. Gezapftes Wasser kühlt den Speicher ebenfalls – der Wert
    ist deshalb „Verlust plus Verbrauch“, nachts überwiegt der Verlust.
    """
    days = max(1, round((now - window_start).total_seconds() / 86400))
    inside = [(start, end) for start, end in charges if end > window_start]
    charges_per_day = round(len(inside) / days, 1) if inside else None
    durations = [(end - start).total_seconds() / 60 for start, end in inside if end > start]
    charge_minutes = round(sum(durations) / len(durations), 0) if durations else None

    drops: list[float] = []
    hours = sorted(temperatures)
    for previous, current in zip(hours, hours[1:], strict=False):
        if current - previous != timedelta(hours=1):
            continue
        if charging_share.get(previous, 0.0) > 0 or charging_share.get(current, 0.0) > 0:
            continue
        delta = temperatures[current] - temperatures[previous]
        if delta <= 0:
            drops.append(-delta)
    cooling = _median(drops)
    return DhwStats(charges_per_day, charge_minutes, round(cooling, 2) if cooling is not None else None, days)


def cooling_split(
    temperatures: Mapping[datetime, float],
    charging_share: Mapping[datetime, float],
    circulation_share: Mapping[datetime, float],
) -> tuple[float | None, float | None]:
    """Abkühlung des Speichers mit und ohne laufende Zirkulation (Median, K/h).

    Gezählt werden Stundenpaare ohne Ladung. „Mit“: Zirkulation lief in der
    zweiten Stunde mindestens zur Hälfte; „ohne“: in beiden Stunden gar nicht.
    """
    with_circ: list[float] = []
    without: list[float] = []
    hours = sorted(temperatures)
    for previous, current in zip(hours, hours[1:], strict=False):
        if current - previous != timedelta(hours=1):
            continue
        if charging_share.get(previous, 0.0) > 0 or charging_share.get(current, 0.0) > 0:
            continue
        delta = temperatures[current] - temperatures[previous]
        if delta > 0:
            continue
        share = circulation_share.get(current, 0.0)
        if share >= 0.5:
            with_circ.append(-delta)
        elif share == 0 and circulation_share.get(previous, 0.0) == 0:
            without.append(-delta)
    a, b = _median(with_circ), _median(without)
    return (round(a, 2) if a is not None else None, round(b, 2) if b is not None else None)


def daily_sum(usage: Mapping[datetime, float], tz: tzinfo) -> dict[date, float]:
    out: dict[date, float] = {}
    for hour, value in usage.items():
        if value is None or value < 0:
            continue
        day = hour.astimezone(tz).date()
        out[day] = out.get(day, 0.0) + value
    return {day: round(value, 3) for day, value in out.items()}


def numeric_changes(rows: Iterable[tuple[datetime, str]]) -> list[tuple[datetime, float]]:
    """Zustandsverlauf eines Preis-Sensors als (Zeit, Zahl), ungültige Werte raus."""
    out: list[tuple[datetime, float]] = []
    for at, state in rows:
        try:
            out.append((at, float(state)))
        except (TypeError, ValueError):
            continue
    return out
