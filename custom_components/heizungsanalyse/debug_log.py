"""Debug-Spur: eigener Logging-Handler mit Ringpuffer.

Die Spur nimmt höchstens ``TRACE_LINES`` Zeilen der letzten
``TRACE_HOURS`` Stunden auf. Beim Start wird sie aus dem Speicher geladen,
beim Stoppen von Home Assistant gesichert. Sie enthält keine personenbezogenen
Daten, weil nur die eigenen Debug-Ausgaben gesammelt werden.
"""

from __future__ import annotations

from collections import deque
import contextlib
from datetime import timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .storage import TRACE_HOURS, TRACE_LINES, InventoryStore

_LOGGER = logging.getLogger(__name__)
TRACE_LOGGER = f"custom_components.{DOMAIN}"

_FORMAT = "%(asctime)s %(levelname)s %(name)s %(message)s"


class TraceHandler(logging.Handler):
    """Schreibt Zeilen in die Debug-Spur, nicht in die Datei."""

    def __init__(self, trace: DebugTrace) -> None:
        super().__init__(level=logging.DEBUG)
        self._trace = trace
        self.setFormatter(logging.Formatter(_FORMAT))

    def emit(self, record: logging.LogRecord) -> None:
        with contextlib.suppress(Exception):  # Logging darf nie werfen
            self._trace.add(dt_util.utcnow(), record.levelname.lower(), self.format(record))


class DebugTrace:
    """Ringpuffer der Debug-Zeilen mit Persistenz."""

    def __init__(self, store: InventoryStore) -> None:
        self._store = store
        self._records: deque[dict[str, Any]] = deque(maxlen=TRACE_LINES)
        self._handler: TraceHandler | None = None
        self._dirty = False

    async def async_load(self) -> None:
        raw = await self._store.async_trace_entries(limit=TRACE_LINES)
        self._records.clear()
        for item in raw:
            self._records.append(item)
        cutoff = dt_util.utcnow() - timedelta(hours=TRACE_HOURS)
        while self._records and str(self._records[0].get("ts", "")) < cutoff.isoformat():
            self._records.popleft()

    def bind(self, store: InventoryStore) -> None:
        self._store = store

    def add(self, when, level: str, text: str) -> None:
        self._records.append(
            {
                "ts": when.isoformat(),
                "level": level,
                "msg": text[:500],
            }
        )
        self._dirty = True

    def install(self) -> None:
        """Handler einmalig am eigenen Logger anbringen."""
        logger = logging.getLogger(TRACE_LOGGER)
        if self._handler is None:
            self._handler = TraceHandler(self)
            logger.addHandler(self._handler)
        logger.setLevel(logging.DEBUG)
        logger.propagate = False

    def uninstall(self) -> None:
        logger = logging.getLogger(TRACE_LOGGER)
        if self._handler is not None:
            logger.removeHandler(self._handler)
            self._handler = None

    async def async_save(self) -> None:
        if not self._dirty:
            return
        self._dirty = False
        await self._store.async_set_trace(list(self._records))
        await self._store.async_save_trace()

    async def async_entries(self, *, limit: int = 500) -> list[dict[str, Any]]:
        return list(self._records)[-limit:][::-1]

    async def async_clear(self) -> None:
        self._records.clear()
        self._dirty = True
        await self.async_save()


_TRACE: DebugTrace | None = None


def install_debug_trace(hass: HomeAssistant, store: InventoryStore) -> DebugTrace:
    """Einmalig einrichten und beim Stoppen sichern."""
    global _TRACE
    if _TRACE is None:
        _TRACE = DebugTrace(store)
        _TRACE.install()
        hass.bus.async_listen_once("homeassistant_stop", _stop)
    else:
        # Nach einem Reload gehört die Spur zum neuen Speicher.
        _TRACE.bind(store)
        _TRACE.install()
    return _TRACE


async def _stop(_event) -> None:
    if _TRACE is None:
        return
    _TRACE.uninstall()
    await _TRACE.async_save()


def get_trace() -> DebugTrace | None:
    return _TRACE
