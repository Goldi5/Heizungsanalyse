"""Ereignisprotokoll der Integration (Adapter auf den eigenen Speicher).

Das Protokoll ist der einzige Schreibpfad im Betrieb: Der Coordinator und die
Dienste hängen hier Einträge an. Gelesen wird über den Websocket-Befehl
``heizungsanalyse/log`` und über die Diagnose.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.util import dt as dt_util

from .analysis.event_log import EventLogBuffer, LogEntry, restart_entry
from .storage import InventoryStore

_LOGGER = logging.getLogger(__name__)


class EventLog:
    """Ringpuffer mit Persistenz; Einträge werden verzögert gesichert."""

    def __init__(self, store: InventoryStore) -> None:
        self._store = store
        self._buffer = EventLogBuffer()
        self._loaded = False

    async def async_load(self) -> None:
        if self._loaded:
            return
        raw = await self._store.async_log_entries(limit=5000, newest_first=False)
        for item in raw:
            try:
                self._buffer.add(LogEntry.from_dict(item))
            except (TypeError, ValueError):
                _LOGGER.debug("Protokolleintrag ohne Zeitstempel verworfen")
        self._loaded = True

    async def async_add(
        self,
        level: str,
        cat: str,
        msg: str,
        *,
        key: str = "",
        params: dict[str, Any] | None = None,
        details: dict[str, Any] | None = None,
        ts: datetime | None = None,
    ) -> dict[str, Any]:
        """Eintrag anhängen; ``msg`` ist der deutsche Text."""
        await self.async_load()
        entry = LogEntry(
            ts=ts or dt_util.utcnow(),
            level=level,
            cat=cat,
            msg=msg,
            key=key,
            params=dict(params or {}),
            details=dict(details or {}),
        )
        self._buffer.add(entry)
        await self._store.async_append_log([entry.as_dict()])
        return entry.as_dict()

    async def async_add_many(self, entries: list[dict[str, Any]]) -> int:
        """Mehrere fertige Einträge (dicts) anhängen."""
        await self.async_load()
        converted: list[dict[str, Any]] = []
        for item in entries:
            prepared = dict(item)
            prepared.setdefault("ts", dt_util.utcnow().isoformat())
            try:
                converted.append(LogEntry.from_dict(prepared).as_dict())
            except (TypeError, ValueError):
                continue
        if not converted:
            return 0
        for item in converted:
            try:
                self._buffer.add(LogEntry.from_dict(item))
            except (TypeError, ValueError):
                continue
        return await self._store.async_append_log(converted)

    async def async_start(self) -> bool:
        """Neustart-Marker setzen. ``True``, wenn schon Einträge da waren."""
        await self.async_load()
        had_entries = len(self._buffer) > 0
        entry = restart_entry(dt_util.utcnow())
        self._buffer.add(entry)
        await self._store.async_append_log([entry.as_dict()])
        return had_entries

    async def async_query(
        self,
        *,
        since: datetime | None = None,
        level: str | None = None,
        cat: str | None = None,
        q: str = "",
        limit: int = 500,
    ) -> list[dict[str, Any]]:
        await self.async_load()
        return [entry.as_dict() for entry in self._buffer.query(since=since, level=level, cat=cat, q=q, limit=limit)]

    async def async_all(self, *, limit: int = 500) -> list[dict[str, Any]]:
        await self.async_load()
        return [entry.as_dict() for entry in self._buffer.entries()[:limit]]

    async def async_last_hours(self, hours: int) -> list[dict[str, Any]]:
        await self.async_load()
        since = dt_util.utcnow() - timedelta(hours=hours)
        return await self.async_query(since=since, limit=5000)

    async def async_flush(self) -> None:
        await self._store.async_flush()
