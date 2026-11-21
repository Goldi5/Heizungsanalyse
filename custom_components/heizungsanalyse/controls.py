"""Reglerwerte aus dem Dashboard verstellen – mit engen Grenzen und Rückgängig.

Erkannt werden die Einstell-Entitäten des Reglers (heute: Stiebel Eltron WPM
über die ISG-Integration). Geschrieben wird nur, was hier erkannt wurde, nur
innerhalb sicherer Grenzen und nur von Admins (siehe websocket_api). Jede
Verstellung landet im Änderungsprotokoll und kann 24 Stunden lang mit einem
Klick zurückgenommen werden.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
import re
from typing import Any
import uuid

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import CONF_CIRCUITS

UNDO_WINDOW = timedelta(hours=24)

_HK = re.compile(r"(?:_hk_?|heizkreis_)(\d)(?:_|$)")


@dataclass(frozen=True)
class Limit:
    low: float
    high: float
    step: float


#: Sichere Grenzen – enger als das, was der Regler zulässt
SLOPE = Limit(0.1, 1.5, 0.05)
ROOM_DAY = Limit(16.0, 25.0, 0.5)
ROOM_NIGHT = Limit(14.0, 25.0, 0.5)
DHW_COMFORT = Limit(40.0, 60.0, 1.0)
DHW_ECO = Limit(35.0, 60.0, 1.0)
BIVALENT = Limit(-20.0, 5.0, 0.5)


def _circuit_number(circuit: dict[str, Any]) -> int | None:
    for key in ("temperature_entity", "target_entity", "pump_entity"):
        match = _HK.search(str(circuit.get(key) or ""))
        if match:
            return int(match.group(1))
    return None


def _find(hass: HomeAssistant, domain: str, suffix: str) -> str | None:
    for state in hass.states.async_all(domain):
        if state.entity_id.endswith(suffix) and "stiebel" in state.entity_id:
            return state.entity_id
    return None


def _value(hass: HomeAssistant, entity_id: str) -> Any:
    state = hass.states.get(entity_id)
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None
    if entity_id.startswith("select."):
        return state.state
    try:
        return float(state.state)
    except (TypeError, ValueError):
        return None


def _number(hass: HomeAssistant, entity_id: str | None, limit: Limit, **meta: Any) -> dict[str, Any] | None:
    if not entity_id:
        return None
    state = hass.states.get(entity_id)
    if state is None:
        return None
    attrs = state.attributes
    low = max(limit.low, float(attrs.get("min", limit.low)))
    high = min(limit.high, float(attrs.get("max", limit.high)))
    if low > high:
        return None
    return {
        "key": entity_id,
        "entity": entity_id,
        "kind": "number",
        "min": low,
        "max": high,
        "step": limit.step,
        "unit": attrs.get("unit_of_measurement"),
        "value": _value(hass, entity_id),
        **meta,
    }


def discover(hass: HomeAssistant, options: dict[str, Any]) -> list[dict[str, Any]]:
    """Alle verstellbaren Reglerwerte, gruppiert für das Dashboard."""
    controls: list[dict[str, Any]] = []
    for circuit in options.get(CONF_CIRCUITS) or []:
        number = _circuit_number(circuit)
        if number is None:
            continue
        meta = {"group": "circuit", "circuit": circuit.get("id"), "circuit_name": circuit.get("name"), "number": number}
        for suffix, limit, field in (
            (f"heizkurve_steilheit_hk_{number}", SLOPE, "slope"),
            (f"tagbetrieb_temperatursoll_hk_{number}", ROOM_DAY, "room_day"),
            (f"absenkbetrieb_temperatursoll_hk_{number}", ROOM_NIGHT, "room_night"),
        ):
            control = _number(hass, _find(hass, "number", suffix), limit, field=field, **meta)
            if control:
                controls.append(control)
    for suffix, limit, field in (
        ("tagbetrieb_warmwasser_temperatursoll", DHW_COMFORT, "dhw_comfort"),
        ("absenkbetrieb_warmwasser_temperatursoll", DHW_ECO, "dhw_eco"),
    ):
        control = _number(hass, _find(hass, "number", suffix), limit, field=field, group="dhw")
        if control:
            controls.append(control)
    for suffix, field in (("bivalenztemperatur_heizung", "bivalent_heating"), ("bivalenztemperatur_warmwasser", "bivalent_dhw")):
        control = _number(hass, _find(hass, "number", suffix), BIVALENT, field=field, group="plant")
        if control:
            controls.append(control)
    mode = _find(hass, "select", "betriebsart")
    if mode:
        state = hass.states.get(mode)
        if state is not None:
            controls.append(
                {
                    "key": mode,
                    "entity": mode,
                    "kind": "select",
                    "options": list(state.attributes.get("options") or []),
                    "value": _value(hass, mode),
                    "field": "mode",
                    "group": "plant",
                }
            )
    return controls


def check_value(control: dict[str, Any], value: Any) -> Any:
    """Neuen Wert prüfen und auf das Raster runden; ``ValueError`` bei Unsinn."""
    if control["kind"] == "select":
        if value not in control.get("options", []):
            raise ValueError("option")
        return value
    try:
        number = float(value)
    except (TypeError, ValueError) as err:
        raise ValueError("number") from err
    if not control["min"] <= number <= control["max"]:
        raise ValueError("range")
    step = control["step"]
    return round(round(number / step) * step, 2)


async def async_apply(hass: HomeAssistant, control: dict[str, Any], value: Any) -> None:
    if control["kind"] == "select":
        await hass.services.async_call("select", "select_option", {"entity_id": control["entity"], "option": value}, blocking=True)
    else:
        await hass.services.async_call("number", "set_value", {"entity_id": control["entity"], "value": value}, blocking=True)


def new_record(control: dict[str, Any], old: Any, new: Any, user: str | None) -> dict[str, Any]:
    return {
        "id": uuid.uuid4().hex[:12],
        "ts": dt_util.utcnow().isoformat(),
        "entity": control["entity"],
        "field": control.get("field"),
        "circuit": control.get("circuit"),
        "old": old,
        "new": new,
        "user": user,
        "undone": False,
    }


def undo_open(record: dict[str, Any], now=None) -> bool:
    """Darf diese Verstellung noch zurückgenommen werden?"""
    if record.get("undone"):
        return False
    ts = dt_util.parse_datetime(str(record.get("ts") or ""))
    if ts is None:
        return False
    return (now or dt_util.utcnow()) - ts <= UNDO_WINDOW


def applied_state(record: dict[str, Any], current: Any, now=None) -> str:
    """Hat der Regler den Wert übernommen? ``ok``, ``waiting`` (bis 10 min) oder ``rejected``.

    Manche Regler nehmen einen Schreibwert an, melden beim nächsten Abfragen aber
    wieder den alten Wert. Das soll man im Dashboard sehen.
    """
    if record.get("undone"):
        return "undone"
    target = record.get("new")
    if current == target or (isinstance(current, float) and isinstance(target, (int, float)) and abs(current - float(target)) < 0.01):
        return "ok"
    ts = dt_util.parse_datetime(str(record.get("ts") or ""))
    if ts is not None and (now or dt_util.utcnow()) - ts < timedelta(minutes=10):
        return "waiting"
    return "rejected"


_FIELD_LABELS = {
    "slope": "Heizkurve Steilheit",
    "room_day": "Raum-Soll Tag",
    "room_night": "Raum-Soll Absenkung",
    "dhw_comfort": "Warmwasser-Soll Komfort",
    "dhw_eco": "Warmwasser-Soll Eco",
    "bivalent_heating": "Bivalenztemperatur Heizen",
    "bivalent_dhw": "Bivalenztemperatur Warmwasser",
    "mode": "Betriebsart",
}


def label(control: dict[str, Any]) -> str:
    text = _FIELD_LABELS.get(str(control.get("field")), str(control.get("entity")))
    return f"{control['circuit_name']}: {text}" if control.get("circuit_name") else text


def label_for(items: list[dict[str, Any]]) -> dict[str, str]:
    return {item["entity"]: label(item) for item in items}
