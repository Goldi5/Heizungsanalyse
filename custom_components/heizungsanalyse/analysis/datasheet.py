"""Rechnen mit Herstellerdaten: Referenz-COP, Leistungsbereich, Heizkurve, Speicher.

Alles ohne Home Assistant. Die Datenblattpunkte kommen aus ``heat_pump_catalog``.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

WATER_KWH_PER_L_K = 0.001163
#: Bezug der Bereitschaftsverluste im Datenblatt: 65 °C Speicher, 20 °C Umgebung
STANDBY_REFERENCE_K = 45.0


def _interp(pairs: Sequence[tuple[float, float]], x: float) -> float | None:
    """Lineare Interpolation, außerhalb der Stützstellen auf den Randwert begrenzt."""
    if not pairs:
        return None
    ordered = sorted(pairs)
    if x <= ordered[0][0]:
        return ordered[0][1]
    if x >= ordered[-1][0]:
        return ordered[-1][1]
    for (x0, y0), (x1, y1) in zip(ordered, ordered[1:], strict=False):
        if x0 <= x <= x1:
            if x1 == x0:
                return y0
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return ordered[-1][1]


def reference_cop(points: Sequence[Mapping[str, Any]], outdoor: float | None, flow: float | None) -> float | None:
    """COP laut Datenblatt bei Außenluft ``outdoor`` und Vorlauf ``flow``.

    Erst je Vorlaufstufe über die Außentemperatur interpolieren, dann zwischen
    den beiden benachbarten Vorlaufstufen. Ränder werden gehalten, nicht
    extrapoliert.
    """
    if outdoor is None or flow is None or not points:
        return None
    levels: dict[float, list[tuple[float, float]]] = {}
    for point in points:
        levels.setdefault(float(point["flow"]), []).append((float(point["outdoor"]), float(point["cop"])))
    per_level = [(level, _interp(pairs, outdoor)) for level, pairs in levels.items()]
    value = _interp([(level, cop) for level, cop in per_level if cop is not None], flow)
    return round(value, 2) if value is not None else None


def output_range(table: Sequence[Mapping[str, Any]], outdoor: float | None) -> tuple[float | None, float | None]:
    """Kleinste und größte Heizleistung bei ``outdoor`` (W35)."""
    if outdoor is None or not table:
        return None, None
    low = _interp([(float(r["outdoor"]), float(r["min_kw"])) for r in table], outdoor)
    high = _interp([(float(r["outdoor"]), float(r["max_kw"])) for r in table], outdoor)
    return (round(low, 2) if low is not None else None, round(high, 2) if high is not None else None)


def stiebel_curve(slope: float, room_c: float, outdoor_c: float) -> float:
    """Soll-Vorlauf nach der WPM-Heizkurve.

    Stiebel veröffentlicht nur Diagramme. Die Kurven verlaufen nahezu linear
    durch den Fußpunkt (Außen = Raum-Soll → Vorlauf = Raum-Soll); die
    Raumtemperatur verschiebt die Kurve parallel. Mit den Reglerwerten einer
    echten Anlage nachgerechnet: Abweichung unter 1 K, der Rest kommt von der
    gedämpften Außentemperatur des Reglers.
    """
    return room_c + slope * max(0.0, room_c - outdoor_c)


def curve_points(slope: float, room_c: float, *, start: int = -15, stop: int = 20, step: int = 5) -> list[dict[str, float]]:
    return [{"x": float(t), "y": round(stiebel_curve(slope, room_c, t), 1)} for t in range(start, stop + 1, step)]


def standby_cooling(storage: Mapping[str, Any] | None, tank_c: float | None, ambient_c: float = 20.0) -> float | None:
    """Abkühlung in K je Stunde ohne Zapfung, aus dem Bereitschaftsverlust."""
    if not storage or tank_c is None:
        return None
    volume = float(storage.get("volume_l") or 0)
    standby = float(storage.get("standby_kwh_24h") or 0)
    if volume <= 0 or standby <= 0 or tank_c <= ambient_c:
        return None
    loss_kw = standby / 24 * (tank_c - ambient_c) / STANDBY_REFERENCE_K
    return round(loss_kw / (volume * WATER_KWH_PER_L_K), 3)


def storage_kwh_per_k(storage: Mapping[str, Any] | None) -> float | None:
    if not storage or not storage.get("volume_l"):
        return None
    return round(float(storage["volume_l"]) * WATER_KWH_PER_L_K, 3)


def demand_model(rows: Sequence[Mapping[str, Any]], *, min_days: int = 10) -> dict[str, float] | None:
    """Heizwärme je Tag gegen Außentemperatur: kWh/Tag = slope × T + intercept.

    Aus den eigenen Messtagen der Anlage; nur Tage mit Wärme und Außentemperatur.
    """
    points = [
        (float(r["outdoor"]), float(r["heat"]))
        for r in rows
        if r.get("outdoor") is not None and r.get("heat") is not None and float(r["heat"]) > 0
    ]
    if len(points) < min_days:
        return None
    n = len(points)
    mx = sum(x for x, _ in points) / n
    my = sum(y for _, y in points) / n
    sxx = sum((x - mx) ** 2 for x, _ in points)
    if sxx <= 0:
        return None
    slope = sum((x - mx) * (y - my) for x, y in points) / sxx
    if slope >= 0:
        return None  # mehr Wärme bei Wärme – kein brauchbares Modell
    intercept = my - slope * mx
    ss_tot = sum((y - my) ** 2 for _, y in points)
    ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in points)
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0
    return {"slope": round(slope, 3), "intercept": round(intercept, 2), "r2": round(r2, 3), "days": n}


def demand_kw(model: Mapping[str, float], outdoor: float) -> float:
    """Mittlere Heizleistung in kW bei dieser Außentemperatur (nie negativ)."""
    return max(0.0, (model["slope"] * outdoor + model["intercept"]) / 24)


def frost_days(
    forecast: Sequence[Mapping[str, Any]],
    model: Mapping[str, float],
    output_table: Sequence[Mapping[str, Any]],
    *,
    bivalent: float | None = None,
) -> list[dict[str, Any]]:
    """Je Vorhersagetag: Bedarf im Tagesmittel und in der kältesten Stunde gegen die WP-Leistung."""
    days: list[dict[str, Any]] = []
    for item in forecast:
        high, low = item.get("temperature"), item.get("templow")
        if high is None and low is None:
            continue
        high = float(high if high is not None else low)
        low = float(low if low is not None else high)
        mean = (high + low) / 2
        need_mean = demand_kw(model, mean)
        need_peak = demand_kw(model, low)
        _low_out, max_out = output_range(output_table, low)
        if max_out is None:
            status = "unknown"
        elif need_peak <= 0.85 * max_out:
            status = "ok"
        elif need_peak <= max_out:
            status = "tight"
        else:
            status = "short"
        days.append(
            {
                "date": str(item.get("datetime") or "")[:10],
                "high": round(high, 1),
                "low": round(low, 1),
                "demand_kw": round(need_mean, 2),
                "peak_kw": round(need_peak, 2),
                "max_kw": max_out,
                "status": status,
                "aux_blocked": bool(status == "short" and bivalent is not None and low > bivalent),
            }
        )
    return days
