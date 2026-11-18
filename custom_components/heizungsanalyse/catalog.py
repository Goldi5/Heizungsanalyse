"""Herstellerkatalog für Pumpen und Thermostatventile.

Die Werte stammen aus den verlinkten Herstellerdatenblättern und sind
Maximal- beziehungsweise Voreinstellwerte, keine Auslegung für eine konkrete
Anlage. Der Katalog füllt das Formular vor; der Nutzer bestätigt die Werte.
Unbekannte Geräte bleiben Freitext.
"""

from __future__ import annotations

from typing import Any

CATALOG_VERSION = "2026-11-18"

_NOTE = {
    "de": "Werte aus Herstellerdatenblättern (Maximalwerte). Die Auslegung hängt von der Anlage ab; bitte am Typenschild prüfen.",
    "en": "Values from manufacturer datasheets (maximum values). Sizing depends on the system; please check the nameplate.",
}

_ALPHA23_SOURCE = "https://api.grundfos.com/literature/Grundfosliterature-6154247.pdf"
_MAGNA3_SOURCE = (
    "https://www.gogrundfos.com/hubfs/GRUNDFOS%20PRODUCT%20GUIDES/Magna3%20Product%20Guide.pdf?hsLang=en"
)
_WILO_PICO_SOURCE = "https://wilo.com/gb/en/Products/en/products/yonos-pico_id199"
_RA_N_SOURCE = "https://assets.danfoss.com/documents/latest/560607/AI003086404253en-010202.pdf"
_AV_SOURCE = "https://download.sankom.net/dk/documentation/oventrop/dane%20techniczne/01%20armatura%20grzejnikowa/db_1183763_de.pdf"

#: Förderstrom, Förderhöhe und P1 je Baureihe (Grundfos ALPHA2/ALPHA3, Datenblatt 6154247).
_ALPHA23_MODELS = [
    ("15-40", 2.4, 4.0, 18),
    ("15-50", 2.8, 5.0, 26),
    ("15-60", 3.0, 6.0, 34),
    ("25-40", 2.4, 4.0, 18),
    ("25-50", 2.8, 5.0, 26),
    ("25-60", 3.0, 6.0, 34),
    ("32-40", 2.4, 4.0, 18),
    ("32-50", 2.8, 5.0, 26),
    ("32-60", 3.0, 6.0, 34),
]

#: MAGNA3: max. Förderstrom aus der Kurvenachse (US gpm umgerechnet), P1 max.
_MAGNA3_MODELS = [
    ("32-60", 9.1, 6.0, 106),
    ("40-80", 20.4, 8.0, 274),
]

_RA_N_MODELS = [
    ("10", [0.04, 0.08, 0.12, 0.19, 0.25, 0.33, 0.38], 0.56, 0.65),
    ("15", [0.04, 0.09, 0.16, 0.25, 0.36, 0.43, 0.52], 0.73, 0.90),
    ("20", [0.10, 0.15, 0.17, 0.26, 0.35, 0.46, 0.73], 1.04, 1.40),
    ("25", [0.10, 0.15, 0.17, 0.26, 0.35, 0.46, 0.73], 1.04, 1.40),
]


def _pump(
    manufacturer: str,
    series: str,
    model: str,
    power_w: int,
    flow_m3h: float,
    max_head_m: float,
    control_mode: str,
    setting: str,
    source: str,
    note_de: str,
    note_en: str,
) -> dict[str, Any]:
    return {
        "id": f"{manufacturer.lower()}-{model.lower().replace(' ', '-').replace('/', '-')}",
        "manufacturer": manufacturer,
        "series": series,
        "model": model,
        "fields": {
            "manufacturer": manufacturer,
            "model": model,
            "control_mode": control_mode,
            "setting": setting,
            "power_w": power_w,
            "flow_m3h": flow_m3h,
            "max_head_m": max_head_m,
        },
        "source": source,
        "note": {"de": note_de, "en": note_en},
    }


def _alpha23(manufacturer: str, series: str) -> list[dict[str, Any]]:
    entries = []
    for model, flow, head, power in _ALPHA23_MODELS:
        entries.append(
            _pump(
                manufacturer,
                series,
                f"{series} {model}",
                power,
                flow,
                head,
                "dp",
                "AUTOADAPT; PP/CP; Stufen I–III",
                _ALPHA23_SOURCE,
                f"P1 max. {power} W, max. Förderstrom {flow:.1f} m³/h, max. Förderhöhe {head:.1f} m (Datenblatt {series}).",
                f"P1 max. {power} W, max. flow {flow:.1f} m³/h, max. head {head:.1f} m ({series} datasheet).",
            )
        )
    return entries


def _magna3() -> list[dict[str, Any]]:
    entries = []
    for model, flow, head, power in _MAGNA3_MODELS:
        entries.append(
            _pump(
                "Grundfos",
                "MAGNA3",
                f"MAGNA3 {model}",
                power,
                flow,
                head,
                "dp",
                "AUTOADAPT; PP/CP; 0–10 V",
                _MAGNA3_SOURCE,
                f"P1 max. {power} W, max. Förderhöhe {head:.1f} m, max. Förderstrom {flow:.1f} m³/h (Kurvenachse, Datenblatt MAGNA3).",
                f"P1 max. {power} W, max. head {head:.1f} m, max. flow {flow:.1f} m³/h (curve axis, MAGNA3 datasheet).",
            )
        )
    return entries


def _wilo_pico() -> list[dict[str, Any]]:
    models = [
        ("25/1-4", 20, 2.7, 4.3, "4215513"),
        ("25/1-6", 40, 3.6, 6.0, "4215515"),
    ]
    entries = []
    for model, power, flow, head, article in models:
        entries.append(
            _pump(
                "Wilo",
                "Yonos PICO",
                f"Yonos PICO {model}",
                power,
                flow,
                head,
                "dp",
                "Δp-v/Δp-c; Konstantdrehzahl I–III",
                f"{_WILO_PICO_SOURCE}/{article}",
                f"P1 {power} W, max. Förderstrom {flow:.1f} m³/h, max. Förderhöhe {head:.1f} m (Wilo-Datenblatt {model}).",
                f"P1 {power} W, max. flow {flow:.1f} m³/h, max. head {head:.1f} m (Wilo datasheet {model}).",
            )
        )
    return entries


PUMPS: list[dict[str, Any]] = (
    _alpha23("Grundfos", "ALPHA2") + _alpha23("Grundfos", "ALPHA3") + _magna3() + _wilo_pico()
)


def _valve(manufacturer: str, series: str, model: str, presets: dict[str, float], kvs: float | None, source: str, note_de: str, note_en: str) -> dict[str, Any]:
    return {
        "id": f"{manufacturer.lower()}-{model.lower().replace(' ', '-').replace('/', '-')}",
        "manufacturer": manufacturer,
        "series": series,
        "model": model,
        "fields": {"model": model},
        "presets": presets,
        "kvs": kvs,
        "source": source,
        "note": {"de": note_de, "en": note_en},
    }


def _ra_n() -> list[dict[str, Any]]:
    entries = []
    for size, values, kv_n, kvs in _RA_N_MODELS:
        presets = {str(index + 1): value for index, value in enumerate(values)}
        presets["N"] = kv_n
        table = ", ".join(f"{index + 1}: {value:.2f}".replace(".", ",") for index, value in enumerate(values))
        entries.append(
            _valve(
                "Danfoss",
                "RA-N",
                f"RA-N {size}",
                presets,
                kvs,
                _RA_N_SOURCE,
                f"Voreinstellung kv (m³/h): {table}; N = {kv_n:.2f}; kvs = {kvs:.2f} (Datenblatt RA-N, Xp = 2 K).",
                f"Preset kv (m³/h): {table}; N = {kv_n:.2f}; kvs = {kvs:.2f} (RA-N datasheet, Xp = 2 K).",
            )
        )
    return entries


_AV6_VALUES = [0.055, 0.170, 0.313, 0.446, 0.560, 0.652]
_AV9_VALUES = [0.050, 0.090, 0.130, 0.180, 0.240, 0.310, 0.410, 0.550, 0.670]


def _oventrop() -> list[dict[str, Any]]:
    return [
        _valve(
            "Oventrop",
            "AV 6",
            "AV 6",
            {str(index + 1): value for index, value in enumerate(_AV6_VALUES)},
            None,
            _AV_SOURCE,
            "Voreinstellung kv (m³/h) bei 2 K P-Abweichung: "
            + ", ".join(f"{index + 1}: {value:.3f}".replace(".", ",") for index, value in enumerate(_AV6_VALUES))
            + " (Datenblatt AV 6, Baureihe AV 6/RFV 6/ADV 6).",
            "Preset kv (m³/h) at 2 K P-deviation: "
            + ", ".join(f"{index + 1}: {value:.3f}" for index, value in enumerate(_AV6_VALUES))
            + " (AV 6 datasheet, series AV 6/RFV 6/ADV 6).",
        ),
        _valve(
            "Oventrop",
            "AV 9",
            "AV 9",
            {str(index + 1): value for index, value in enumerate(_AV9_VALUES)},
            None,
            _AV_SOURCE,
            "Voreinstellung kv (m³/h) bei 2 K P-Abweichung: "
            + ", ".join(f"{index + 1}: {value:.3f}".replace(".", ",") for index, value in enumerate(_AV9_VALUES))
            + " (Datenblatt AV 9).",
            "Preset kv (m³/h) at 2 K P-deviation: "
            + ", ".join(f"{index + 1}: {value:.3f}" for index, value in enumerate(_AV9_VALUES))
            + " (AV 9 datasheet).",
        ),
    ]


THERMOSTATS: list[dict[str, Any]] = _ra_n() + _oventrop()


def inventory_catalog() -> dict[str, Any]:
    """Katalog für das Inventarformular."""
    return {
        "version": CATALOG_VERSION,
        "note": _NOTE,
        "pumps": PUMPS,
        "thermostats": THERMOSTATS,
    }
