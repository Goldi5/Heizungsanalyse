"""Ereignisprotokoll ohne Home Assistant: Grenzen, Filter, Drosselung."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from hz.analysis.event_log import (
    RESTART_KEY,
    RESTART_MESSAGE,
    EventLogBuffer,
    FindingDebouncer,
    LogEntry,
    finding_diff,
    restart_entry,
    should_log_update,
    update_signature,
)

NOW = datetime(2026, 11, 17, 12, 0, 0)


def _entry(minutes_ago: int, *, level: str = "info", cat: str = "update", msg: str = "x", details=None) -> LogEntry:
    return LogEntry(
        ts=NOW - timedelta(minutes=minutes_ago),
        level=level,
        cat=cat,
        msg=msg,
        details=details or {},
    )


def test_reihenfolge_neueste_zuerst() -> None:
    buf = EventLogBuffer()
    buf.add(_entry(30, msg="alt"))
    buf.add(_entry(10, msg="neu"))
    assert [entry.msg for entry in buf.entries()] == ["neu", "alt"]


def test_mengenbegrenzung() -> None:
    buf = EventLogBuffer(limit=5)
    for index in range(9):
        buf.add(_entry(9 - index, msg=f"e{index}"))
    assert len(buf) == 5
    assert [entry.msg for entry in buf.entries()] == ["e8", "e7", "e6", "e5", "e4"]


def test_zeitbegrenzung() -> None:
    buf = EventLogBuffer(retention_days=30)
    buf.add(_entry(0, msg="heute"))
    buf.add(_entry(31 * 24 * 60, msg="vor 31 Tagen"))
    assert [entry.msg for entry in buf.entries()] == ["heute"]


def test_neustart_marker() -> None:
    entry = restart_entry(NOW)
    assert entry.cat == "start"
    assert entry.msg == RESTART_MESSAGE
    assert entry.key == RESTART_KEY
    assert entry.level == "info"


def test_filter_stufe_kategorie_zeit() -> None:
    buf = EventLogBuffer()
    buf.add(_entry(5, level="warn", cat="source", msg="Quelle fehlt"))
    buf.add(_entry(10, level="info", cat="update", msg="Lauf ok"))
    buf.add(_entry(20, level="error", cat="error", msg="UpdateFailed"))

    assert [e.msg for e in buf.query(level="warn")] == ["Quelle fehlt"]
    assert [e.msg for e in buf.query(cat="error")] == ["UpdateFailed"]
    since = NOW - timedelta(minutes=12)
    assert [e.msg for e in buf.query(since=since)] == ["Quelle fehlt", "Lauf ok"]


def test_voltext_und_details() -> None:
    buf = EventLogBuffer()
    buf.add(_entry(1, msg="Quelle unavailable", details={"entity": "sensor.wp_strom", "unit": "kWh"}))
    assert [e.msg for e in buf.query(q="unavailable")] == ["Quelle unavailable"]
    assert [e.msg for e in buf.query(q="sensor.wp_strom")] == ["Quelle unavailable"]
    assert [e.msg for e in buf.query(q="kWh")] == ["Quelle unavailable"]
    assert buf.query(q="gibt es nicht") == []


def test_update_drosselung() -> None:
    sig_a = update_signature({"sensor.wp_strom": 31}, 28, "primary")
    sig_b = update_signature({"sensor.wp_strom": 30}, 27, "primary")

    assert should_log_update(None, sig_a, run_index=1) is True
    assert should_log_update(sig_a, sig_b, run_index=2) is True
    assert should_log_update(sig_b, sig_b, run_index=11) is False
    assert should_log_update(sig_b, sig_b, run_index=12) is True


def test_update_drosselung_ignoriert_zufaellige_aenderung_nicht() -> None:
    sig_a = update_signature({"sensor.wp_strom": 31}, 28, "primary")
    sig_b = update_signature({"sensor.wp_strom": 31}, 28, "fallback")
    assert should_log_update(sig_a, sig_b, run_index=5) is True


def test_finding_diff_neu_geaendert_erledigt() -> None:
    previous = {"F01": "a", "F02": "b", "F03": "c"}
    current = {"F01": "a", "F02": "b2", "F04": "d"}
    changes = finding_diff(previous, current)
    assert ("F02", "b", "b2") in changes
    assert ("F03", "c", "") in changes
    assert ("F04", "", "d") in changes
    assert ("F01", "", "") not in changes


def test_runden_und_speichern_und_wiederherstellen() -> None:
    buf = EventLogBuffer()
    entry = _entry(1, msg="ä ö ü", details={"text": "Größe"})
    buf.add(entry)
    again = EventLogBuffer()
    again.add(LogEntry.from_dict(entry.as_dict()))
    assert again.entries()[0] == entry
    assert again.entries()[0].msg == "ä ö ü"


def test_config_diff_quelle_option_kreis_raum() -> None:
    from hz.analysis.event_log import config_diff, config_snapshot

    old = config_snapshot(
        {"sensor.wp_strom": "sensor.alt", "sensor.heat": "sensor.waerme"},
        {"thresholds": {"starts_per_day": 12}, "circuits": [{"id": "hk1", "name": "HK 1"}], "rooms": []},
    )
    new = config_snapshot(
        {"sensor.wp_strom": "sensor.neu", "sensor.heat": "sensor.waerme"},
        {
            "thresholds": {"starts_per_day": 10},
            "circuits": [{"id": "hk1", "name": "HK 1"}, {"id": "hk2", "name": "HK 2"}],
            "rooms": [{"id": "bad", "name": "Bad", "climate_entity": "climate.bad"}],
        },
    )
    entries = config_diff(old, new)
    keys = [entry["key"] for entry in entries]

    assert "config.option" in keys
    assert "config.thresholds" in keys
    assert "config.circuit_added" in keys
    assert "config.room_added" in keys
    source = next(entry for entry in entries if entry["key"] == "config.option")
    assert source["params"] == {"field": "sensor.wp_strom", "old": "sensor.alt", "new": "sensor.neu"}
    assert "HK 2" in next(entry["msg"] for entry in entries if entry["key"] == "config.circuit_added")
    assert not any(entry["key"].endswith("_removed") for entry in entries)


def test_config_diff_erkennt_entfernen() -> None:
    from hz.analysis.event_log import config_diff, config_snapshot

    old = config_snapshot({}, {"circuits": [{"id": "hk2", "name": "HK 2"}], "rooms": [{"id": "bad", "name": "Bad"}]})
    new = config_snapshot({}, {"circuits": [], "rooms": []})
    keys = {entry["key"] for entry in config_diff(old, new)}
    assert keys == {"config.circuit_removed", "config.room_removed"}


def test_debouncer_meldet_pendeln_nur_einmal() -> None:
    deb = FindingDebouncer(resolve_after=timedelta(hours=2))
    t = datetime(2026, 11, 19, 8, 0, tzinfo=UTC)
    assert deb.update(t, {"F05:bad": "info"}) == [("F05:bad", "new", "", "info")]
    # Raum pendelt um die Schwelle: 5 Minuten weg, wieder da – keine neuen Einträge
    for step in range(1, 12):
        now = t + timedelta(minutes=5 * step)
        current = {} if step % 2 else {"F05:bad": "info"}
        assert deb.update(now, current) == []
    # Stufenwechsel wird gemeldet
    assert deb.update(t + timedelta(hours=1), {"F05:bad": "warning"}) == [("F05:bad", "severity", "info", "warning")]
    # Erst nach zwei Stunden durchgehend weg gilt er als erledigt
    gone = t + timedelta(hours=1, minutes=5)
    assert deb.update(gone, {}) == []
    assert deb.update(gone + timedelta(hours=1), {}) == []
    assert deb.update(gone + timedelta(hours=2), {}) == [("F05:bad", "resolved", "warning", "")]
