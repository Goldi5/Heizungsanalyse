"""Findings-Engine (ohne Home Assistant)."""

from __future__ import annotations

from datetime import date

from hz.analysis.circuits import CircuitStats, MixerStats
from hz.analysis.cop import CopBin
from hz.analysis.findings import Finding, FindingsInput, Thresholds, evaluate, signature
from hz.analysis.rooms import RoomDeviation
from hz.analysis.types import DaySample


def _ids(findings: list[Finding]) -> list[str]:
    return [finding.id for finding in findings]


def _base(**overrides) -> FindingsInput:
    values = {
        "cop": 3.8,
        "cop_days": 14,
        "cop_trend": [CopBin(lower=4.0, upper=6.0, cop=3.8, days=10)],
        "outdoor_mean": 5.0,
        "deviation_median": 1.0,
        "deviation_p90": 2.0,
        "deviation_hours": 100,
        "starts_per_day": 10.0,
        "runtime_per_cycle": 35.0,
        "room_stats": {},
        "circuit_stats": {},
        "mixer_stats": {},
        "samples": [],
        "power_source": "primary",
    }
    values.update(overrides)
    return FindingsInput(**values)


def test_quiet_baseline_has_no_findings() -> None:
    assert evaluate(_base()) == []


def test_f01_flow_deviation() -> None:
    findings = evaluate(_base(deviation_median=6.2, deviation_p90=7.0))

    assert _ids(findings) == ["F01"]
    assert findings[0].severity == "warning"
    assert findings[0].params["median"] == 6.2


def test_f01_respects_threshold_override() -> None:
    findings = evaluate(_base(deviation_median=4.0), Thresholds(flow_deviation_k=3.0))

    assert _ids(findings) == ["F01"]


def test_f02_starts_and_short_cycles() -> None:
    assert _ids(evaluate(_base(starts_per_day=25.0))) == ["F02"]
    assert _ids(evaluate(_base(runtime_per_cycle=12.0))) == ["F02"]
    assert evaluate(_base(starts_per_day=25.0, outdoor_mean=-2.0)) == []


def test_f03_pump_idle() -> None:
    stats = {"hk2": CircuitStats(pump_minutes=100.0, idle_minutes=60.0, idle_share=0.6, samples=20)}

    findings = evaluate(_base(circuit_stats=stats, circuit_names={"hk2": "Oben"}))

    assert _ids(findings) == ["F03"]
    assert findings[0].params["circuit"] == "Oben"


def test_f04_and_f05_room_deviation() -> None:
    stats = {
        "kalt": RoomDeviation(median=-1.6, p90=0.0, under_share=0.8, over_share=0.0, samples=200),
        "warm": RoomDeviation(median=1.7, p90=2.0, under_share=0.0, over_share=0.7, samples=200),
        "ok": RoomDeviation(median=0.2, p90=0.5, under_share=0.1, over_share=0.0, samples=200),
    }

    findings = evaluate(_base(room_stats=stats, room_names={"kalt": "Bad", "warm": "Flur"}))

    assert _ids(findings) == ["F04", "F05"]
    assert {finding.params["room"] for finding in findings} == {"Bad", "Flur"}


def test_f06_aux_heater() -> None:
    samples = [DaySample(day=date(2026, 11, 10), aux_hours=3.0), DaySample(day=date(2026, 11, 11), aux_hours=1.0)]

    assert _ids(evaluate(_base(samples=samples))) == ["F06"]


def test_f07_duplicate_sensors() -> None:
    findings = evaluate(_base(duplicate_pairs=[("sensor.a", "sensor.b")]))

    assert _ids(findings) == ["F07"]
    assert findings[0].params["count"] == 1


def test_f08_unavailable_source() -> None:
    findings = evaluate(_base(unavailable_hours={"sensor.wp_strom": 3.5}))

    assert _ids(findings) == ["F08"]
    assert findings[0].params["hours"] == 3.5


def test_f09_defrost_only_at_mild_temperatures() -> None:
    samples = [DaySample(day=date(2026, 11, 10), defrost_hours=4.0)]

    assert _ids(evaluate(_base(samples=samples, outdoor_mean=4.0))) == ["F09"]
    assert evaluate(_base(samples=samples, outdoor_mean=15.0)) == []


def test_f10_cop_curve_deviation() -> None:
    findings = evaluate(_base(cop=3.0, cop_days=10, outdoor_mean=5.0, cop_trend=[CopBin(4.0, 6.0, 3.9, 8)]))

    assert _ids(findings) == ["F10"]
    assert findings[0].params["expected"] == 3.9


def test_f10_needs_enough_data() -> None:
    assert evaluate(_base(cop=3.0, cop_days=3, outdoor_mean=5.0, cop_trend=[CopBin(4.0, 6.0, 3.9, 8)])) == []


def test_f11_mixer_unrest() -> None:
    stats = {"hk3": MixerStats(pulses=60, pulses_per_day=20.0, days=3)}

    assert _ids(evaluate(_base(mixer_stats=stats))) == ["F11"]


def test_f12_missing_statistics() -> None:
    findings = evaluate(_base(missing_statistics=["sensor.wp_waerme"]))

    assert _ids(findings) == ["F12"]


def test_f13_fallback_active() -> None:
    findings = evaluate(_base(power_source="fallback"))

    assert _ids(findings) == ["F13"]
    assert findings[0].key == "power_source_fallback"


def test_f13_source_deviation() -> None:
    findings = evaluate(_base(primary_energy=300.0, fallback_energy=200.0))

    assert _ids(findings) == ["F13"]
    assert findings[0].key == "power_source_deviation"


def test_warnings_sort_first() -> None:
    findings = evaluate(_base(deviation_median=7.0, missing_statistics=["sensor.x"], duplicate_pairs=[("a", "b")]))

    assert [finding.severity for finding in findings] == ["warning", "info", "info"]


def test_signature_changes_with_evidence() -> None:
    first = evaluate(_base(deviation_median=6.0))
    second = evaluate(_base(deviation_median=7.0))

    assert signature(first) != signature(second)
    assert signature(first) == signature(evaluate(_base(deviation_median=6.0)))


def test_room_needs_twelve_hours_of_samples() -> None:
    """Eine einzelne Messung reicht nicht für eine Raumwarnung."""
    stats = {"kalt": RoomDeviation(median=-1.6, p90=0.0, under_share=1.0, over_share=0.0, samples=1)}
    assert _ids(evaluate(_base(room_stats=stats))) == []
