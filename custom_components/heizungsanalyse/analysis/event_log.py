"""Ereignisprotokoll als Ringpuffer (reines Python, ohne Home Assistant).

Ein Eintrag hält Zeit, Stufe, Kategorie, Nachricht und Details. Der Puffer
begrenzt sich selbst: höchstens ``limit`` Einträge und höchstens
``retention_days`` Tage. Die Reihenfolge beim Lesen ist neueste zuerst.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
from typing import Any

RESTART_MESSAGE = "— Neustart —"
RESTART_KEY = "log.restart"

LEVELS: tuple[str, ...] = ("info", "warn", "error")
CATEGORIES: tuple[str, ...] = (
    "start",
    "update",
    "source",
    "finding",
    "config",
    "inventory",
    "dashboard",
    "frontend",
    "error",
)

DEFAULT_LIMIT = 2000
DEFAULT_RETENTION_DAYS = 30


@dataclass(frozen=True, slots=True)
class LogEntry:
    """Ein Protokolleintrag.

    ``msg`` ist der fertige deutsche Text. ``key`` und ``params`` erlauben der
    Oberfläche, denselben Eintrag auf Englisch zu zeigen.
    """

    ts: datetime
    level: str
    cat: str
    msg: str
    key: str = ""
    params: dict[str, Any] = field(default_factory=dict)
    details: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "ts": self.ts.isoformat(),
            "level": self.level,
            "cat": self.cat,
            "msg": self.msg,
            "key": self.key,
            "params": dict(self.params),
            "details": dict(self.details),
        }

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> LogEntry:
        ts = raw.get("ts")
        if isinstance(ts, datetime):
            when = ts
        else:
            when = datetime.fromisoformat(str(ts))
        return cls(
            ts=when,
            level=str(raw.get("level") or "info"),
            cat=str(raw.get("cat") or "info"),
            msg=str(raw.get("msg") or ""),
            key=str(raw.get("key") or ""),
            params=dict(raw.get("params") or {}),
            details=dict(raw.get("details") or {}),
        )


def restart_entry(now: datetime) -> LogEntry:
    """Trennlinie zwischen zwei Läufen von Home Assistant."""
    return LogEntry(ts=now, level="info", cat="start", msg=RESTART_MESSAGE, key=RESTART_KEY)


def _contains(haystack: str, needle: str) -> bool:
    return needle.casefold() in haystack.casefold()


class EventLogBuffer:
    """Ringpuffer mit Zeit- und Mengenbegrenzung."""

    def __init__(self, *, limit: int = DEFAULT_LIMIT, retention_days: int = DEFAULT_RETENTION_DAYS) -> None:
        self._limit = limit
        self._retention = timedelta(days=retention_days)
        self._entries: list[LogEntry] = []
        self._newest: datetime | None = None

    def __len__(self) -> int:
        return len(self._entries)

    def add(self, entry: LogEntry) -> None:
        self._entries.append(entry)
        # Die Zeitgrenze bezieht sich auf den jüngsten Eintrag, nicht auf den
        # gerade hinzugefügten: sonst bleibt Müll beim Rückwärtsimport liegen.
        if self._newest is None or entry.ts > self._newest:
            self._newest = entry.ts
        self.prune()

    def extend(self, entries: list[LogEntry]) -> None:
        for entry in entries:
            self.add(entry)

    def prune(self, now: datetime | None = None) -> None:
        """Alte Einträge und Überhang verwerfen (neueste bleiben)."""
        reference = now or self._newest or datetime.now()
        cutoff = reference - self._retention
        self._entries = [entry for entry in self._entries if entry.ts >= cutoff]
        if len(self._entries) > self._limit:
            self._entries = sorted(self._entries, key=lambda entry: entry.ts)[-self._limit :]

    def entries(self) -> list[LogEntry]:
        """Neueste zuerst."""
        return sorted(self._entries, key=lambda entry: entry.ts, reverse=True)

    def query(
        self,
        *,
        since: datetime | None = None,
        level: str | None = None,
        cat: str | None = None,
        q: str = "",
        limit: int = 500,
    ) -> list[LogEntry]:
        """Filter: Zeitpunkt, Stufe, Kategorie und Volltext; neueste zuerst."""
        result: list[LogEntry] = []
        for entry in self.entries():
            if since is not None and entry.ts < since:
                break
            if level and entry.level != level:
                continue
            if cat and entry.cat != cat:
                continue
            if q and not self._matches(entry, q):
                continue
            result.append(entry)
            if len(result) >= limit:
                break
        return result

    @staticmethod
    def _matches(entry: LogEntry, needle: str) -> bool:
        if _contains(entry.msg, needle) or _contains(entry.cat, needle):
            return True
        try:
            blob = json.dumps(entry.details, ensure_ascii=False, default=str)
        except (TypeError, ValueError):
            blob = str(entry.details)
        return _contains(blob, needle)


def update_signature(counts: dict[str, int], days_with_data: int, power_source: str | None) -> tuple:
    """Signatur eines Coordinator-Laufs für die Drosselung der update-Einträge."""
    return (tuple(sorted(counts.items())), int(days_with_data), power_source)


def should_log_update(previous: tuple | None, current: tuple, run_index: int, *, every: int = 12) -> bool:
    """Nur bei Änderung oder jeder ``every``-te Lauf.

    ``run_index`` beginnt bei 1. Der erste Lauf wird immer protokolliert.
    """
    if previous is None or previous != current:
        return True
    return run_index % every == 0


def finding_diff(previous: dict[str, str], current: dict[str, str]) -> list[tuple[str, str, str]]:
    """Vergleicht Signaturen je Hinweis: (id, alt, neu).

    Ein fehlender alter Wert bedeutet „neu“, ein fehlender neuer Wert
    „erledigt“.
    """
    changes: list[tuple[str, str, str]] = []
    for finding_id, new in current.items():
        old = previous.get(finding_id)
        if old != new:
            changes.append((finding_id, old or "", new))
    for finding_id, old in previous.items():
        if finding_id not in current:
            changes.append((finding_id, old, ""))
    return sorted(changes)


class FindingDebouncer:
    """Entprellt Hinweise fürs Protokoll.

    Ein Hinweis gilt als neu, wenn er auftaucht und nicht schon aktiv ist. Er gilt
    erst als erledigt, wenn er ``resolve_after`` lang durchgehend fehlt – so
    erzeugt ein Raum, der um die Schwelle pendelt, nicht alle fünf Minuten zwei
    Einträge. Geänderte Messwerte allein sind keine Meldung, nur ein Wechsel der
    Stufe (Hinweis ↔ Warnung).
    """

    def __init__(self, resolve_after: timedelta = timedelta(hours=2)) -> None:
        self.resolve_after = resolve_after
        self._active: dict[str, str] = {}
        self._missing_since: dict[str, datetime] = {}

    @property
    def active(self) -> dict[str, str]:
        return dict(self._active)

    def update(self, now: datetime, current: dict[str, str]) -> list[tuple[str, str, str, str]]:
        """``current``: Hinweis-ID → Stufe. Liefert (id, Art, alt, neu) mit Art new/severity/resolved."""
        events: list[tuple[str, str, str, str]] = []
        for finding_id, severity in sorted(current.items()):
            self._missing_since.pop(finding_id, None)
            old = self._active.get(finding_id)
            if old is None:
                events.append((finding_id, "new", "", severity))
            elif old != severity:
                events.append((finding_id, "severity", old, severity))
            self._active[finding_id] = severity
        for finding_id in sorted(set(self._active) - set(current)):
            since = self._missing_since.setdefault(finding_id, now)
            if now - since >= self.resolve_after:
                events.append((finding_id, "resolved", self._active.pop(finding_id), ""))
                self._missing_since.pop(finding_id, None)
        return events


def config_snapshot(data: dict[str, Any], options: dict[str, Any]) -> dict[str, Any]:
    """Vergleichsstand der Konfiguration (Daten, Optionen, Kreise, Räume)."""
    return {
        "data": {key: data.get(key) for key in sorted(data)},
        "options": {key: options.get(key) for key in sorted(options) if key not in ("circuits", "rooms", "thresholds")},
        "circuits": [dict(item) for item in options.get("circuits") or []],
        "rooms": [dict(item) for item in options.get("rooms") or []],
        "thresholds": dict(options.get("thresholds") or {}),
    }


def _label(item: dict[str, Any]) -> str:
    name = item.get("name") or item.get("id") or "?"
    return f"{name} ({item.get('id')})" if item.get("id") else str(name)


def config_diff(old: dict[str, Any], new: dict[str, Any]) -> list[dict[str, Any]]:
    """Änderungen der Konfiguration als fertige Protokolleinträge (deutsch)."""
    entries: list[dict[str, Any]] = []
    for section in ("data", "options", "thresholds"):
        before = old.get(section) or {}
        after = new.get(section) or {}
        for name in sorted(set(before) | set(after)):
            if before.get(name) == after.get(name):
                continue
            was = before.get(name)
            now = after.get(name)
            if section == "thresholds":
                key, msg = "config.thresholds", f"Schwelle {name}: {was} → {now}"
            elif name.endswith("_entity"):
                key, msg = "config.option", f"Quelle {name}: {was or '–'} → {now or '–'}"
            else:
                key, msg = "config.option", f"Option {name}: {was} → {now}"
            entries.append(
                {
                    "level": "info",
                    "cat": "config",
                    "key": key,
                    "msg": msg,
                    "params": {"field": name, "old": was, "new": now},
                    "details": {"field": name, "old": was, "new": now},
                }
            )

    for section, label, added_key, removed_key in (
        ("circuits", "Heizkreis", "config.circuit_added", "config.circuit_removed"),
        ("rooms", "Raum", "config.room_added", "config.room_removed"),
    ):
        before = {str(item.get("id")): item for item in old.get(section) or [] if item.get("id")}
        after = {str(item.get("id")): item for item in new.get(section) or [] if item.get("id")}
        for item_id in sorted(set(after) - set(before)):
            entries.append(
                {
                    "level": "info",
                    "cat": "config",
                    "key": added_key,
                    "msg": f"{label} hinzugefügt: {_label(after[item_id])}",
                    "params": {"id": item_id},
                    "details": dict(after[item_id]),
                }
            )
        for item_id in sorted(set(before) - set(after)):
            entries.append(
                {
                    "level": "info",
                    "cat": "config",
                    "key": removed_key,
                    "msg": f"{label} entfernt: {_label(before[item_id])}",
                    "params": {"id": item_id},
                    "details": dict(before[item_id]),
                }
            )
    return entries
