"""Herstellerdaten mit der echten Anlage verbinden (nur lesend).

- Referenz-COP aus dem Datenblatt je Tag (Außentemperatur und Vorlauf des Tages)
- Wärmebedarf gegen die kleinste Leistung der Wärmepumpe (Takten unvermeidbar?)
- Stiebel-WPM: Heizkurve je Kreis aus Steilheit und Raum-Soll des Reglers
- Speicher: erwartete Abkühlung aus dem Bereitschaftsverlust
"""

from __future__ import annotations

import re
from typing import Any

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant

from .analysis.datasheet import curve_points, output_range, reference_cop, standby_cooling, stiebel_curve, storage_kwh_per_k
from .const import (
    CONF_BUFFER_MODEL,
    CONF_CIRCUITS,
    CONF_DHW_TANK_MODEL,
    CONF_HEAT_PUMP_MODEL,
    CONF_OUTDOOR_ENTITY,
)
from .heat_pump_catalog import heat_pump, storage

_HK = re.compile(r"(?:_hk_?|heizkreis_)(\d)(?:_|$)")
_WEEK = 7


def _num(hass: HomeAssistant, entity_id: str | None) -> float | None:
    state = hass.states.get(entity_id) if entity_id else None
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None
    try:
        return float(state.state)
    except (TypeError, ValueError):
        return None


def circuit_number(circuit: dict[str, Any]) -> int | None:
    """Nummer des Heizkreises am Stiebel-Regler aus den Entitätsnamen."""
    for key in ("temperature_entity", "target_entity", "pump_entity"):
        match = _HK.search(str(circuit.get(key) or ""))
        if match:
            return int(match.group(1))
    return None


def _find(hass: HomeAssistant, domain: str, suffix: str, *, exclude: str | None = None) -> str | None:
    for state in hass.states.async_all(domain):
        entity_id = state.entity_id
        if entity_id.endswith(suffix) and "stiebel" in entity_id and (exclude is None or exclude not in entity_id):
            return entity_id
    return None


def stiebel_curves(hass: HomeAssistant, options: dict[str, Any], outdoor: float | None) -> list[dict[str, Any]]:
    """Heizkurve je Kreis, wie der WPM sie aus Steilheit und Raum-Soll rechnet."""
    rows: list[dict[str, Any]] = []
    for circuit in options.get(CONF_CIRCUITS) or []:
        number = circuit_number(circuit)
        if number is None:
            continue
        slope_id = _find(hass, "number", f"heizkurve_steilheit_hk_{number}")
        slope = _num(hass, slope_id)
        if slope is None:
            continue
        room_id = _find(hass, "sensor", f"soll_raumtemperatur_hk_{number}")
        day_id = _find(hass, "number", f"tagbetrieb_temperatursoll_hk_{number}")
        night_id = _find(hass, "number", f"absenkbetrieb_temperatursoll_hk_{number}")
        room = _num(hass, room_id)
        if room is None or not 5 <= room <= 30:
            room = _num(hass, day_id)
        if room is None:
            continue
        target_id = _find(hass, "sensor", f"soll_temperatur_hk_{number}", exclude="raum")
        target = _num(hass, target_id)
        formula = round(stiebel_curve(slope, room, outdoor), 1) if outdoor is not None else None
        rows.append(
            {
                "circuit": circuit.get("id"),
                "name": circuit.get("name"),
                "number": number,
                "slope": slope,
                "room": room,
                "room_day": _num(hass, day_id),
                "room_night": _num(hass, night_id),
                "target_now": target,
                "formula_now": formula,
                "difference": round(target - formula, 1) if target is not None and formula is not None else None,
                "points": curve_points(slope, room),
            }
        )
    return rows


def _week(series: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [r for r in series[-_WEEK:] if r.get("power") and r.get("heat") is not None and r["power"] > 0]


def build_datasheet(
    hass: HomeAssistant, data: dict[str, Any], options: dict[str, Any], series: list[dict[str, Any]], hydraulics: dict[str, Any]
) -> dict[str, Any]:
    """Block ``datasheet`` der Summary. ``series`` bekommt je Tag ``cop_ref``."""
    hp = heat_pump(options.get(CONF_HEAT_PUMP_MODEL))
    dhw_tank = storage(options.get(CONF_DHW_TANK_MODEL))
    buffer = storage(options.get(CONF_BUFFER_MODEL))
    outdoor_now = _num(hass, data.get(CONF_OUTDOOR_ENTITY) or options.get(CONF_OUTDOOR_ENTITY))
    result: dict[str, Any] = {"heat_pump": None, "dhw_tank": None, "buffer": None, "curves": []}

    if hp is not None:
        for row in series:
            flow = row.get("flow") if row.get("flow") is not None else row.get("target_flow")
            row["cop_ref"] = reference_cop(hp["points"], row.get("outdoor"), flow)
        week = _week(series)
        heat = sum(r["heat"] for r in week)
        power = sum(r["power"] for r in week)
        outdoor = [r["outdoor"] for r in week if r.get("outdoor") is not None]
        refs = [(r["cop_ref"], r["power"]) for r in week if r.get("cop_ref") is not None]
        cop = round(heat / power, 2) if power > 0 else None
        cop_ref = round(sum(c * p for c, p in refs) / sum(p for _c, p in refs), 2) if refs else None
        mean_outdoor = round(sum(outdoor) / len(outdoor), 1) if outdoor else None
        demand_kw = round(heat / (24 * len(week)), 2) if week else None
        min_kw, max_kw = output_range(hp["range"], mean_outdoor)
        result["heat_pump"] = {
            **hp,
            "week": {
                "cop": cop,
                "cop_ref": cop_ref,
                "share": round(cop / cop_ref, 3) if cop and cop_ref else None,
                "outdoor": mean_outdoor,
                "demand_kw": demand_kw,
                "min_kw": min_kw,
                "max_kw": max_kw,
                "below_min": bool(demand_kw is not None and min_kw is not None and demand_kw < min_kw),
                "days": len(week),
            },
            "now": {"outdoor": outdoor_now, "range": list(output_range(hp["range"], outdoor_now))},
        }
        if hp.get("controller") == "stiebel_wpm":
            result["curves"] = stiebel_curves(hass, options, outdoor_now)

    dhw = (hydraulics or {}).get("dhw") or {}
    if dhw_tank is not None:
        target = dhw.get("target") or dhw.get("temperature")
        result["dhw_tank"] = {
            **dhw_tank,
            "kwh_per_k": storage_kwh_per_k(dhw_tank),
            "cooling_expected": standby_cooling(dhw_tank, target),
            "cooling_measured": dhw.get("cooling_k_per_h"),
        }
    if buffer is not None:
        result["buffer"] = {**buffer, "kwh_per_k": storage_kwh_per_k(buffer)}
    return result
