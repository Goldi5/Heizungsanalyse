"""Zweisprachige Texte der Findings.

Home Assistant bietet fuer freie Hinweistexte keinen Uebersetzungsplatz in den
Strings-Dateien. Deshalb liegen die Vorlagen hier, getrennt von der Logik und
mit denselben Parametern wie ``analysis/findings.py``. Fehlt eine Sprache,
faellt die Ausgabe auf Deutsch zurueck.
"""

from __future__ import annotations

from typing import Any

TEXTS: dict[str, dict[str, dict[str, str]]] = {
    "de": {
        "flow_deviation": {
            "text": "Der Ist-Vorlauf liegt im Median {median} K ueber dem Soll (Schwelle {threshold} K).",
            "suggestion": "Sollwert, Heizkurve und Pufferfuehrung pruefen; die Abweichung ist der staerkste Optimierungskandidat.",
        },
        "too_many_starts": {
            "text": "{starts} Verdichterstarts pro Tag bei Aussentemperatur ueber 0 Grad (Schwelle {threshold}).",
            "suggestion": "Hysterese, Mindestlaufzeit und Puffervolumen pruefen, damit der Verdichter laenger laeuft.",
        },
        "short_cycles": {
            "text": "Die mittlere Laufzeit je Zyklus betraegt {minutes} Minuten (Schwelle {threshold} Minuten).",
            "suggestion": "Takten reduzieren: Sperrzeiten, Hysterese und Waermebedarf abstimmen.",
        },
        "pump_idle": {
            "text": "Die Pumpe in {circuit} laeuft {share} % ihrer Laufzeit ohne Verdichter (Schwelle {threshold} %).",
            "suggestion": "Pumpenschaltung und Mischerfuehrung pruefen; Dauerlauf ohne Waermebedarf kostet Strom.",
        },
        "room_underheated": {
            "text": "{room} liegt im Median {median} K unter dem Soll (Schwelle {threshold} K).",
            "suggestion": "Heizkoerperventil, Voreinstellung und Raumzuordnung pruefen; kein automatischer Eingriff.",
        },
        "room_overheated": {
            "text": "{room} liegt im Median {median} K ueber dem Soll (Schwelle {threshold} K).",
            "suggestion": "Regelung, Ventil und Fremdwaerme pruefen; Ueberheizung kostet Energie.",
        },
        "aux_heater": {
            "text": "Der Heizstab laeuft im Mittel {hours} Stunden pro Tag (Schwelle {threshold} h).",
            "suggestion": "Einsatzgrenzen und Sperrzeiten pruefen; der Heizstab senkt die Effizienz.",
        },
        "duplicate_sensors": {
            "text": "{count} Sensorpaare liefern identische Tageswerte.",
            "suggestion": "Fuehlerzuordnung klaeren, bevor Spreizung oder Ruecklauf daraus berechnet werden.",
        },
        "source_unavailable": {
            "text": "{entity} ist seit {hours} Stunden nicht verfuegbar.",
            "suggestion": "Integration und Verbindung des Sensors pruefen; Kennzahlen bleiben bis dahin unbekannt.",
        },
        "defrost": {
            "text": "Die Abtauung laeuft im Mittel {hours} Stunden pro Tag (Schwelle {threshold} h).",
            "suggestion": "Abtauverhalten bei milden Temperaturen beobachten; Werte sind stichprobenbasiert.",
        },
        "cop_curve": {
            "text": "Der COP {cop} weicht {deviation} % von der eigenen Kennlinie ({expected}) ab (Schwelle {threshold} %).",
            "suggestion": "Betriebsbedingungen des Zeitraums pruefen; die Kennlinie braucht mehr Daten.",
        },
        "mixer_unrest": {
            "text": "Der Mischer in {circuit} taktet {pulses} mal pro Tag (Schwelle {threshold}).",
            "suggestion": "Mischerlaufzeit und Regelparameter pruefen; haeufiges Takten verschleisst.",
        },
        "missing_statistics": {
            "text": "{count} Pflichtquellen liefern keine Langzeitstatistik.",
            "suggestion": "state_class und Recorder-Einstellungen der Entities pruefen.",
        },
        "power_source_fallback": {
            "text": "Die Integration rechnet mit der Ersatzstromquelle.",
            "suggestion": "Primaerquelle wiederherstellen; die Kennzahlen sind bis dahin als Ersatz gekennzeichnet.",
        },
        "power_source_deviation": {
            "text": "Primaer- und Ersatzstromquelle weichen {deviation} % voneinander ab (Schwelle {threshold} %).",
            "suggestion": "Messpunkte abgleichen; eine Quelle schaetzt, die andere misst.",
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
        "power_source_deviation": {
            "text": "Primary and fallback power sources deviate {deviation} % (threshold {threshold} %).",
            "suggestion": "Compare measurement points; one source estimates, the other measures.",
        },
    },
}


def render(key: str, params: dict[str, Any] | None, language: str | None = None) -> dict[str, str]:
    """Text und Empfehlung zu einem Finding-Schluessel."""
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
