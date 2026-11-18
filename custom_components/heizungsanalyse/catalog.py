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

PUMPS: list[dict[str, Any]] = [
    {
        "id": "grundfos-alpha2-25-40",
        "manufacturer": "Grundfos",
        "series": "ALPHA2",
        "model": "ALPHA2 25-40",
        "fields": {
            "manufacturer": "Grundfos",
            "model": "ALPHA2 25-40",
            "control_mode": "dp",
            "setting": "AUTOADAPT; PP/CP; Stufen I–III",
            "power_w": 18,
            "flow_m3h": 2.4,
            "max_head_m": 4.0,
        },
        "source": "https://api.grundfos.com/literature/Grundfosliterature-6014960.pdf",
        "note": {
            "de": "P1 3–18 W, max. Förderstrom 2,4 m³/h, max. Förderhöhe 4 m (Datenblatt ALPHA2, 25-40).",
            "en": "P1 3–18 W, max. flow 2.4 m³/h, max. head 4 m (ALPHA2 datasheet, 25-40).",
        },
    },
    {
        "id": "wilo-yonos-pico-25-1-4",
        "manufacturer": "Wilo",
        "series": "Yonos PICO",
        "model": "Yonos PICO 25/1-4",
        "fields": {
            "manufacturer": "Wilo",
            "model": "Yonos PICO 25/1-4",
            "control_mode": "dp",
            "setting": "Δp-v/Δp-c; Konstantdrehzahl I–III",
            "power_w": 20,
            "flow_m3h": 2.7,
            "max_head_m": 4.3,
        },
        "source": "https://wilo.com/gb/en/Products/en/products/yonos-pico_id199/4215513",
        "note": {
            "de": "P1 4–20 W, max. Förderstrom 2,7 m³/h, max. Förderhöhe 4,3 m (Wilo-Datenblatt 25/1-4).",
            "en": "P1 4–20 W, max. flow 2.7 m³/h, max. head 4.3 m (Wilo datasheet 25/1-4).",
        },
    },
    {
        "id": "wilo-yonos-pico-25-1-6",
        "manufacturer": "Wilo",
        "series": "Yonos PICO",
        "model": "Yonos PICO 25/1-6",
        "fields": {
            "manufacturer": "Wilo",
            "model": "Yonos PICO 25/1-6",
            "control_mode": "dp",
            "setting": "Δp-v/Δp-c; Konstantdrehzahl I–III",
            "power_w": 40,
            "flow_m3h": 3.6,
            "max_head_m": 6.0,
        },
        "source": "https://wilo.com/gb/en/Products/en/products/yonos-pico_id199/4215515",
        "note": {
            "de": "P1 4–40 W, max. Förderstrom 3,6 m³/h, max. Förderhöhe 6 m (Wilo-Datenblatt 25/1-6).",
            "en": "P1 4–40 W, max. flow 3.6 m³/h, max. head 6 m (Wilo datasheet 25/1-6).",
        },
    },
]

_RA_N15_KV = [0.04, 0.09, 0.16, 0.25, 0.36, 0.43, 0.52]
_RA_N10_KV = [0.04, 0.08, 0.12, 0.19, 0.25, 0.33, 0.38]
_RA_N20_KV = [0.10, 0.15, 0.17, 0.26, 0.35, 0.46, 0.73]
_OVENTROP_AV6_KV = [0.025, 0.051, 0.095, 0.152, 0.228, 0.323]

def _danfoss(model: str, presets: list[float], kvs: float, series: str = "RA-N") -> dict[str, Any]:
    table = ", ".join(f"{index + 1}: {value:.2f}".replace(".", ",") for index, value in enumerate(presets))
    return {
        "id": f"danfoss-{model.lower().replace(' ', '-').replace('/', '-')}",
        "manufacturer": "Danfoss",
        "series": series,
        "model": model,
        "fields": {"model": model},
        "presets": {str(index + 1): value for index, value in enumerate(presets)},
        "kvs": kvs,
        "source": "https://assets.danfoss.com/documents/latest/560607/AI003086404253en-010202.pdf",
        "note": {
            "de": f"Voreinstellung kv (m³/h): {table}; N = {kvs:.2f} (Datenblatt RA-N, mit RA-2000-Fühler, Xp = 2 K).",
            "en": f"Preset kv (m³/h): {table}; N = {kvs:.2f} (RA-N datasheet, with RA 2000 sensor, Xp = 2 K).",
        },
    }


THERMOSTATS: list[dict[str, Any]] = [
    _danfoss("RA-N 10", _RA_N10_KV, 0.65),
    _danfoss("RA-N 15", _RA_N15_KV, 0.90),
    _danfoss("RA-N 20", _RA_N20_KV, 1.40),
    {
        "id": "oventrop-av-6",
        "manufacturer": "Oventrop",
        "series": "AV 6",
        "model": "AV 6",
        "fields": {"model": "AV 6"},
        "presets": {str(index + 1): value for index, value in enumerate(_OVENTROP_AV6_KV)},
        "kvs": None,
        "source": "https://download.sankom.net/dk/documentation/oventrop/dane%20techniczne/01%20armatura%20grzejnikowa/db_1183763_de.pdf",
        "note": {
            "de": "Voreinstellung kv (m³/h): 1: 0,025, 2: 0,051, 3: 0,095, 4: 0,152, 5: 0,228, 6: 0,323 (Datenblatt AV 6, 2 K P-Abweichung).",
            "en": "Preset kv (m³/h): 1: 0.025, 2: 0.051, 3: 0.095, 4: 0.152, 5: 0.228, 6: 0.323 (AV 6 datasheet, 2 K P-deviation).",
        },
    },
]


def inventory_catalog() -> dict[str, Any]:
    """Katalog für das Inventarformular."""
    return {
        "version": CATALOG_VERSION,
        "note": _NOTE,
        "pumps": PUMPS,
        "thermostats": THERMOSTATS,
    }
