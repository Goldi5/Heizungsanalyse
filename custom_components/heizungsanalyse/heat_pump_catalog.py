"""Herstellerdaten für Wärmepumpen und Speicher.

Die Werte stammen aus den verlinkten technischen Datenblättern der Hersteller
(Prüfstand nach EN 14511, Jahreswert nach EN 14825). Sie sind die Messlatte,
an der die Analyse die echte Anlage misst: Prüfstandswerte enthalten weder
Abtauung noch Umwälzpumpen und Leitungsverluste, im Betrieb sind 80–95 % davon
ein gutes Ergebnis.

Reine Daten ohne Home Assistant, damit die Tests ohne HA laufen.
"""

from __future__ import annotations

from typing import Any

CATALOG_VERSION = "2026-11-20"

_STIEBEL_WPL_A_SOURCE = "https://www.solarwatt.de/canto/download/gfmt12ilih2pd7ct7kh5iav11p"
_STIEBEL_WPM_SOURCE = "https://stcoreassetsprdweu.blob.core.windows.net/public/PROD/STE/42000/DM0000041218-gxg.pdf"

#: Betriebspunkte (Außenluft °C, Vorlauf °C, Heizleistung kW, Leistungsaufnahme kW, COP) nach EN 14511
_WPL_A_07_POINTS = [
    (10, 35, 3.23, 0.58, 5.54),
    (7, 35, 3.31, 0.61, 5.42),
    (7, 45, 3.01, 0.72, 4.20),
    (7, 55, 2.70, 0.82, 3.29),
    (2, 35, 4.30, 1.00, 4.30),
    (2, 45, 4.30, 1.24, 3.48),
    (2, 55, 4.30, 1.47, 2.93),
    (-7, 35, 6.87, 2.36, 2.93),
    (-7, 45, 6.94, 2.67, 2.60),
    (-7, 55, 7.01, 2.97, 2.36),
    (-7, 65, 7.07, 3.41, 2.09),
    (-7, 75, 7.00, 3.82, 1.83),
    (-15, 35, 6.40, 2.40, 2.67),
]
_WPL_A_05_POINTS = [
    (10, 35, 3.23, 0.58, 5.54),
    (7, 35, 3.31, 0.61, 5.42),
    (7, 45, 2.39, 0.62, 3.89),
    (7, 55, 2.70, 0.82, 3.29),
    (2, 35, 3.19, 0.69, 4.60),
    (2, 45, 3.09, 0.87, 3.55),
    (2, 55, 2.98, 1.05, 2.85),
    (-7, 35, 4.97, 1.44, 3.45),
    (-7, 45, 4.96, 1.71, 2.91),
    (-7, 55, 4.94, 1.97, 2.51),
    (-7, 65, 4.71, 2.25, 2.09),
    (-7, 75, 4.41, 2.48, 1.78),
    (-15, 35, 4.18, 1.44, 2.90),
]

#: Modulationsbereich bei W35: (Außenluft °C, kleinste kW, größte kW)
_WPL_A_07_RANGE = [(-7, 2.05, 6.87), (2, 2.10, 9.70), (7, 2.65, 10.75)]
_WPL_A_05_RANGE = [(-7, 2.05, 4.97), (2, 2.10, 6.55), (7, 2.65, 7.40)]

_WPL_A_LIMITS = {
    "outdoor_min_c": -25.0,
    "outdoor_max_c": 40.0,
    "flow_min_c": 15.0,
    "flow_max_c": 75.0,
    "outdoor_min_w65_c": -17.0,
}


def _wpl_a(size: str, product_no: str, points, output_range, scop: float, min_flow_m3h: float, nominal_flow_m3h: float) -> dict[str, Any]:
    return {
        "id": f"stiebel-wpl-a-{size}-hk-230-premium",
        "manufacturer": "Stiebel Eltron",
        "model": f"WPL-A {size} HK 230 Premium",
        "product_no": product_no,
        "kind": "air_water",
        "controller": "stiebel_wpm",
        "refrigerant": "R454C",
        "refrigerant_kg": 3.0,
        "scop": scop,
        "defrost": "Kreislaufumkehr",
        "aux_heater_kw": 6.2,
        "points": [
            {"outdoor": o, "flow": f, "heat_kw": h, "power_kw": p, "cop": c} for o, f, h, p, c in points
        ],
        "range": [{"outdoor": o, "min_kw": lo, "max_kw": hi} for o, lo, hi in output_range],
        "limits": dict(_WPL_A_LIMITS),
        "min_flow_lpm": round(min_flow_m3h * 1000 / 60, 1),
        "nominal_flow_lpm": round(nominal_flow_m3h * 1000 / 60, 1),
        "source": _STIEBEL_WPL_A_SOURCE,
        "manual": _STIEBEL_WPM_SOURCE,
    }


HEAT_PUMPS: dict[str, dict[str, Any]] = {
    entry["id"]: entry
    for entry in (
        _wpl_a("07", "200123", _WPL_A_07_POINTS, _WPL_A_07_RANGE, 4.88, 0.64, 0.842),
        _wpl_a("05", "202669", _WPL_A_05_POINTS, _WPL_A_05_RANGE, 4.70, 0.64, 0.64),
    )
}

#: Speicher: Nenninhalt und Bereitschaftsverlust (kWh je 24 h bei 65 °C, 20 °C Umgebung)
STORAGES: dict[str, dict[str, Any]] = {
    "stiebel-sbb-300-1-plus": {
        "id": "stiebel-sbb-300-1-plus",
        "manufacturer": "Stiebel Eltron",
        "model": "SBB 300-1 Plus",
        "kind": "dhw",
        "volume_l": 314,
        "standby_kwh_24h": 1.70,
        "source": "https://stiebel-eltron.de/de/home/produkte-loesungen/erneuerbare_energien/systemspeicher/trinkwarmwasserspeicher/sbb-200-500-1-plus/sbb-200-1-plus/technische-daten.product.pdf",
    },
    "stiebel-sbp-400-e": {
        "id": "stiebel-sbp-400-e",
        "manufacturer": "Stiebel Eltron",
        "model": "SBP 400 E",
        "kind": "buffer",
        "volume_l": 415,
        "standby_kwh_24h": 1.60,
        "source": "https://www.heizungsdiscount24.de/pdf/Stiebel-Eltron-Pufferspeicher-SBP-400-E-Technisches-Datenblatt.pdf",
    },
}

#: Wasser: 1,163 Wh je Liter und Kelvin
WATER_KWH_PER_L_K = 0.001163


def heat_pump(model_id: str | None) -> dict[str, Any] | None:
    return HEAT_PUMPS.get(model_id or "")


def storage(model_id: str | None) -> dict[str, Any] | None:
    return STORAGES.get(model_id or "")


def choices(kind: str) -> list[dict[str, str]]:
    """Auswahl für das Optionsformular."""
    if kind == "heat_pump":
        items = HEAT_PUMPS.values()
    else:
        items = [s for s in STORAGES.values() if s["kind"] == kind]
    return [{"value": item["id"], "label": f"{item['manufacturer']} {item['model']}"} for item in items]
