"""Heizkurvenvorschlag aus Vorlauf-Abweichung und Außentemperatur (reines Python).

Die Integration bleibt read-only: sie schlägt Parameter vor, der Anwender
übernimmt sie selbst. Der Vorschlag basiert auf der Median-Abweichung
(Ist-Vorlauf minus Soll-Vorlauf) je Außentemperatur-Bin.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from statistics import median
from typing import Any

from .types import HourSample


@dataclass(slots=True, frozen=True)
class CurveSuggestion:
    """Vorschlag für Heizkurven-Parameter."""

    current_offset_k: float | None = None
    suggested_offset_k: float | None = None
    current_slope: float | None = None
    suggested_slope: float | None = None
    median_deviation_k: float | None = None
    estimated_cop_gain_pct: float | None = None
    confidence: str = "low"  # low / medium / high
    reason: str = ""
    bins: list[dict[str, Any]] = None  # type: ignore[assignment]

    def as_dict(self) -> dict[str, Any]:
        return {
            "current_offset_k": self.current_offset_k,
            "suggested_offset_k": self.suggested_offset_k,
            "current_slope": self.current_slope,
            "suggested_slope": self.suggested_slope,
            "median_deviation_k": self.median_deviation_k,
            "estimated_cop_gain_pct": self.estimated_cop_gain_pct,
            "confidence": self.confidence,
            "reason": self.reason,
            "bins": self.bins or [],
        }


def _bin_deviations(hours: Sequence[HourSample], bin_width: float = 2.0) -> list[dict[str, Any]]:
    """Median-Abweichung je Außentemperatur-Bin."""
    groups: dict[int, list[float]] = {}
    for hour in hours:
        if hour.flow_c is None or hour.target_flow_c is None:
            continue
        if hour.compressor_on is False:
            continue
        dev = hour.flow_c - hour.target_flow_c
        if hour.outdoor_c is None:
            continue
        key = int(hour.outdoor_c // bin_width) * int(bin_width) if False else round(hour.outdoor_c / bin_width) * bin_width
        groups.setdefault(int(key), []).append(dev)
    result: list[dict[str, Any]] = []
    for lower in sorted(groups):
        vals = groups[lower]
        result.append({
            "outdoor_lower": float(lower),
            "outdoor_upper": float(lower + bin_width),
            "median_deviation_k": round(median(vals), 2),
            "samples": len(vals),
        })
    return result


def suggest_curve(
    hours: Sequence[HourSample],
    *,
    min_hours: int = 24,
) -> CurveSuggestion:
    """Heizkurvenvorschlag aus Vorlauf-Abweichung.

    Wenn die Abweichung über alle Außentemperaturen positiv ist, wird der
    Offset gesenkt. Wenn sie mit der Außentemperatur variiert, wird die
    Steigung angepasst.
    """
    deviations = [h.flow_c - h.target_flow_c for h in hours if h.flow_c is not None and h.target_flow_c is not None and h.compressor_on is not False]
    if len(deviations) < min_hours:
        return CurveSuggestion(reason="Zu wenig Stunden mit laufendem Verdichter.", confidence="low", bins=[])

    bins = _bin_deviations(hours)
    if not bins:
        return CurveSuggestion(reason="Keine Außentemperatur-Daten.", confidence="low", bins=[])

    overall = median(deviations)
    # Confidence based on sample count
    if len(deviations) >= 100:
        confidence = "high"
    elif len(deviations) >= 50:
        confidence = "medium"
    else:
        confidence = "low"

    # Suggested offset change = -median deviation (lower curve if flow too warm)
    suggested_offset = round(-overall, 1)

    # Slope: if deviation increases with outdoor temp, flatten; if decreases, steepen
    if len(bins) >= 3:
        lows = [b["median_deviation_k"] for b in bins[:len(bins)//2]]
        highs = [b["median_deviation_k"] for b in bins[len(bins)//2:]]
        slope_change = round((median(highs) - median(lows)) * 0.1, 2) if lows and highs else 0.0
    else:
        slope_change = 0.0

    # Estimated COP gain: ~2-3% per K flow reduction
    gain = round(abs(overall) * 2.5, 1) if overall > 0.5 else 0.0

    if abs(overall) < 0.5:
        reason = "Vorlauf passt gut zur Kennlinie. Keine Anpassung nötig."
    elif overall > 0:
        reason = f"Vorlauf liegt im Median {overall:.1f} K über Soll. Heizkurve um {abs(suggested_offset):.1f} K senken."
    else:
        reason = f"Vorlauf liegt im Median {abs(overall):.1f} K unter Soll. Heizkurve um {abs(suggested_offset):.1f} K anheben."

    return CurveSuggestion(
        current_offset_k=0.0,
        suggested_offset_k=suggested_offset,
        current_slope=1.0,
        suggested_slope=round(1.0 + slope_change, 2),
        median_deviation_k=round(overall, 2),
        estimated_cop_gain_pct=gain,
        confidence=confidence,
        reason=reason,
        bins=bins,
    )
