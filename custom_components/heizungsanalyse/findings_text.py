"""Zweisprachige Texte der Findings.

Home Assistant bietet für freie Hinweistexte keinen Übersetzungsplatz in den
Strings-Dateien. Deshalb liegen die Vorlagen hier, getrennt von der Logik und
mit denselben Parametern wie ``analysis/findings.py``. Fehlt eine Sprache,
fällt die Ausgabe auf Deutsch zurück.
"""

from __future__ import annotations

from typing import Any

TEXTS: dict[str, dict[str, dict[str, str]]] = {
    "de": {
        "flow_deviation": {
            "text": "Der Ist-Vorlauf liegt im Median {median} K über dem Soll (Schwelle {threshold} K).",
            "suggestion": "Sollwert, Heizkurve und Pufferführung prüfen; die Abweichung ist der stärkste Optimierungskandidat.",
        },
        "too_many_starts": {
            "text": "{starts} Verdichterstarts pro Tag bei Außentemperatur über 0 Grad (Schwelle {threshold}).",
            "suggestion": "Hysterese, Mindestlaufzeit und Puffervolumen prüfen, damit der Verdichter länger läuft.",
        },
        "short_cycles": {
            "text": "Die mittlere Laufzeit je Zyklus beträgt {minutes} Minuten (Schwelle {threshold} Minuten).",
            "suggestion": "Takten reduzieren: Sperrzeiten, Hysterese und Wärmebedarf abstimmen.",
        },
        "pump_idle": {
            "text": "Die Pumpe in {circuit} läuft {share} % ihrer Laufzeit ohne Verdichter (Schwelle {threshold} %).",
            "suggestion": "Pumpenschaltung und Mischerführung prüfen; Dauerlauf ohne Wärmebedarf kostet Strom.",
        },
        "room_underheated": {
            "text": "{room} liegt im Median {median} K unter dem Soll (Schwelle {threshold} K).",
            "suggestion": "Heizkörperventil, Voreinstellung und Raumzuordnung prüfen; kein automatischer Eingriff.",
        },
        "room_overheated": {
            "text": "{room} liegt im Median {median} K über dem Soll (Schwelle {threshold} K).",
            "suggestion": "Regelung, Ventil und Fremdwärme prüfen; Überheizung kostet Energie.",
        },
        "aux_heater": {
            "text": "Der Heizstab läuft im Mittel {hours} Stunden pro Tag (Schwelle {threshold} h).",
            "suggestion": "Einsatzgrenzen und Sperrzeiten prüfen; der Heizstab senkt die Effizienz.",
        },
        "duplicate_sensors": {
            "text": "{count} Sensorpaare liefern identische Tageswerte.",
            "suggestion": "Fühlerzuordnung klären, bevor Spreizung oder Rücklauf daraus berechnet werden.",
        },
        "source_unavailable": {
            "text": "{entity} ist seit {hours} Stunden nicht verfügbar.",
            "suggestion": "Integration und Verbindung des Sensors prüfen; Kennzahlen bleiben bis dahin unbekannt.",
        },
        "defrost": {
            "text": "Die Abtauung läuft im Mittel {hours} Stunden pro Tag (Schwelle {threshold} h).",
            "suggestion": "Abtauverhalten bei milden Temperaturen beobachten; Werte sind stichprobenbasiert.",
        },
        "cop_curve": {
            "text": "Der COP {cop} weicht {deviation} % von der eigenen Kennlinie ({expected}) ab (Schwelle {threshold} %).",
            "suggestion": "Betriebsbedingungen des Zeitraums prüfen; die Kennlinie braucht mehr Daten.",
        },
        "mixer_unrest": {
            "text": "Der Mischer in {circuit} taktet {pulses} mal pro Tag (Schwelle {threshold}).",
            "suggestion": "Mischerlaufzeit und Regelparameter prüfen; häufiges Takten verschleißt.",
        },
        "missing_statistics": {
            "text": "{count} Pflichtquellen liefern keine Langzeitstatistik.",
            "suggestion": "state_class und Recorder-Einstellungen der Entities prüfen.",
        },
        "power_source_fallback": {
            "text": "Die Integration rechnet mit der Ersatzstromquelle.",
            "suggestion": "Primärquelle wiederherstellen; die Kennzahlen sind bis dahin als Ersatz gekennzeichnet.",
        },
        "spread_low": {
            "text": "Die Spreizung der Wärmepumpe liegt im Median bei {spread} K (unter {threshold} K).",
            "suggestion": "Volumenstrom ist eher hoch: Pumpenstufe bzw. Pumpen-Sollwert prüfen. Zu kleine Spreizung kostet Pumpenstrom und begünstigt Takten.",
        },
        "spread_high": {
            "text": "Die Spreizung der Wärmepumpe liegt im Median bei {spread} K (über {threshold} K).",
            "suggestion": "Volumenstrom ist eher knapp: Filter, Ventile und Pumpe prüfen. Große Spreizung erhöht den nötigen Vorlauf und senkt den COP.",
        },
        "return_temp_high": {
            "text": "Die Rücklauftemperatur liegt im Median bei {value} °C (Schwelle {threshold} °C).",
            "suggestion": "Rücklauf ist zu warm: hydraulischen Abgleich und Ventilstellungen prüfen, ggf. Pumpenstufe senken.",
        },
        "power_source_deviation": {
            "text": "Primär- und Ersatzstromquelle weichen {deviation} % voneinander ab (Schwelle {threshold} %).",
            "suggestion": "Messpunkte abgleichen; eine Quelle schätzt, die andere misst.",
        },
        "heating_curve_adjust": {
            "text": "Der Vorlauf liegt im Median {median} K neben Soll. Vorschlag: Heizkurve um {suggested} K anpassen (ca. {gain} % COP).",
            "suggestion": "Heizkurve im Regler anpassen und 7 Tage beobachten; Vorher/Nachher-Vergleich nutzen.",
        },
        "room_target_check": {
            "text": "Raum {room} weicht im Median {deviation} K vom Soll ab – Sollwert oder Heizkurve prüfen.",
            "suggestion": "Zieltemperatur und Ventilstellung prüfen; bei dauerhafter Abweichung Soll anpassen.",
        },
        "cop_drop": {
            "text": "COP der letzten 7 Tage ({cop}) liegt {drop} unter dem 30-Tage-Wert ({cop_long}).",
            "suggestion": "Verbrauch, Außentemperatur und Abtauvorgänge prüfen; plötzlicher Einbruch deutet auf Störung.",
        },
        "flow_spike": {
            "text": "Vorlauf-Spitzen (p90 {p90} K) überschreiten das Doppelte der Schwelle ({threshold} K).",
            "suggestion": "Vorlauf-Regelung und Mischer prüfen; Spitzen kosten COP.",
        },
    },
    "en": {
        "flow_deviation": {
            "text": "The actual flow temperature is a median {median} K above target (threshold {threshold} K).",
            "suggestion": "Check target, heating curve and buffer control; this is the strongest optimisation candidate.",
        },
        "too_many_starts": {
            "text": "{starts} compressor starts per day above 0 degrees outdoor (threshold {threshold}).",
            "suggestion": "Review hysteresis, minimum runtime and buffer volume so the compressor runs longer.",
        },
        "short_cycles": {
            "text": "Mean runtime per cycle is {minutes} minutes (threshold {threshold} minutes).",
            "suggestion": "Reduce cycling: align lockout times, hysteresis and heat demand.",
        },
        "pump_idle": {
            "text": "The pump in {circuit} runs {share} % of its runtime without the compressor (threshold {threshold} %).",
            "suggestion": "Check pump switching and mixer control; running without heat demand costs energy.",
        },
        "room_underheated": {
            "text": "{room} is a median {median} K below target (threshold {threshold} K).",
            "suggestion": "Check valve, presetting and room assignment; no automatic action is taken.",
        },
        "room_overheated": {
            "text": "{room} is a median {median} K above target (threshold {threshold} K).",
            "suggestion": "Check control, valve and external heat; overheating costs energy.",
        },
        "aux_heater": {
            "text": "The auxiliary heater runs {hours} hours per day on average (threshold {threshold} h).",
            "suggestion": "Review activation limits and lockout times; the heater lowers efficiency.",
        },
        "duplicate_sensors": {
            "text": "{count} sensor pairs report identical daily values.",
            "suggestion": "Clarify sensor assignment before deriving spread or return temperature.",
        },
        "source_unavailable": {
            "text": "{entity} has been unavailable for {hours} hours.",
            "suggestion": "Check the integration and connection; metrics stay unknown until then.",
        },
        "defrost": {
            "text": "Defrost runs {hours} hours per day on average (threshold {threshold} h).",
            "suggestion": "Observe defrost behaviour at mild temperatures; values are sample-based.",
        },
        "cop_curve": {
            "text": "COP {cop} deviates {deviation} % from the own curve ({expected}) (threshold {threshold} %).",
            "suggestion": "Review operating conditions; the curve needs more data.",
        },
        "mixer_unrest": {
            "text": "The mixer in {circuit} cycles {pulses} times per day (threshold {threshold}).",
            "suggestion": "Check mixer runtime and control parameters; frequent cycling wears parts.",
        },
        "missing_statistics": {
            "text": "{count} required sources provide no long-term statistics.",
            "suggestion": "Check state_class and recorder settings of the entities.",
        },
        "power_source_fallback": {
            "text": "The integration is using the fallback power source.",
            "suggestion": "Restore the primary source; metrics are flagged as fallback meanwhile.",
        },
        "spread_low": {
            "text": "The heat pump spread has a median of {spread} K (below {threshold} K).",
            "suggestion": "Volume flow is rather high: check pump stage or pump setpoint. A small spread costs pump power and favours cycling.",
        },
        "spread_high": {
            "text": "The heat pump spread has a median of {spread} K (above {threshold} K).",
            "suggestion": "Volume flow is rather low: check filters, valves and pump. A large spread raises the required flow temperature and lowers COP.",
        },
        "power_source_deviation": {
            "text": "Primary and fallback power sources deviate {deviation} % (threshold {threshold} %).",
            "suggestion": "Compare measurement points; one source estimates, the other measures.",
        },
    },
}


def render(key: str, params: dict[str, Any] | None, language: str | None = None) -> dict[str, str]:
    """Text und Empfehlung zu einem Finding-Schlüssel."""
    base = (language or "de").replace("-", "_").split("_")[0].lower()
    lang = base if base in TEXTS else "de"
    templates = TEXTS.get(lang, TEXTS["de"]).get(key) or TEXTS["de"].get(key) or {}
    values = params or {}
    return {
        "text": _format(templates.get("text", key), values),
        "suggestion": _format(templates.get("suggestion", ""), values),
    }


def _format(template: str, params: dict[str, Any]) -> str:
    try:
        return template.format(**params)
    except (KeyError, IndexError, ValueError):
        return template
