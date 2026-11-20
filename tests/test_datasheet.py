"""Herstellerdaten: Referenz-COP, Leistungsbereich, Stiebel-Heizkurve, Speicher."""

from __future__ import annotations

import pytest

from hz.analysis.datasheet import curve_points, output_range, reference_cop, standby_cooling, stiebel_curve
from hz.heat_pump_catalog import HEAT_PUMPS, STORAGES, choices, heat_pump

WPL07 = HEAT_PUMPS["stiebel-wpl-a-07-hk-230-premium"]


def test_datenblattpunkte_werden_getroffen() -> None:
    assert reference_cop(WPL07["points"], 7, 35) == 5.42
    assert reference_cop(WPL07["points"], 2, 35) == 4.30
    assert reference_cop(WPL07["points"], -7, 55) == 2.36


def test_zwischen_den_punkten_wird_interpoliert() -> None:
    # A4,5/W35 liegt zwischen 4,30 (A2) und 5,42 (A7)
    assert reference_cop(WPL07["points"], 4.5, 35) == pytest.approx(4.86, abs=0.01)
    # A7/W40 liegt zwischen W35 (5,42) und W45 (4,20)
    assert reference_cop(WPL07["points"], 7, 40) == pytest.approx(4.81, abs=0.01)


def test_ausserhalb_wird_der_rand_gehalten() -> None:
    assert reference_cop(WPL07["points"], 20, 35) == 5.54
    assert reference_cop(WPL07["points"], 7, 25) == 5.42
    assert reference_cop(WPL07["points"], None, 35) is None


def test_leistungsbereich() -> None:
    low, high = output_range(WPL07["range"], 7)
    assert (low, high) == (2.65, 10.75)
    low, _high = output_range(WPL07["range"], -20)
    assert low == 2.05


def test_stiebel_heizkurve_trifft_den_regler() -> None:
    # Werte eines echten WPM: HK2 Steilheit 0,7 / Raum 23 °C, HK1 0,2 / 22,5 °C bei gedämpft ~6,9 °C
    assert stiebel_curve(0.7, 23.0, 6.9) == pytest.approx(34.3, abs=0.1)
    assert stiebel_curve(0.2, 22.5, 6.9) == pytest.approx(25.6, abs=0.1)
    # Über dem Raum-Soll bleibt die Kurve am Fußpunkt
    assert stiebel_curve(0.7, 20.0, 25.0) == 20.0
    assert curve_points(0.4, 20.0, start=-10, stop=0, step=10) == [{"x": -10.0, "y": 32.0}, {"x": 0.0, "y": 28.0}]


def test_speicher_abkuehlung_aus_bereitschaftsverlust() -> None:
    tank = STORAGES["stiebel-sbb-300-1-plus"]
    # 1,70 kWh/24 h bei 65 °C → bei 50 °C rund 0,13 K/h
    assert standby_cooling(tank, 50.0) == pytest.approx(0.13, abs=0.01)
    assert standby_cooling(tank, 15.0) is None
    assert standby_cooling(None, 50.0) is None


def test_katalog() -> None:
    assert heat_pump("unbekannt") is None
    assert {c["value"] for c in choices("heat_pump")} == set(HEAT_PUMPS)
    assert [c["value"] for c in choices("buffer")] == ["stiebel-sbp-400-e"]
    assert WPL07["min_flow_lpm"] == pytest.approx(10.7, abs=0.1)


def test_abkuehlung_mit_und_ohne_zirkulation() -> None:
    from datetime import UTC, datetime, timedelta

    from hz.analysis.costs import cooling_split

    t0 = datetime(2026, 11, 19, 20, 0, tzinfo=UTC)
    hours = [t0 + timedelta(hours=i) for i in range(8)]
    # 20–23 Uhr ohne Zirkulation (−0,1 K/h), 23–02 Uhr mit Zirkulation (−1,3 K/h)
    temps = dict(zip(hours, [50.0, 49.9, 49.8, 49.7, 48.4, 47.1, 45.8, 45.7], strict=True))
    circ = {h: (1.0 if 4 <= i <= 6 else 0.0) for i, h in enumerate(hours)}
    with_circ, idle = cooling_split(temps, {}, circ)
    assert with_circ == 1.3
    assert idle == 0.1
