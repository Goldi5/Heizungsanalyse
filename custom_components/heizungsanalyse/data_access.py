"""Schmaler Adapter zur Langzeitstatistik des Recorders.

Nur dieses Modul kennt den Recorder. Die Analyseschicht bekommt neutrale
Werte und weiß nichts davon, woher sie stammen.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from datetime import UTC, datetime, timedelta
import logging
from typing import Any

from homeassistant.components.recorder import get_instance, statistics
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .analysis.types import DayValue, HourValue

_LOGGER = logging.getLogger(__name__)

DAILY_TYPES = {"change", "mean", "state"}
HOURLY_TYPES = {"mean"}


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    return None


def _start(value: Any) -> datetime | None:
    """Beginn einer Statistikzeile.

    Der Recorder liefert ``start`` je nach Version als ``datetime`` oder als
    Unix-Zeitstempel in Sekunden (aktuelle Versionen). Beides wird akzeptiert.
    """
    if isinstance(value, datetime):
        return value
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        seconds = float(value) / 1000 if value > 1e11 else float(value)
        return datetime.fromtimestamp(seconds, tz=UTC)
    return None


def parse_daily_rows(rows: Sequence[dict[str, Any]]) -> list[DayValue]:
    """Statistikzeilen (Tagesperiode) in neutrale Werte umwandeln."""
    result: list[DayValue] = []
    for row in rows:
        start = _start(row.get("start"))
        if start is None:
            continue
        result.append(
            DayValue(
                day=dt_util.as_local(start).date(),
                mean=_number(row.get("mean")),
                change=_number(row.get("change")),
                state=_number(row.get("state")),
            )
        )
    return sorted(result, key=lambda item: item.day)


def parse_hourly_rows(rows: Sequence[dict[str, Any]]) -> list[HourValue]:
    """Statistikzeilen (Stundenperiode) in neutrale Werte umwandeln."""
    result: list[HourValue] = []
    for row in rows:
        start = _start(row.get("start"))
        if start is None:
            continue
        result.append(HourValue(hour=start, mean=_number(row.get("mean"))))
    return sorted(result, key=lambda item: item.hour)


async def _read(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    *,
    start: datetime,
    period: str,
    types: set[str],
) -> dict[str, list[dict[str, Any]]]:
    wanted = {entity_id for entity_id in entity_ids if entity_id}
    if not wanted:
        return {}
    try:
        instance = get_instance(hass)
    except KeyError:
        _LOGGER.debug("Recorder nicht aktiv; keine Statistik verfuegbar")
        return {}

    rows_by_id = await instance.async_add_executor_job(
        statistics.statistics_during_period,
        hass,
        start,
        None,
        wanted,
        period,
        None,
        types,
    )
    return rows_by_id or {}


async def async_read_daily(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    days: int,
) -> dict[str, list[DayValue]]:
    """Tageswerte der letzten ``days`` Tage je Entity."""
    rows_by_id = await _read(
        hass,
        entity_ids,
        start=dt_util.utcnow() - timedelta(days=days),
        period="day",
        types=DAILY_TYPES,
    )
    return {entity_id: parse_daily_rows(rows) for entity_id, rows in rows_by_id.items()}


async def async_read_hourly(
    hass: HomeAssistant,
    entity_ids: Iterable[str],
    days: int,
) -> dict[str, list[HourValue]]:
    """Stundenwerte der letzten ``days`` Tage je Entity."""
    rows_by_id = await _read(
        hass,
        entity_ids,
        start=dt_util.utcnow() - timedelta(days=days),
        period="hour",
        types=HOURLY_TYPES,
    )
    return {entity_id: parse_hourly_rows(rows) for entity_id, rows in rows_by_id.items()}
