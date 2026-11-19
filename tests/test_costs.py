"""Kosten, Wasser und Warmwasserspeicher (ohne Home Assistant)."""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta

from hz.analysis.costs import clean_water_days, dhw_stats, heat_price_ct, weighted_cost

T0 = datetime(2026, 11, 19, 0, 0, tzinfo=UTC)


def test_kosten_stuendlich_mit_dynamischem_preis() -> None:
    usage = {T0: 1.0, T0 + timedelta(hours=1): 2.0, T0 + timedelta(hours=2): 1.0}
    prices = [(T0 - timedelta(minutes=5), 0.30), (T0 + timedelta(hours=1), 0.50)]
    result = weighted_cost(usage, prices)
    assert result.kwh == 4.0
    assert result.eur == round(1.0 * 0.30 + 2.0 * 0.50 + 1.0 * 0.50, 2)
    assert result.priced_hours == 3


def test_kosten_ohne_preis_nutzen_festen_preis() -> None:
    assert weighted_cost({T0: 2.0}, [], fallback_price=0.4).eur == 0.8
    assert weighted_cost({T0: 2.0}, []).eur is None
    # Zählertausch (negativ) zählt nicht
    assert weighted_cost({T0: -50.0, T0 + timedelta(hours=1): 1.0}, [], fallback_price=0.4).kwh == 1.0


def test_waermepreis() -> None:
    assert heat_price_ct(20.0, 200.0) == 10.0
    assert heat_price_ct(None, 200.0) is None


def test_wasser_lesefehler_raus() -> None:
    days = {date(2026, 11, 17): 0.44, date(2026, 11, 18): -0.02, date(2026, 11, 19): 1_100_000.0}
    assert clean_water_days(days) == {date(2026, 11, 17): 0.44}


def test_speicher_ladungen_und_abkuehlung() -> None:
    charges = [(T0 + timedelta(hours=13), T0 + timedelta(hours=13, minutes=40))]
    temps = {T0 + timedelta(hours=h): 50.0 - 0.4 * h for h in range(6)}
    stats = dhw_stats(charges, temps, {}, window_start=T0, now=T0 + timedelta(days=1))
    assert stats.charges_per_day == 1.0
    assert stats.charge_minutes == 40
    assert stats.cooling_k_per_h == 0.4
