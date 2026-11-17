"""Dashboard-Zusammenfassung (ohne Home Assistant)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta

from hz.analysis.cop import CopBin, CopResult
from hz.analysis.findings import Finding, Thresholds
from hz.analysis.heating_curve import CurveBin, DeviationResult
from hz.analysis.rooms import RoomDeviation
from hz.analysis.types import DaySample
from hz.summary import build_summary, change_rows, daily_series, finding_rows, score

START = date(2026, 11, 1)


def _samples(days: int = 14) -> list[DaySample]:
    return [
        DaySample(
            day=START + timedelta(days=i),
            heat_kwh=40.0 + i,
            power_kwh=10.0,
            outdoor_c=5.0 - i * 0.2,
            starts=10.0,
            runtime_h=8.0,
            flow_c=33.0,
            target_flow_c=31.0,
        )
        for i in range(days)
    ]


@dataclass
class Snap:
    samples: list[DaySample] = field(default_factory=_samples)
    cop_short: CopResult = CopResult(4.5, 315.0, 70.0, 7, "primary")
    cop_long: CopResult = CopResult(4.3, 600.0, 140.0, 14, "primary")
    starts_per_day: float | None = 10.0
    runtime_per_cycle: float | None = 48.0
    deviation: DeviationResult = DeviationResult(1.8, 3.1, 162)
    compressor_filtered: bool = True
    cop_trend: list = field(default_factory=lambda: [CopBin(2.0, 4.0, 4.6, 5)])
    curve: list = field(default_factory=lambda: [CurveBin(2.0, 4.0, 31.0, 5)])
    power_source: str | None = "primary"
    days_with_data: int = 14
    rooms: dict = field(default_factory=lambda: {"bad": RoomDeviation(-0.9, -1.6, 0.4, 0.0, 300)})
    heating_up: dict = field(default_factory=lambda: {"bad": 74.0})
    circuits: dict = field(default_factory=dict)
    mixer: dict = field(default_factory=dict)
    rankings: dict = field(default_factory=dict)
    findings: list = field(
        default_factory=lambda: [
            Finding("F09", "info", "defrost", {"hours": 2.4, "threshold": 2.0}),
            Finding("F01", "warning", "flow_deviation", {"median": 1.8, "threshold": 1.5}, {"median_k": 1.8}),
        ]
    )
    thresholds: Thresholds = Thresholds()


def test_score_levels() -> None:
    warn = Finding("F01", "warning", "flow_deviation")
    info = Finding("F09", "info", "defrost")
    assert score([], 10) | {} == {
        "value": 100,
        "level": "very_good",
        "warnings": 0,
        "infos": 0,
        "checks": [],
        "active": 0,
        "total": 0,
    }
    assert score([warn, info], 10)["value"] == 80
    assert score([warn, info], 10)["level"] == "good"
    assert score([warn] * 4, 10)["level"] == "action"
    assert score([warn], 1)["value"] is None


def test_series_computes_cop_and_cycle() -> None:
    rows = daily_series(_samples(3))
    assert rows[0]["day"] == "2026-11-01"
    assert rows[0]["cop"] == 4.0
    assert rows[0]["cycle_min"] == 48.0


def test_findings_sorted_with_text() -> None:
    rows = finding_rows(Snap().findings, "de")
    assert [r["id"] for r in rows] == ["F01", "F09"]
    assert rows[0]["title"] == "Vorlauf liegt über Soll"
    assert "1,8" in rows[0]["text"]
    assert "1.8" in finding_rows(Snap().findings, "en")[0]["text"]
    assert finding_rows(Snap().findings, "en-GB")[0]["title"].startswith("Flow")


def test_change_compares_before_and_after() -> None:
    changes = [{"ts": "2026-11-08T09:00:00+00:00", "object": "hydraulics", "field": "heating_curve", "old": 0.6, "new": 0.5}]
    rows = change_rows(changes, _samples(), to_local_day=lambda v: date.fromisoformat(v[:10]))
    assert rows[0]["day"] == "2026-11-08"
    assert rows[0]["before"]["days"] == 7 and rows[0]["after"]["days"] == 7
    assert rows[0]["after"]["cop"] > rows[0]["before"]["cop"]
    assert rows[0]["before"]["outdoor"] is not None


def test_build_summary_shape() -> None:
    out = build_summary(
        Snap(),
        version="0.2.0",
        title="Anlage",
        language="de",
        rooms=[{"id": "bad", "name": "Bad", "circuit": "hk1", "climate_entity": None}],
        circuits=[{"id": "hk1", "name": "Heizkoerper", "type": "radiators"}],
        sources={"flow_entity": "x", "target_flow_entity": "y", "defrost_entity": None},
        history=_samples(),
        changes=[],
        inventory={"pumps": {}},
        to_local_day=lambda v: None,
    )
    assert out["score"]["value"] == 80
    assert out["kpis"]["cop_short"]["value"] == 4.5
    assert out["kpis"]["flow_deviation"]["median"] == 1.8
    assert out["rooms"][0]["circuit_name"] == "Heizkoerper"
    assert out["rooms"][0]["heating_up_min"] == 74.0
    assert out["circuits"][0]["rooms"] == ["Bad"]
    assert "defrost" in out["missing"] and "heating_curve" not in out["missing"]
    assert len(out["series"]) == 14


def test_score_limited_without_key_checks() -> None:
    """Ohne Vorlauf-Prüfung keine gute Note, sondern „eingeschränkt“."""
    checks = [{"key": "cop", "active": True}, {"key": "flow", "active": False, "reason": "no_data"}]
    out = score([], 10, checks)
    assert out["level"] == "limited"
    assert out["active"] == 1 and out["total"] == 2
    full = [{"key": k, "active": True} for k in ("cop", "flow", "starts")]
    assert score([], 10, full)["level"] == "very_good"
    # schlechte Noten bleiben schlecht
    warn = Finding("F01", "warning", "flow_deviation")
    assert score([warn] * 4, 10, checks)["level"] == "action"


def test_build_summary_lists_inactive_checks() -> None:
    out = build_summary(
        Snap(),
        version="0.3.3",
        title="Anlage",
        language="de",
        rooms=[{"id": "bad", "name": "Bad", "circuit": "hk1"}],
        circuits=[{"id": "hk1", "name": "HK", "type": "radiators"}],
        sources={"flow_entity": "x", "target_flow_entity": "y"},
        history=_samples(),
        changes=[],
        inventory={},
        to_local_day=lambda v: None,
    )
    by_key = {c["key"]: c for c in out["score"]["checks"]}
    assert by_key["flow"]["active"] is True
    assert by_key["defrost"]["reason"] == "no_source"
    assert by_key["rooms"]["active"] is True  # Snap hat 300 Stichproben
