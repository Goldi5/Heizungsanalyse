/* Heizungsanalyse 0.8.0b1 - gebaut aus frontend/src (npm run build). Nicht von Hand bearbeiten. */
(() => {
  // src/version.js
  var HA_VERSION = "0.8.0b1";

  // src/i18n.js
  var EN = {
    "COP <b>{c}</b> in den letzten 7 Tagen, mit Warmwasser {w}. Wo der Rest bleibt, zeigen Heizkurve, Warmwasseranteil und Kennlinie.": "COP <b>{c}</b> over the last 7 days, {w} including hot water. Heating curve, hot-water share and the COP curve show where the rest goes.",
    "Die Anlage sammelt noch Daten für ihre eigene Kennlinie.": "The system is still collecting data for its own COP curve.",
    "Deine Wärmepumpe läuft <em class='ok'>so effizient, wie es bei {o} °C zu erwarten ist</em>.": "Your heat pump runs <em class='ok'>as efficiently as expected at {o} °C</em>.",
    "Deine Wärmepumpe läuft <em class='ok'>{p} % besser</em> als sonst bei {o} °C.": "Your heat pump runs <em class='ok'>{p} % better</em> than usual at {o} °C.",
    "Deine Wärmepumpe läuft <em class='bad'>{p} % schlechter</em> als sonst bei {o} °C.": "Your heat pump runs <em class='bad'>{p} % worse</em> than usual at {o} °C.",
    "Kein Handlungsbedarf.": "No action needed.",
    "{n} Punkte brauchen Aufmerksamkeit.": "{n} points need attention.",
    "{n} Punkte zum Ansehen.": "{n} points to look at.",
    "heute {c} · erwartet {e}": "today {c} · expected {e}",
    "Diese Woche": "This week",
    "Punkte: Tages-COP · Band: deine eigene Kennlinie ± Streuung": "Dots: daily COP · band: your own curve ± spread",
    "Vorlauf passt zur Heizkurve ({v} K)": "Flow matches the heating curve ({v} K)",
    "Takten im Rahmen: {s} Starts, {m} min je Zyklus": "Cycling within limits: {s} starts, {m} min per cycle",
    "lädt Warmwasser": "charging hot water",
    "taut ab": "defrosting",
    "heizt": "heating",
    "Was ist zu tun": "What to do",
    "{n} Punkte": "{n} points",
    "nichts": "nothing",
    "erwartet bei {o} °C: {e} · 30 Tage {l}": "expected at {o} °C: {e} · 30 days {l}",
    "30 Tage {l}": "30 days {l}",
    "unter Erwartung": "below expectation",
    "wie erwartet": "as expected",
    "von {v}": "of {v}",
    "Schwelle aus den Einstellungen": "threshold from the settings",
    "im Rahmen": "within limits",
    "an der Grenze": "at the limit",
    "zu viele": "too many",
    "Zyklus": "Cycle",
    "Ziel über {v} min": "target above {v} min",
    "lang": "long",
    "zu kurz": "too short",
    "Zielband ±1 K": "target band ±1 K",
    "Läuft die Anlage so gut, wie sie bei diesem Wetter kann?": "Is the system running as well as it can in this weather?",
    "Kosten {m}": "Costs {m}",
    "noch keine Zyklen": "no cycles yet",
    "{n} Zyklen in 7 Tagen · Median {m} min · {s} % kürzer als 20 min": "{n} cycles in 7 days · median {m} min · {s} % shorter than 20 min",
    "Der Verdichter startete im Schnitt <b>{s}-mal am Tag</b> und lief <b>{m} Minuten</b> am Stück.": "The compressor started <b>{s} times a day</b> on average and ran <b>{m} minutes</b> at a stretch.",
    "Für den Tagesverlauf fehlt noch der Verlauf des Verdichters.": "The compressor history for the daily view is still missing.",
    "Verdichter je Tag": "Compressor per day",
    "letzte 7 Tage · 0–24 Uhr": "last 7 days · 0–24 h",
    "Laufzeit je Start": "Run time per start",
    "Minuten": "minutes",
    "Starts nach Außentemperatur": "Starts by outdoor temperature",
    "Ziel {a}–{b} K": "target {a}–{b} K",
    "Median {m} K über {n} Laufstunden": "median {m} K over {n} running hours",
    "WP-Vorlauf über Puffer-Soll": "HP flow above buffer target",
    "Median {m} K · Warmwasser-Ladungen herausgerechnet": "median {m} K · hot-water charging excluded",
    "<b>{r}</b> ist am häufigsten neben dem Soll: im Median {m} K, {p} % der Zeit {w}.": "<b>{r}</b> is off target most often: median {m} K, {w} {p} % of the time.",
    "Alle Räume halten ihr Soll.": "All rooms hold their target.",
    "Abweichung zum Soll je Uhrzeit": "Deviation from target by time of day",
    "7 Tage · Median": "7 days · median",
    "nur beobachtet": "monitored only",
    "{m} min für 2 K": "{m} min for 2 K",
    "{m} min": "{m} min",
    "noch zu wenig Fälle": "not enough cases yet",
    "Ventil": "Valve",
    "ohne Thermostat": "no thermostat",
    "meldet keinen Wert": "reports no value",
    "Aufheizen": "Heat-up",
    "Fühler": "Sensor",
    "Batterie {b} %": "battery {b} %",
    "Fließbild": "Flow diagram",
    "WÄRMEPUMPE": "HEAT PUMP",
    "Wärme · Strom {p} kW": "heat · power {p} kW",
    "aus": "off",
    "Spreizung {s} K": "spread {s} K",
    "Volumenstrom {v} l/min": "volume flow {v} l/min",
    "außen {o} °C": "outdoor {o} °C",
    "Umschaltung": "Diverter",
    "Heizen": "heating",
    "PUFFER": "BUFFER",
    "Soll {s}": "target {s}",
    "Pumpe an": "pump on",
    "Pumpe aus": "pump off",
    "WARMWASSER": "HOT WATER",
    "Zapfung": "draw-off",
    "Kaltwasser": "cold water",
    "Vorlauf {a} · Soll {b}": "flow {a} · target {b}",
    "lädt gerade": "charging now",
    "{k} K unter Soll": "{k} K below target",
    "Wasser heute {d} m³ · Monat {m} m³": "water today {d} m³ · month {m} m³",
    "Die Wärmepumpe <b>lädt gerade Warmwasser</b> ({a} von {b} °C).": "The heat pump <b>is charging hot water</b> ({a} of {b} °C).",
    "Die Wärmepumpe <b>heizt den Puffer</b> mit {f} °C, der Puffer hat {p} °C bei {s} °C Soll.": "The heat pump <b>is heating the buffer</b> at {f} °C; the buffer is at {p} °C, target {s} °C.",
    "Der Verdichter steht. Der Puffer hält {p} °C bei {s} °C Soll.": "The compressor is off. The buffer holds {p} °C, target {s} °C.",
    "kein Soll": "no target",
    "Median {m} K": "median {m} K",
    "Werte live aus Home Assistant": "live values from Home Assistant",
    "Rohrfarbe = Temperatur. Die Strichlinie läuft nur, wenn die Pumpe läuft. Raum-Chips zeigen die Abweichung zum Soll (7 Tage).": "Pipe colour = temperature. The dashed line moves only while the pump runs. Room chips show the deviation from target (7 days).",
    "erkannt": "detected",
    "nicht im Register": "not in registry",
    "Firmware": "Firmware",
    "läuft": "running",
    "Pumpen ({n} erkannt)": "Pumps ({n} detected)",
    "Modell und Stufe je Pumpe unten im Inventar ergänzen – der Katalog füllt Datenblattwerte vor.": "Add model and stage per pump in the inventory below – the catalogue pre-fills datasheet values.",
    "Thermostate und Räume": "Thermostats and rooms",
    "Batterie": "Battery",
    "Aufheizen 2 K": "Heat-up 2 K",
    "Aus dem Geräteregister und aus Raumklima. Nichts davon muss von Hand eingetragen werden.": "From the device registry and Raumklima. None of it needs manual entry.",
    "Übersicht": "Overview",
    "Betrieb": "Operation",
    "Änderungen": "Changes",
    "Geräte": "Devices",
    "System": "System",
    "Hat eine Einstellung etwas gebracht? Wetter ist herausgerechnet.": "Did a setting change help? Weather is factored out.",
    "Was ist eingebaut – und fehlt etwas, das eine Auswertung braucht?": "What is installed – and is anything missing that an analysis needs?",
    "Liefern alle Quellen, und was ist passiert?": "Are all sources delivering, and what happened?",
    "Strom Heizen": "Power heating",
    "Strom Warmwasser": "Power hot water",
    "Wärme kostet": "Heat costs",
    "Strompreis ÷ COP": "power price ÷ COP",
    "Wasser": "Water",
    "{m} m³ · heute {d} m³": "{m} m³ · today {d} m³",
    "Preis jetzt {p} €/kWh": "price now {p} €/kWh",
    "Kosten diesen Monat": "Costs this month",
    "Stunde für Stunde mit dem Preis aus deinem Energie-Dashboard gerechnet.": "Calculated hour by hour with the price from your energy dashboard.",
    "lädt": "charging",
    "lädt nicht": "not charging",
    "Warmwasserspeicher": "Hot water tank",
    "Ist / Soll": "Actual / target",
    "Ladungen / Tag": "Charges / day",
    "Ladedauer": "Charging time",
    "Abkühlung": "Cooling",
    "Ventil {v} %": "Valve {v} %",
    "Hinter dem Puffer: Laufen ohne Verdichter ist normal.": "Behind the buffer: running without the compressor is normal.",
    "Pumpe läuft": "Pump running",
    "Vorlauf Ist / Soll": "Flow actual / target",
    "Median 7 Tage {m} K": "Median 7 days {m} K",
    "Warmwasserbetrieb": "Hot water mode",
    "Speicher Ist": "Tank actual",
    "Speicher Soll": "Tank target",
    "Warmwasser-Ladepumpe": "Hot water charging pump",
    "WP-Rücklauf": "HP return",
    "Warmwasser-Strom": "Hot water power",
    "Leistung jetzt": "Power now",
    "Volumenstrom": "Volume flow",
    "WP-Vorlauf": "HP flow",
    "Laufzeit (2. Zähler)": "Run time (2nd counter)",
    "Median {m} K über Puffer-Soll": "Median {m} K above buffer target",
    "WP-Vorlauf − Puffer-Soll": "HP flow − buffer target",
    "Puffer-Ladung": "Buffer charging",
    "Median {m} K · Ziel {a}–{b} K": "Median {m} K · target {a}–{b} K",
    "WP-Vorlauf − WP-Rücklauf, nur Laufstunden": "HP flow − HP return, running hours only",
    "Spreizung im Lauf (7 Tage): Median {m} K, {n} Stunden": "Spread while running (7 days): median {m} K, {n} hours",
    "COP jetzt": "COP now",
    "Wärmeleistung": "Heat output",
    "Verdichter aus": "Compressor off",
    "Verdichter läuft": "Compressor running",
    "Jetzt": "Now",
    "inkl. Warmwasser {v}": "incl. hot water {v}",
    "aus Verlauf": "from history",
    "Mischer": "Mixer",
    "kein Sensor": "no sensor",
    "noch keine Daten": "no data yet",
    "kein Sensor zugeordnet": "no sensor mapped",
    "Ohne Bewertung:": "Not assessed:",
    "{a} von {n} Prüfungen aktiv": "{a} of {n} checks active",
    "Eingeschränkt": "Limited",
    "Anlage": "System",
    "Effizienz": "Efficiency",
    "Räume & Kreise": "Rooms & circuits",
    "Vorher / Nachher": "Before / after",
    "Inventar": "Inventory",
    "Heizungsanalyse": "Heating analysis",
    "Anlagen-Check": "System check",
    "Sehr gut": "Very good",
    "Gut": "Good",
    "Beobachten": "Watch",
    "Handlungsbedarf": "Action needed",
    "Lernt noch": "Still learning",
    "{w} Warnung · {i} Hinweise": "{w} warning · {i} notes",
    "Datenbasis {d} Tage": "Data basis {d} days",
    "COP 7 Tage": "COP 7 days",
    "30 T: {v}": "30 d: {v}",
    "Starts / Tag": "Starts / day",
    "Schwelle {v}": "threshold {v}",
    "Laufzeit / Zyklus": "Run time / cycle",
    "Vorlauf Ist − Soll": "Flow actual − target",
    "Median über 7 Tage": "median over 7 days",
    "keine Daten": "no data",
    "im grünen Bereich": "in the green",
    "über der Schwelle": "above threshold",
    "unter der Schwelle": "below threshold",
    "zu warm": "too warm",
    "zu kalt": "too cold",
    "passt": "fine",
    "steigend": "rising",
    "fallend": "falling",
    "stabil": "stable",
    "Hinweise mit Beleg": "Findings with evidence",
    "Keine Hinweise – keine Regel hat angeschlagen. Das heißt nicht, dass alles optimal ist.": "No findings – no rule fired. That does not mean everything is optimal.",
    "Empfehlung": "Recommendation",
    "Beleg": "Evidence",
    "Warnung": "Warning",
    "COP-Kennlinie": "COP curve",
    "Tages-COP gegen Außentemperatur": "Daily COP vs outdoor temperature",
    "Trend": "Trend",
    "heute": "today",
    "Energie": "Energy",
    "Wärme": "Heat",
    "Strom": "Power",
    "Warmwasser": "Hot water",
    "COP-Verlauf": "COP history",
    "Außentemperatur": "Outdoor temperature",
    "Heizkurve": "Heating curve",
    "Vorlauf": "Flow",
    "Soll-Vorlauf": "Target flow",
    "Takten": "Cycling",
    "Starts pro Tag nach Außentemperatur": "Starts per day by outdoor temperature",
    "Laufzeit je Zyklus": "Run time per cycle",
    "Abtauen & Heizstab": "Defrost & aux heater",
    "Abtauen": "Defrost",
    "Heizstab": "Aux heater",
    "h/Tag": "h/day",
    "min": "min",
    "Tage": "days",
    "Räume": "Rooms",
    "Abweichung zum Soll": "Deviation from target",
    "Median": "Median",
    "Aufheizzeit": "Heat-up time",
    "zu kalt {p} %": "too cold {p} %",
    "zu warm {p} %": "too warm {p} %",
    "ohne Ventilwert": "no valve value",
    "noch keine Stichproben": "no samples yet",
    "Heizkreise": "Heating circuits",
    "Pumpe ohne Verdichter": "Pump without compressor",
    "Mischer-Impulse": "Mixer pulses",
    "/Tag": "/day",
    "keine Pumpe zugeordnet": "no pump assigned",
    "kein Mischer zugeordnet": "no mixer assigned",
    "Änderungen und ihre Wirkung": "Changes and their effect",
    "Noch keine Änderung eingetragen. Trag z. B. „Heizkurve 0,6 → 0,5“ ein – nach ein paar Tagen siehst du hier, was es gebracht hat.": "No change logged yet. Log e.g. “heating curve 0.6 → 0.5” – after a few days you will see its effect here.",
    "Änderung eintragen": "Log a change",
    "Was": "What",
    "Einstellung": "Setting",
    "Alt": "Old",
    "Neu": "New",
    "Notiz": "Note",
    "Speichern": "Save",
    "Abbrechen": "Cancel",
    "Gespeichert": "Saved",
    "vorher": "before",
    "nachher": "after",
    "wetterbereinigt": "weather-adjusted",
    "Ø außen": "Ø outdoor",
    "noch zu wenig Tage danach": "not enough days after yet",
    "Pumpen": "Pumps",
    "Thermostate": "Thermostats",
    "Hydraulik": "Hydraulics",
    "Noch nichts eingetragen.": "Nothing entered yet.",
    "Datenquellen": "Data sources",
    "verbunden": "connected",
    "fehlt": "missing",
    "Was fehlt?": "What is missing?",
    "Bericht herunterladen": "Download report",
    "Version {v}": "Version {v}",
    "Aktualisiert {t}": "Updated {t}",
    "Die Heizungsanalyse ist noch nicht eingerichtet.": "Heating analysis is not set up yet.",
    "Lade …": "Loading …",
    "Fehler: {e}": "Error: {e}",
    "30 Tage": "30 days",
    "90 Tage": "90 days",
    "1 Jahr": "1 year",
    "Hersteller": "Vendor",
    "Modell aus Katalog": "Model from catalog",
    "eigene Anlage": "own system",
    "kWh": "kWh",
    "Wochentag": "Weekday",
    "Spreizung": "Spread",
    "Kennzahl": "Metric",
    "Strom (kWh)": "Power (kWh)",
    "Wärme (kWh)": "Heat (kWh)",
    "Starts/Tag": "Starts/day",
    "Zyklus (min)": "Cycle (min)",
    "Änderung": "Change",
    "Dashboard automatisch angelegt": "Dashboard created automatically",
    "Heizkurve und Vorlauf-Abweichung": "Heating curve and flow deviation",
    "Taktanalyse": "Cycling analysis",
    "Abtauanalyse": "Defrost analysis",
    "Heizstab-Auswertung": "Aux heater analysis",
    "Warmwasseranteil": "Hot-water share",
    "Spreizung Vor-/Rücklauf": "Flow/return spread",
    "Quelle {s}": "Source {s}",
    "Ersatzquelle": "fallback source",
    "Diese Auswertungen brauchen noch einen Sensor:": "These analyses still need a sensor:",
    "Ein Sensor lässt sich unter Einstellungen → Geräte & Dienste → Heizungsanalyse → Konfigurieren ergänzen.": "Add a sensor under Settings → Devices & services → Heating analysis → Configure.",
    "Anteil Warmwasser an der Wärme": "Hot-water share of heat",
    "Vorlauf zu warm → Kurve prüfen": "flow too warm → check curve",
    "Vorlauf zu kalt": "flow too cold",
    "taktet": "cycles",
    "über Kennlinie": "above curve",
    "unter Kennlinie": "below curve",
    "auf Kennlinie": "on curve",
    "Kennlinie": "Curve",
    "Beispiel": "Example",
    "{n} Stichproben": "{n} samples",
    "Pumpe": "Pump",
    "Thermostat": "Thermostat",
    "Verdichter": "Compressor",
    "Rücklauf": "Return",
    "Puffer": "Buffer",
    "Strom (Ersatz)": "Power (fallback)",
    "Starts": "Starts",
    "Laufzeit": "Run time",
    "Protokoll": "Log",
    "Systemstatus": "System status",
    "Backend": "Backend",
    "Karte": "Card",
    "Version weicht ab": "Version mismatch",
    "Letzter Lauf": "Last run",
    "Nächster Lauf": "Next run",
    "Letzter Fehler": "Last error",
    "keiner": "none",
    "Tage mit Daten": "Days with data",
    "Speicherstand": "Storage",
    "Roll-ups": "roll-ups",
    "Protokollzeilen": "log lines",
    "ms": "ms",
    "Lauf": "run",
    "Quellen-Check": "Source check",
    "Quelle": "Source",
    "Status": "Status",
    "Einheit": "Unit",
    "Zeilen 7/31": "Rows 7/31",
    "Letzter Wert": "Last value",
    "keine Statistik": "no statistics",
    "unpassend": "mismatched",
    "nicht verfügbar": "unavailable",
    "nicht gefunden": "not found",
    "Format": "Format",
    "Keine Quellen zugeordnet.": "No sources mapped.",
    "Alle": "All",
    "Details": "Details",
    "Einträge": "entries",
    "Neustart": "Restart",
    "Suchen": "Search",
    "24 Stunden": "24 hours",
    "7 Tage": "7 days",
    "Keine Einträge für diesen Filter.": "No entries for this filter.",
    "Diagnose herunterladen": "Download diagnostics",
    "Protokoll kopieren": "Copy log",
    "Jetzt neu berechnen": "Recalculate now",
    "Diagnose heruntergeladen": "Diagnostics downloaded",
    "Kopiert": "Copied",
    "Keine Einträge": "No entries",
    "Neu berechnet": "Recalculated",
    "Diagnose nicht verfügbar – Protokoll wird trotzdem angezeigt.": "Diagnostics unavailable – the log is still shown.",
    "Entity existiert nicht mehr. Unter Konfigurieren eine andere Quelle wählen.": "Entity no longer exists. Pick another source under Configure.",
    "Quelle ist nicht verfügbar. Gerät prüfen; die Auswertung pausiert, bis sie wieder liefert.": "Source is unavailable. Check the device; analysis pauses until it delivers again.",
    "Keine Langzeitstatistik. Recorder und state_class prüfen; ohne Statistik rechnet die Integration nicht.": "No long-term statistics. Check recorder and state_class; without statistics the integration does not calculate.",
    "Einheit passt nicht zur Quelle. Sensor mit passender Einheit wählen.": "Unit does not match the source. Choose a sensor with a matching unit.",
    "state_class passt nicht. Bei Zählern total oder total_increasing verwenden.": "state_class does not match. For meters use total or total_increasing.",
    "Format der Statistikzeilen unerwartet. Recorder-Version prüfen.": "Unexpected statistics row format. Check the recorder version.",
    "Start": "Start",
    "Auswertung": "Analysis",
    "Hinweis": "Finding",
    "Konfiguration": "Configuration",
    "Dashboard": "Dashboard",
    "Fehler": "Error",
    "Info": "Info",
    "Quellen": "Sources",
    "Pflicht": "Mandatory",
    "Optional": "Optional",
    "keine": "none",
    "Schwellen": "Thresholds",
    "JSON-Fehler: {e}": "JSON error: {e}",
    "Wärmepumpe": "Heat pump",
    "Puffer-Soll Vorlauf": "Buffer target flow",
    "keine Räume": "no rooms",
    "Keine Heizkreise.": "No heating circuits.",
    "Werte: Ist / Soll °C, Abweichung zum Soll.": "Values: actual / target °C, deviation from target.",
    "Keine Hinweise": "No findings",
    "Außen": "Outdoor",
    "Geschätzter COP-Gewinn": "Estimated COP gain",
    "Konfidenz": "Confidence",
    "Manuelle Anpassung": "Manual adjustment",
    "Median-Abweichung": "Median deviation",
    "Noch keine Daten für einen Vorschlag.": "Not enough data for a suggestion yet.",
    "Offset (K)": "Offset (K)",
    "Steigung": "Slope",
    "Stunden": "Hours",
    "Vorschlag Offset": "Suggested offset",
    "hoch": "high",
    "mittel": "medium",
    "niedrig": "low",
    "Bereich": "Section",
    "Eintrag hinzufügen": "Add entry",
    "Heizkörper": "Radiators",
    "Objekt": "Object",
    "Objekt fehlt": "Object missing",
    "Werte (JSON)": "Values (JSON)",
    "{n} eingetragene Änderungen – Wirkung ab drei Tagen danach.": "{n} changes recorded – effect after three days.",
    "{s} bearbeiten": "Edit {s}",
    "{s} ergänzen": "Add {s}",
    "Grund (optional)": "Reason (optional)",
    "z. B. Voreinstellung geändert": "e.g. preset changed",
    "Heizkreis": "Heating circuit",
    "Raum": "Room",
    "Bearbeiten": "Edit",
    "Löschen": "Delete",
    "Inventar zu {p} % vollständig · {n} Einträge": "Inventory {p}% complete · {n} entries",
    "Aus Räumen übernehmen": "Fill from rooms",
    "Legt Thermostat und Heizkörper je Raum an, ohne Werte zu erfinden.": "Creates one thermostat and radiator per room without inventing values.",
    "CSV Import und Export": "CSV import and export",
    "Format: object,field,value – eine Zeile je Wert.": "Format: object,field,value – one line per value.",
    "CSV herunterladen": "Download CSV",
    "CSV übernehmen": "Apply CSV",
    "Bestehende Werte werden ergänzt.": "Existing values are completed.",
    "Gespeichert. Vergleiche die Wirkung nach frühestens 14 Tagen.": "Saved. Compare the effect after at least 14 days.",
    "Jetzt zum Vergleich": "Go to comparison",
    "Neuer Heizkreis": "New heating circuit",
    "Entfernen": "Remove",
    "Name": "Name",
    "Typ": "Type",
    "Vorlauftemperatur": "Flow temperature",
    "Mischer auf": "Mixer open",
    "Mischer zu": "Mixer close",
    "Noch kein Heizkreis.": "No heating circuit yet.",
    "Heizkreis hinzufügen": "Add heating circuit",
    "Neuer Raum": "New room",
    "Raumtyp": "Room type",
    "Klima-Entity": "Climate entity",
    "Ventilposition": "Valve position",
    "Noch kein Raum.": "No room yet.",
    "Raum hinzufügen": "Add room",
    "Auf Standard zurücksetzen": "Reset to defaults",
    "Pflichtquellen: {a} von {b} verbunden": "Required sources: {a} of {b} connected",
    "{n} Felder brauchen Aufmerksamkeit.": "{n} fields need attention.",
    "Schwellen und Grenzwerte": "Thresholds and limits",
    "Offset": "Offset",
    "Speichern lädt die Integration neu.": "Saving reloads the integration.",
    "{n} Felder prüfen.": "Check {n} fields.",
    "Objekt wirklich löschen?": "Delete this item?",
    "Gelöscht": "Deleted",
    "Bitte die markierten Felder prüfen.": "Please check the marked fields.",
    "Aus Räumen übernommen": "Filled from rooms",
    "{n} Einträge aus Räumen angelegt": "{n} entries created from rooms",
    "CSV heruntergeladen": "CSV downloaded",
    "Bitte CSV einfügen.": "Please paste CSV first.",
    "{n} übernommen, {e} Zeilen übersprungen": "{n} imported, {e} lines skipped",
    "{n} übernommen": "{n} imported",
    "Pflichtfeld": "Required field",
    "Entity nicht gefunden": "Entity not found",
    "Einheit passt nicht": "Unit does not match",
    "Bitte eine Zahl eintragen": "Please enter a number",
    "Wert außerhalb des Bereichs": "Value out of range",
    "Bitte aus der Liste wählen": "Please choose from the list",
    "Verweis nicht gefunden": "Reference not found",
    "Feld ist unbekannt": "Unknown field",
    "Text ist zu lang": "Text is too long",
    "Bereich ist unbekannt": "Unknown section",
    "Wert prüfen": "Check value",
    "Bezeichner ist doppelt": "Identifier is duplicated",
    "Aufbau ist ungültig": "Structure is invalid",
    "Alles in Ordnung": "All good",
    "{w} Warnungen · {i} Hinweise": "{w} warnings · {i} notes",
    "COP {v} in den letzten 7 Tagen": "COP {v} over the last 7 days",
    "Noch keine Daten für die Effizienz.": "No efficiency data yet.",
    "{n} Räume · {k} außerhalb der Toleranz": "{n} rooms · {k} outside tolerance",
    "{n} Ereignisse in den letzten 48 Stunden": "{n} events in the last 48 hours",
    "{c} Heizkreise · {r} Räume": "{c} heating circuits · {r} rooms",
    "Für alle Räume Thermostat und Heizkörper anlegen?": "Create a thermostat and radiator for every room?"
  };
  var lang = "de";
  function setLang(hass) {
    const raw = hass && (hass.locale?.language || hass.language) || "de";
    lang = String(raw).toLowerCase().startsWith("de") ? "de" : "en";
    return lang;
  }
  var getLang = () => lang;
  function t(key, params = {}) {
    const base = lang === "de" ? key : EN[key] ?? key;
    return base.replace(/\{(\w+)\}/g, (m, k) => params[k] ?? m);
  }

  // src/logic.js
  function fmt(value, digits = 1) {
    if (value == null || Number.isNaN(Number(value))) return "–";
    return Number(value).toLocaleString(getLang() === "de" ? "de-DE" : "en-GB", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }
  function signed(value, digits = 1) {
    if (value == null) return "–";
    return (value > 0 ? "+" : value < 0 ? "−" : "±") + fmt(Math.abs(value), digits);
  }
  function esc(v) {
    return String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }
  function dayLabel(iso) {
    if (!iso) return "";
    const [, m, d] = iso.split("-");
    return `${Number(d)}.${Number(m)}.`;
  }
  function linearFit(points) {
    const pts = points.filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y));
    if (pts.length < 3) return null;
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p.x, 0) / n;
    const my = pts.reduce((s, p) => s + p.y, 0) / n;
    let sxx = 0;
    let sxy = 0;
    for (const p of pts) {
      sxx += (p.x - mx) ** 2;
      sxy += (p.x - mx) * (p.y - my);
    }
    if (sxx < 1e-9) return null;
    const b = sxy / sxx;
    const res = pts.map((p) => p.y - (my - b * mx + b * p.x));
    const sigma = Math.sqrt(res.reduce((acc, r) => acc + r * r, 0) / Math.max(1, n - 2));
    return { a: my - b * mx, b, n, sigma, at: (x) => my - b * mx + b * x };
  }
  function binByOutdoor(rows, key, width = 2) {
    const groups = /* @__PURE__ */ new Map();
    for (const r of rows) {
      if (r.outdoor == null || r[key] == null) continue;
      const lo = Math.floor(r.outdoor / width) * width;
      const g = groups.get(lo) || { lower: lo, upper: lo + width, sum: 0, n: 0 };
      g.sum += r[key];
      g.n += 1;
      groups.set(lo, g);
    }
    return [...groups.values()].sort((a, b) => a.lower - b.lower).map((g) => ({ ...g, mean: g.sum / g.n }));
  }
  function weatherAdjusted(before, after, fit) {
    if (!before || !after || before.cop == null || after.cop == null) return null;
    const raw = after.cop - before.cop;
    if (!fit || before.outdoor == null || after.outdoor == null) return { raw, adjusted: null };
    const expected = fit.b * (after.outdoor - before.outdoor);
    return { raw, adjusted: raw - expected };
  }
  function rangeRows(series, days) {
    return days ? series.slice(-days) : series;
  }
  function niceScale(min, max, ticks = 4) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, step: 0.25, ticks: [0, 0.25, 0.5, 0.75, 1] };
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const raw = (max - min) / ticks;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const out = [];
    for (let v = lo; v <= hi + step / 2; v += step) out.push(Number(v.toFixed(6)));
    return { min: lo, max: hi, step, ticks: out };
  }

  // src/styles.js
  var STYLES = `
:host { display:block;
  --hz-ink: var(--primary-text-color, #121826);
  --hz-mut: var(--secondary-text-color, #6b7385);
  --hz-line: var(--divider-color, #e6e9f0);
  --hz-card: var(--ha-card-background, var(--card-background-color, #fff));
  --hz-soft: color-mix(in srgb, var(--hz-ink) 4%, transparent);
  --hz-heat: #ff7a45; --hz-ok: #2ec4a6; --hz-warn: #ffb020; --hz-bad: #ff4d6d; --hz-cool: #4f9dff; --hz-vio: #8b7cf6;
  --hz-radius: 24px; --hz-radius-sm: 14px; --hz-shadow: 0 4px 16px rgba(16,24,40,.06); --hz-shadow-lg: 0 8px 32px rgba(16,24,40,.10);
  --hz-gap: 18px;
  --hz-space-1: 4px; --hz-space-2: 6px; --hz-space-3: 8px; --hz-space-4: 12px; --hz-space-5: 16px; --hz-space-6: 18px; --hz-space-7: 24px;
  --hz-text-xs: .72rem; --hz-text-sm: .82rem; --hz-text-md: .9rem; --hz-text-lg: 1.1rem; --hz-text-xl: 1.35rem;
  font-family: var(--ha-font-family-body, Inter, system-ui, sans-serif); color: var(--hz-ink);
}
* { box-sizing: border-box; }
.wrap { display:grid; gap:16px; padding:16px; max-width:1500px; margin:0 auto; }
.head { display:flex; flex-wrap:wrap; align-items:center; gap:10px 14px; }
.head h1 { font-size:1.35rem; margin:0; font-weight:750; letter-spacing:-.01em; }
.head .meta { margin-left:auto; color:var(--hz-mut); font-size:.78rem; display:flex; align-items:center; gap:6px; }
.dot { width:8px; height:8px; border-radius:50%; background:var(--hz-ok); }
.dot.off { background:var(--hz-bad); }
.grid { display:grid; gap:var(--hz-gap); }
.g2 { grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); }
.g3 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.hero { grid-template-columns: minmax(280px, 330px) 1fr; }
.hero2 { display:grid; grid-template-columns: auto 1fr; gap:20px; align-items:center; background:linear-gradient(135deg, color-mix(in srgb, var(--hz-heat) 8%, var(--hz-card)), var(--hz-card)); border:1px solid var(--hz-line); border-radius:var(--hz-radius); padding:20px 24px; box-shadow:var(--hz-shadow); }
.hero2 .score-ring { width:96px; height:96px; flex:none; }
.hero2 .score-val { font-size:2rem; font-weight:800; line-height:1; }
.hero2 .glance { display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:12px; }
.hero2 .gl { background:var(--hz-soft); border-radius:var(--hz-radius-sm); padding:10px 12px; }
.hero2 .gl .lbl { font-size:.7rem; color:var(--hz-mut); font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
.hero2 .gl .num { font-size:1.4rem; font-weight:800; margin-top:2px; font-variant-numeric:tabular-nums; }
.hero2 .gl .sub { font-size:.72rem; color:var(--hz-mut); margin-top:2px; }
.kpis { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:var(--hz-gap); }
@media (max-width: 520px) { .kpis { grid-template-columns: 1fr 1fr; gap:10px; } .kpis .big { font-size:1.6rem; } }
@media (max-width: 760px) { .hero { grid-template-columns: 1fr; } .hero2 { grid-template-columns: 1fr; } .g2, .g3 { grid-template-columns: 1fr; } .wrap { padding:10px; gap:12px; } .alert { padding:12px 14px; } }
.c { background:var(--hz-card); border:1px solid var(--hz-line); border-radius:var(--hz-radius); padding:20px 22px; min-width:0;
  box-shadow: var(--hz-shadow); transition: box-shadow .2s ease, transform .2s ease; }
.c:hover { box-shadow: var(--hz-shadow-lg); }
.h { display:flex; align-items:center; gap:10px; font-size:.78rem; font-weight:700; color:var(--hz-mut); text-transform:uppercase; letter-spacing:.08em; }
.h .sub { text-transform:none; letter-spacing:0; font-weight:500; }
.q { margin-left:auto; width:20px; height:20px; border-radius:50%; border:1.5px solid var(--hz-line); color:var(--hz-mut); font-size:.7rem;
  display:grid; place-items:center; font-weight:800; cursor:pointer; background:none; padding:0; flex:none; }
.q:hover, .q.on { border-color:var(--hz-heat); color:var(--hz-heat); }
.help { margin:10px 0 2px; padding:10px 12px; border-radius:12px; background:var(--hz-soft); font-size:.84rem; line-height:1.5; color:var(--hz-ink); }
.big { font-size:2.2rem; font-weight:800; letter-spacing:-.03em; margin-top:6px; line-height:1; font-variant-numeric:tabular-nums; }
.big small { font-size:.9rem; color:var(--hz-mut); font-weight:600; margin-left:4px; }
.muted { color:var(--hz-mut); font-size:.82rem; }
.pill { display:inline-flex; align-items:center; gap:6px; font-size:.74rem; font-weight:700; padding:4px 9px; border-radius:999px; white-space:nowrap; }
.tone-ok.pill { background:color-mix(in srgb, var(--hz-ok) 15%, transparent); color:color-mix(in srgb, var(--hz-ok) 75%, var(--hz-ink)); }
.tone-warn.pill { background:color-mix(in srgb, var(--hz-warn) 18%, transparent); color:color-mix(in srgb, var(--hz-warn) 70%, var(--hz-ink)); }
.tone-bad.pill { background:color-mix(in srgb, var(--hz-bad) 15%, transparent); color:color-mix(in srgb, var(--hz-bad) 80%, var(--hz-ink)); }
.tone-mut.pill { background:var(--hz-soft); color:var(--hz-mut); }
.tone-cool.pill { background:color-mix(in srgb, var(--hz-cool) 14%, transparent); color:color-mix(in srgb, var(--hz-cool) 80%, var(--hz-ink)); }
.score { display:flex; gap:18px; align-items:center; margin-top:8px; }
.ring { width:118px; height:118px; flex:none; }
.ringbg { fill:none; stroke:var(--hz-soft); stroke-width:12; }
.ringfg { fill:none; stroke-width:12; stroke-linecap:round; transition: stroke-dasharray .6s ease; }
.ringfg.tone-ok { stroke:var(--hz-ok); } .ringfg.tone-warn { stroke:var(--hz-warn); } .ringfg.tone-bad { stroke:var(--hz-bad); } .ringfg.tone-mut { stroke:var(--hz-mut); }
.ringv { font-size:30px; font-weight:800; fill:var(--hz-ink); }
.lvl { font-weight:800; font-size:1.25rem; }
.spark { width:100%; height:40px; display:block; margin:8px 0 4px; }
.cbox { width:100%; min-width:0; }
.lvgrid { display:grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap:10px; margin-top:10px; }
.lv { background:var(--hz-soft); border-radius:12px; padding:10px 12px; }
.lv .big { font-size:1.5rem; margin-top:2px; }
.chart { width:100%; height:auto; display:block; margin-top:8px; }
.chart text { font-size:11px; fill:var(--hz-mut); font-family:inherit; }
.chart .unit { font-weight:700; }
.chart .val { fill:var(--hz-ink); font-weight:700; }
.chart .grid { stroke:var(--hz-line); stroke-width:1; }
.chart .ref { stroke:var(--hz-bad); stroke-dasharray:5 4; stroke-width:1.4; }
.chart .mark { stroke:var(--hz-vio); stroke-width:1.5; stroke-dasharray:3 3; }
.chart .markdot { fill:var(--hz-vio); }
.chart .hl { stroke:var(--hz-ink); stroke-width:2; }
.chart .hlt { fill:var(--hz-ink); font-weight:700; font-size:12px; }
.legend { display:flex; flex-wrap:wrap; gap:6px 14px; font-size:.78rem; color:var(--hz-mut); margin-top:6px; }
.legend i { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:5px; vertical-align:-1px; }
.legend i.sw-ok { background:var(--hz-ok); } .legend i.sw-heat { background:var(--hz-heat); } .legend i.sw-cool { background:var(--hz-cool); }
.legend i.sw-vio { background:var(--hz-vio); } .legend i.sw-bad { background:var(--hz-bad); } .legend i.sw-warn { background:var(--hz-warn); }
.alert { display:flex; gap:14px; padding:16px 18px; border-radius:var(--hz-radius-sm); border:1px solid var(--hz-line); background:var(--hz-card); margin-bottom:10px; position:relative; overflow:hidden; }
.alert::before { content:""; position:absolute; left:0; top:0; bottom:0; width:5px; }
.alert.warning::before { background:var(--hz-bad); }
.alert.info::before { background:var(--hz-cool); }
.alert .abody { flex:1; min-width:0; }
.alert .atitle { font-weight:700; font-size:.95rem; display:flex; align-items:center; gap:8px; }
.alert .atitle .aid { color:var(--hz-mut); font-weight:600; font-size:.8rem; }
.alert .adesc { font-size:.85rem; color:var(--hz-mut); margin-top:4px; line-height:1.5; }
.alert .aev { display:inline-flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.alert .aev span { font-size:.72rem; color:var(--hz-mut); background:var(--hz-soft); border-radius:6px; padding:3px 8px; }
.alert .asug { font-size:.84rem; margin-top:8px; line-height:1.5; }
.alert .asug b { color:var(--hz-ink); }
.find { display:flex; gap:12px; padding:12px 0; border-top:1px solid var(--hz-line); }
.find:first-of-type { border-top:0; }
.sev { width:5px; border-radius:4px; flex:none; }
.sev.warning { background:var(--hz-bad); } .sev.info { background:var(--hz-cool); }
.ft { font-weight:700; font-size:.95rem; }
.ft .id { color:var(--hz-mut); font-weight:600; margin-right:6px; }
.fd { font-size:.85rem; color:var(--hz-mut); margin-top:3px; line-height:1.45; }
.fs { font-size:.85rem; margin-top:6px; line-height:1.45; }
.ev { display:inline-flex; flex-wrap:wrap; gap:6px; margin-top:7px; }
.ev span { font-size:.74rem; color:var(--hz-mut); background:var(--hz-soft); border-radius:7px; padding:3px 7px; }
.empty { color:var(--hz-mut); font-size:.88rem; padding:10px 0; line-height:1.5; }
.seg { display:inline-flex; background:var(--hz-soft); border-radius:999px; padding:3px; gap:2px; }
.seg button { border:0; background:none; color:var(--hz-mut); font:inherit; font-size:.76rem; font-weight:700; padding:5px 11px; border-radius:999px; cursor:pointer; }
.seg button.on { background:var(--hz-card); color:var(--hz-ink); box-shadow:0 1px 3px rgba(0,0,0,.12); }
.room { display:grid; grid-template-columns: minmax(110px, 1.2fr) 2fr 64px; gap:10px; align-items:center; padding:9px 0; border-top:1px solid var(--hz-line); font-size:.88rem; }
.room:first-of-type { border-top:0; }
.room .nm { font-weight:650; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.room .nm small { display:block; font-weight:500; color:var(--hz-mut); font-size:.74rem; }
.room b { text-align:right; font-variant-numeric:tabular-nums; }
.dev { position:relative; height:12px; border-radius:7px; background:var(--hz-soft); }
.dev .mid { position:absolute; left:50%; top:-3px; bottom:-3px; width:1.5px; background:var(--hz-line); }
.dev .tol { position:absolute; top:0; bottom:0; background:color-mix(in srgb, var(--hz-ok) 12%, transparent); }
.dev i { position:absolute; top:0; bottom:0; border-radius:7px; }
.dev .p90 { position:absolute; top:3px; bottom:3px; width:2px; background:var(--hz-ink); opacity:.45; }
.room .extra { grid-column: 1 / -1; display:flex; flex-wrap:wrap; gap:6px; margin-top:-2px; }
.cblock { padding:14px 0; border-top:1px solid var(--hz-line); }
.cblock:first-of-type { border-top:0; }
.ct { font-weight:700; margin-bottom:8px; }
.circ { display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:14px; }
.meter { height:10px; border-radius:6px; background:var(--hz-soft); overflow:hidden; margin-top:6px; }
.meter i { display:block; height:100%; border-radius:6px; }
.chg { display:grid; grid-template-columns: 14px 1fr; gap:12px; padding:12px 0; border-top:1px solid var(--hz-line); }
.chg:first-of-type { border-top:0; }
.chg .d { width:12px; height:12px; border-radius:50%; background:var(--hz-vio); margin-top:4px; }
.chg .t { font-weight:700; }
.cmp { display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:8px; margin-top:8px; }
.cmp div { background:var(--hz-soft); border-radius:10px; padding:8px 10px; font-size:.78rem; color:var(--hz-mut); }
.cmp b { display:block; color:var(--hz-ink); font-size:.95rem; margin-top:2px; }
form.log { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; margin-top:12px; }
form.log label { display:grid; gap:4px; font-size:.75rem; color:var(--hz-mut); font-weight:600; }
form.log input { font:inherit; font-size:.9rem; padding:8px 10px; border-radius:10px; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-ink); }
.btn { font:inherit; font-size:.82rem; font-weight:700; border:0; border-radius:999px; padding:8px 14px; cursor:pointer;
  background:color-mix(in srgb, var(--hz-heat) 14%, transparent); color:color-mix(in srgb, var(--hz-heat) 80%, var(--hz-ink)); }
.btn.primary { background:var(--hz-heat); color:#fff; }
.btn.ghost { background:var(--hz-soft); color:var(--hz-ink); }
.row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
table { width:100%; border-collapse:collapse; font-size:.85rem; margin-top:8px; }
th { text-align:left; color:var(--hz-mut); font-weight:600; font-size:.74rem; padding:6px 8px; border-bottom:1px solid var(--hz-line); }
td { padding:7px 8px; border-bottom:1px solid var(--hz-line); vertical-align:top; }
.src { display:flex; justify-content:space-between; gap:10px; padding:7px 0; border-top:1px solid var(--hz-line); font-size:.86rem; }
.src:first-of-type { border-top:0; }
.filters { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:10px; }
.chip { font:inherit; font-size:.74rem; font-weight:700; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-mut);
  border-radius:999px; padding:4px 10px; cursor:pointer; }
.chip.on { background:var(--hz-soft); color:var(--hz-ink); border-color:transparent; }
.search { margin-left:auto; font:inherit; font-size:.82rem; padding:6px 10px; border-radius:999px; border:1px solid var(--hz-line);
  background:var(--hz-card); color:var(--hz-ink); min-width:150px; }
table.kv { margin-top:6px; }
table.kv th { border-bottom:0; width:38%; color:var(--hz-mut); font-weight:600; }
table.kv td { border-bottom:1px solid var(--hz-line); }
.day { font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--hz-mut); margin:14px 0 4px; }
.day:first-of-type { margin-top:8px; }
.log { border-top:1px solid var(--hz-line); }
.log:first-of-type { border-top:0; }
.logrow { display:grid; grid-template-columns: 62px auto 92px 1fr; gap:8px; align-items:baseline; width:100%; text-align:left;
  font:inherit; font-size:.82rem; background:none; border:0; padding:7px 0; cursor:pointer; color:var(--hz-ink); }
.logrow .lt { color:var(--hz-mut); font-variant-numeric:tabular-nums; }
.logrow .cat { color:var(--hz-mut); font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; }
.logrow .msg { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.log.open .logrow .msg { white-space:normal; }
.log .details { padding:6px 10px 10px; background:var(--hz-soft); border-radius:10px; margin-bottom:8px; }
.log pre { margin:6px 0 0; font-size:.74rem; white-space:pre-wrap; word-break:break-word; max-height:260px; overflow:auto; }
.restart { display:flex; align-items:center; gap:8px; color:var(--hz-mut); font-size:.74rem; font-weight:700; margin:8px 0 4px; }
.restart::before, .restart::after { content:""; flex:1; height:1px; background:var(--hz-line); }
@media (max-width: 760px) {
  .logrow { grid-template-columns: 54px auto 1fr; }
  .logrow .cat { display:none; }
  .search { width:100%; margin-left:0; }
}

.srcrow { display:grid; grid-template-columns: minmax(180px, 1fr) 2fr; gap:8px; align-items:center; padding:6px 0; border-top:1px solid var(--hz-line); }
.srcrow:first-of-type { border-top:0; }
.srcrow label { font-size:.78rem; color:var(--hz-mut); font-weight:600; word-break:break-all; }
.srcrow input { font:inherit; font-size:.85rem; padding:6px 10px; border-radius:10px; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-ink); }
.cfggroup { margin-top:10px; }
.cfggroup .h { margin-bottom:6px; }
.cfgjson { width:100%; min-height:160px; font-family:ui-monospace,monospace; font-size:.78rem; padding:10px; border-radius:12px; border:1px solid var(--hz-line); background:var(--hz-soft); color:var(--hz-ink); resize:vertical; }


.schema { display:grid; gap:12px; }
.srow { display:flex; justify-content:center; }
.sbox { background:var(--hz-card); border:1px solid var(--hz-line); border-radius:14px; padding:12px 16px; min-width:150px; text-align:center; box-shadow:0 1px 2px rgba(16,24,40,.04); }
.swp { border-color:var(--hz-heat); }
.spuffer { border-color:var(--hz-cool); }
.scirc { border-color:var(--hz-ok); }
.stitle { font-weight:700; font-size:.9rem; }
.sval { font-size:1.1rem; font-weight:800; margin-top:4px; }
.smut { color:var(--hz-mut); font-size:.74rem; margin-top:2px; }
.sarrow { text-align:center; color:var(--hz-mut); font-size:1.4rem; margin:4px 0; }
.sarrowh { text-align:center; color:var(--hz-mut); font-size:1.4rem; margin:0 8px; align-self:center; }
.scircuits { display:flex; flex-wrap:wrap; gap:16px; justify-content:center; }
.scircuit { display:grid; gap:8px; justify-items:center; }
.srooms { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
.sroom { background:var(--hz-soft); border-radius:10px; padding:6px 10px; min-width:90px; text-align:center; font-size:.78rem; }
.sroom .snm { font-weight:700; }
.sroom .sval { font-size:.78rem; font-weight:600; margin-top:2px; }
.sroom .smut { font-size:.7rem; }
.slegend { color:var(--hz-mut); font-size:.78rem; text-align:center; margin-top:8px; }


.nav { display:flex; flex-wrap:wrap; gap:6px; margin:4px 0 8px; }
.navpill { font:inherit; font-size:.78rem; font-weight:700; border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-mut); border-radius:999px; padding:6px 12px; cursor:pointer; transition: all .15s ease; }
.navpill:hover { border-color:var(--hz-heat); color:var(--hz-heat); }
.navpill.on { background:color-mix(in srgb, var(--hz-heat) 14%, transparent); border-color:transparent; color:color-mix(in srgb, var(--hz-heat) 80%, var(--hz-ink)); }
.skeleton .sk { background:linear-gradient(90deg, var(--hz-soft) 25%, color-mix(in srgb, var(--hz-ink) 6%, transparent) 50%, var(--hz-soft) 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:8px; height:14px; margin-bottom:10px; }
.skeleton .sk-title { height:24px; width:40%; }
.skeleton .sk-line { width:90%; }
.skeleton .sk-line.short { width:60%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (max-width: 760px) { .nav { flex-wrap:wrap; gap:5px; } .navpill { padding:5px 9px; font-size:.74rem; } }

.flash { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--hz-ink); color:var(--hz-card); padding:9px 16px; border-radius:999px; font-size:.85rem; font-weight:600; z-index:9; }
.mt6 { margin-top:6px; } .mt8 { margin-top:8px; } .mt10 { margin-top:10px; } .mt12 { margin-top:12px; }
.legend.between { justify-content:space-between; margin:6px 0 2px; }
/* --- 0.7.0: gemeinsame Formular- und Tab-Bausteine ------------------------- */
.intro { display:flex; align-items:center; gap:12px; flex-wrap:wrap; color:var(--hz-mut); font-size:.84rem; }
.intro .progress { flex:1; min-width:160px; }
.progress { height:8px; border-radius:999px; background:var(--hz-soft); overflow:hidden; }
.progress span { display:block; height:100%; border-radius:999px; background:var(--hz-ok); transition:width .3s ease; }
.banner { border-radius:var(--hz-radius-sm); padding:10px 14px; font-size:.85rem; font-weight:600; border:1px solid var(--hz-line); }
.banner.tone-ok { background:color-mix(in srgb, var(--hz-ok) 10%, var(--hz-card)); border-color:color-mix(in srgb, var(--hz-ok) 35%, var(--hz-line)); }
.banner.tone-bad { background:color-mix(in srgb, var(--hz-bad) 10%, var(--hz-card)); border-color:color-mix(in srgb, var(--hz-bad) 35%, var(--hz-line)); }
.row.start { justify-content:flex-start; margin-top:10px; }
.span2 { grid-column:1 / -1; }
.field { display:grid; gap:4px; min-width:0; }
.field > label { font-size:.75rem; color:var(--hz-mut); font-weight:600; }
.field .unit { font-weight:500; opacity:.8; }
.field .req { color:var(--hz-bad); }
.field input, .field select, .field textarea, textarea[data-inv-csv] {
  font:inherit; font-size:.9rem; padding:9px 11px; min-height:40px; border-radius:10px;
  border:1px solid var(--hz-line); background:var(--hz-card); color:var(--hz-ink); width:100%;
}
.field input:focus, .field select:focus, .field textarea:focus, textarea[data-inv-csv]:focus {
  outline:2px solid color-mix(in srgb, var(--hz-heat) 45%, transparent); outline-offset:1px;
}
.field.invalid input, .field.invalid select { border-color:var(--hz-bad); }
.ferr { color:color-mix(in srgb, var(--hz-bad) 85%, var(--hz-ink)); font-size:.76rem; font-weight:600; }
.formhead { font-size:.9rem; margin-bottom:2px; }
.arrcard { border:1px solid var(--hz-line); border-radius:var(--hz-radius-sm); padding:12px 14px; margin-top:10px; background:color-mix(in srgb, var(--hz-soft) 40%, var(--hz-card)); }
.arrhead { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }
.detailgrid { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:10px; }
.detail { background:var(--hz-soft); border-radius:10px; padding:8px 10px; display:grid; gap:2px; }
.detail .dl { font-size:.72rem; color:var(--hz-mut); font-weight:700; }
.detail .dv { font-size:.95rem; font-weight:700; font-variant-numeric:tabular-nums; }
.impexp { margin-top:14px; border-top:1px solid var(--hz-line); padding-top:10px; }
.impexp summary { cursor:pointer; font-size:.8rem; font-weight:700; color:var(--hz-mut); }
.impexp textarea { margin:8px 0; font-family:ui-monospace, monospace; font-size:.78rem; min-height:96px; resize:vertical; }
.rowact { display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
.btn.danger { color:color-mix(in srgb, var(--hz-bad) 85%, var(--hz-ink)); }
.btn, .navpill { min-height:36px; }
.tablewrap { overflow-x:auto; }
.rtable { min-width:0; }
.rtable th, .rtable td { white-space:nowrap; }
.formfocus { min-height:0; }
@media (max-width: 520px) {
  .btn, .navpill, .q { min-height:44px; }
  .q { width:32px; height:32px; min-height:32px; }
  .rtable thead { display:none; }
  .rtable, .rtable tbody, .rtable tr, .rtable td { display:block; width:100%; }
  .rtable tr { border:1px solid var(--hz-line); border-radius:12px; padding:8px 10px; margin-bottom:8px; }
  .rtable td { border:0; padding:4px 0; white-space:normal; display:flex; justify-content:space-between; gap:12px; }
  .rtable td::before { content:attr(data-label); color:var(--hz-mut); font-size:.72rem; font-weight:700; }
  .rtable td:last-child { justify-content:flex-end; }
  .srcrow { grid-template-columns:1fr; }
}


/* ===================== 0.8: neue Optik ===================== */
:host {
  --hz-radius: 18px; --hz-radius-sm: 12px;
  --hz-shadow: 0 1px 2px rgba(16,24,40,.05); --hz-shadow-lg: 0 6px 24px rgba(16,24,40,.08);
  --hz-band: color-mix(in srgb, var(--hz-ok) 13%, transparent);
  --hz-glass: color-mix(in srgb, var(--hz-card) 82%, transparent);
  --hz-display: "Space Grotesk", var(--ha-font-family-body, Inter, system-ui, sans-serif);
}
.wrap { gap:14px; }
.c { padding:18px 20px; }
.c:hover { box-shadow:var(--hz-shadow); }
.h { gap:8px; font-size:.72rem; letter-spacing:.09em; }
.h .grow { flex:1; }
.h > span:not(.pill):not(.grow) { text-transform:none; letter-spacing:0; font-weight:500; }
.h > span:first-child { text-transform:uppercase; letter-spacing:.09em; font-weight:700; }
.q { margin-left:4px; }
.wide { grid-column:1 / -1; }
.mt14 { margin-top:14px; }

/* Kopf und Tabs */
.top { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.brand { display:flex; align-items:center; gap:10px; font-size:1.05rem; }
.brand b { font-family:var(--hz-display); font-weight:700; letter-spacing:-.01em; }
.logo { width:22px; height:22px; border-radius:7px; background:conic-gradient(from 200deg, var(--hz-cool), var(--hz-ok), var(--hz-warn), var(--hz-heat), var(--hz-cool)); }
.top .meta { margin-left:auto; }
.tabs { display:flex; gap:4px; padding:4px; background:var(--hz-card); border:1px solid var(--hz-line); border-radius:14px; overflow-x:auto; scrollbar-width:none; }
.tabs::-webkit-scrollbar { display:none; }
.tab { flex:none; display:inline-flex; align-items:center; gap:7px; font:inherit; font-size:.8rem; font-weight:650; color:var(--hz-mut);
  background:none; border:0; border-radius:10px; padding:8px 12px; cursor:pointer; min-height:38px; }
.tab svg { width:16px; height:16px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
.tab:hover { color:var(--hz-ink); background:var(--hz-soft); }
.tab.on { color:var(--hz-ink); background:var(--hz-soft); box-shadow:inset 0 -2px 0 var(--hz-heat); }
.tab:focus-visible { outline:2px solid var(--hz-heat); outline-offset:1px; }

/* Kernsatz */
.say { padding:2px 2px 0; }
.say p { margin:0; font-family:var(--hz-display); font-size:1.05rem; font-weight:500; line-height:1.4; color:var(--hz-ink); text-wrap:balance; }
.say p b { font-weight:700; }
.say span { display:block; color:var(--hz-mut); font-size:.78rem; margin-top:2px; }
em.ok, em.bad { font-style:normal; font-weight:700; }
em.ok { color:color-mix(in srgb, var(--hz-ok) 80%, var(--hz-ink)); }
em.bad { color:color-mix(in srgb, var(--hz-bad) 80%, var(--hz-ink)); }

/* Übersicht */
.grid.ov { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); }
.verdict .big-say { margin:10px 0 2px; font-family:var(--hz-display); font-size:1.3rem; font-weight:600; line-height:1.3; letter-spacing:-.01em; text-wrap:balance; }
.chart .band { fill:var(--hz-band); stroke:none; }
.todo { display:grid; gap:8px; margin-top:12px; }
.todo-i { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; background:var(--hz-soft); border-radius:12px; padding:10px 12px; font-size:.86rem; }
.todo-i > i { width:8px; height:8px; border-radius:50%; }
.todo-i > i.tone-ok { background:var(--hz-ok); } .todo-i > i.tone-warn { background:var(--hz-warn); } .todo-i > i.tone-bad { background:var(--hz-bad); }
.todo-i b { display:block; font-weight:650; }
.todo-i small { color:var(--hz-mut); font-size:.75rem; }
.trio, .strip { display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px; margin-top:10px; }
.trio small, .strip small { display:block; color:var(--hz-mut); font-size:.74rem; }
.trio b, .strip b { font-family:var(--hz-display); font-size:1.45rem; font-weight:700; font-variant-numeric:tabular-nums; letter-spacing:-.01em; }
.trio b i, .strip b i, .num i { font-style:normal; font-family:inherit; font-size:.8rem; color:var(--hz-mut); font-weight:600; margin-left:3px; }
.strip > div { background:var(--hz-soft); border-radius:12px; padding:10px 12px; }
.strip span { display:block; color:var(--hz-mut); font-size:.74rem; margin-top:2px; }
.k4 { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:var(--hz-gap); }
.kpi .num { font-family:var(--hz-display); font-size:2rem; font-weight:700; letter-spacing:-.02em; margin-top:8px; font-variant-numeric:tabular-nums; line-height:1; }
.kpi .spark { height:34px; }

/* Betrieb */
.lanes { display:grid; gap:6px; margin-top:12px; font-size:.74rem; }
.lane { display:grid; grid-template-columns:42px 1fr; gap:10px; align-items:center; }
.lane > span { color:var(--hz-mut); font-variant-numeric:tabular-nums; }
.lane .bar { position:relative; height:22px; background:var(--hz-soft); border-radius:6px; overflow:hidden; }
.lane .bar i { position:absolute; top:0; bottom:0; border-radius:3px; }
.lane .bar i.thin { top:30%; bottom:30%; }
.lane.ax > div { display:flex; justify-content:space-between; color:var(--hz-mut); font-size:.68rem; }

/* Räume */
.heat { overflow-x:auto; margin-top:10px; }
.heat table { width:auto; border-collapse:separate; border-spacing:2px; margin:0; }
.heat th { border:0; padding:0 0 3px; text-align:center; font-size:.66rem; font-weight:500; }
.heat td { border:0; padding:0; }
.heat td.n { padding-right:10px; font-weight:650; font-size:.8rem; white-space:nowrap; }
.heat td.v { width:22px; height:22px; border-radius:4px; }
.heat td.m { padding-left:10px; font-variant-numeric:tabular-nums; white-space:nowrap; font-size:.8rem; }
.scale { display:flex; align-items:center; gap:8px; margin-top:10px; font-size:.7rem; color:var(--hz-mut); max-width:320px; }
.scale i { flex:1; height:10px; border-radius:5px; background:linear-gradient(90deg, rgb(58,123,255), rgb(66,198,232) 25%, rgb(46,196,166) 50%, rgb(255,207,74) 67%, rgb(255,138,61) 85%, rgb(255,77,109)); }
.grid.rooms { grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); }
.rcard, .dcard { display:grid; gap:8px; align-content:start; }
.rcard .top, .dcard .top, .grid.g3 > .c .top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.rcard .num { font-family:var(--hz-display); font-size:1.6rem; font-weight:700; font-variant-numeric:tabular-nums; }
.row2 { display:flex; justify-content:space-between; gap:10px; font-size:.8rem; color:var(--hz-mut); }
.row2 span:last-child { color:var(--hz-ink); text-align:right; }
.rcard .meter { height:6px; margin-top:0; }
.rcard .meter i { background:linear-gradient(90deg, var(--hz-warn), var(--hz-heat)); }

/* Hydraulik */
.flowwrap { overflow-x:auto; margin-top:8px; }
svg.flow { min-width:820px; width:100%; height:auto; display:block; }
svg.flow text { font-family:inherit; fill:var(--hz-ink); }
svg.flow .lbl { font-size:11px; font-weight:700; letter-spacing:1px; fill:var(--hz-mut); }
svg.flow .v1 { font-family:var(--hz-display); font-size:30px; font-weight:700; }
svg.flow .v2 { font-family:var(--hz-display); font-size:19px; font-weight:700; }
svg.flow .v2s { font-size:14px; font-weight:700; }
svg.flow .v3 { font-size:11px; fill:var(--hz-mut); }
svg.flow .v3.sm { font-size:10px; }
svg.flow .v3.ok { fill:var(--hz-ok); font-weight:700; }
svg.flow .tv { font-size:10.5px; font-weight:700; text-anchor:middle; }
svg.flow .cv { font-size:10px; font-weight:700; }
svg.flow .node { fill:var(--hz-card); stroke:var(--hz-line); }
svg.flow .tag, svg.flow .glass { fill:var(--hz-glass); }
svg.flow .tank { opacity:.92; }
svg.flow .pipe { fill:none; stroke-width:7; stroke-linecap:round; stroke-linejoin:round; }
svg.flow .pipe.mid { stroke-width:6; }
svg.flow .pipe.thin { stroke-width:5; }
svg.flow .dash { fill:none; stroke:var(--hz-card); stroke-width:2; opacity:0; }
svg.flow .dash.pipe-flow { opacity:.55; stroke-dasharray:6 6; animation:hzflow 1.2s linear infinite; }
svg.flow .valve { fill:var(--hz-card); stroke:var(--hz-heat); stroke-width:2.5; }
svg.flow .pumpc { fill:var(--hz-card); stroke:var(--hz-line); stroke-width:2; }
svg.flow .pump-rot { transform-box:fill-box; transform-origin:center; animation:hzspin 1.6s linear infinite; }
@keyframes hzflow { to { stroke-dashoffset:-24; } }
@keyframes hzspin { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { svg.flow .dash.pipe-flow, svg.flow .pump-rot { animation:none; } }

/* Geräte */
.dcard .md { font-size:.85rem; }
.tscroll { overflow-x:auto; }
table.tbl { margin-top:4px; }
table.tbl td { white-space:nowrap; }

@media (max-width: 1100px) { .k4 { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
@media (max-width: 440px) { .k4 { grid-template-columns:1fr; } .top .meta { margin-left:0; } }
@media (max-width: 760px) {
  .grid.ov { grid-template-columns:1fr; }
  .tab span { display:none; }
  .tab.on span { display:inline; }
  .verdict .big-say { font-size:1.12rem; }
  .kpi .num { font-size:1.6rem; }
}
`;

  // src/data.js
  var TTL = 5 * 60 * 1e3;
  var cache = null;
  var listeners = /* @__PURE__ */ new Set();
  function loadSummary(hass, { force = false } = {}) {
    const lang2 = getLang();
    const fresh = cache && Date.now() - cache.at < TTL && cache.lang === lang2;
    if (!force && fresh) return cache.promise;
    const promise = hass.callWS({ type: "heizungsanalyse/summary", language: lang2 });
    cache = { at: Date.now(), promise, lang: lang2 };
    promise.then((data) => listeners.forEach((fn) => fn(data))).catch(() => {
      cache = null;
    });
    return promise;
  }
  function invalidate() {
    cache = null;
  }

  // src/inventory.js
  var SECTIONS = ["pumps", "thermostats", "hydraulics", "radiators"];
  var SECTION_LABEL = {
    pumps: { de: "Pumpen", en: "Pumps" },
    thermostats: { de: "Thermostate", en: "Thermostats" },
    hydraulics: { de: "Hydraulik", en: "Hydraulics" },
    radiators: { de: "Heizkörper", en: "Radiators" }
  };
  var HEIZKURVE_FIELDS = ["heizkurve", "steigung", "offset"];
  function schemaOf(d) {
    return d && d.inventory_schema && d.inventory_schema.sections || {};
  }
  function sectionFields(d, section) {
    const entry = schemaOf(d)[section];
    return entry && entry.fields || [];
  }
  function localized(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    const lang2 = getLang() === "en" ? "en" : "de";
    return value[lang2] || value.de || value.en || "";
  }
  function slug(value) {
    return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }
  function objectKey(section, selection) {
    return section === "hydraulics" ? "hydraulics" : `${section}.${slug(selection)}`;
  }
  function findName(list, id) {
    const hit = (list || []).find((item) => String(item.id) === String(id));
    return hit ? hit.name || hit.id : id;
  }
  function objectName(d, object) {
    const [section, key] = String(object || "").split(".");
    const base = localized((schemaOf(d)[section] || {}).title) || section;
    if (!key) return base;
    if (section === "pumps") return `${base} ${findName(d.circuits, key)}`;
    if (section === "thermostats" || section === "radiators") return `${base} ${findName(d.rooms, key)}`;
    return `${base} ${key}`;
  }
  function objectSection(object) {
    return String(object || "").split(".")[0];
  }
  function objectEntries(d, section) {
    const inventory = d && d.inventory || {};
    const data = inventory[section] || {};
    if (section === "hydraulics") return Object.keys(data).length ? [{ key: "", object: "hydraulics", record: data }] : [];
    return Object.keys(data).map((key) => ({ key, object: `${section}.${key}`, record: data[key] || {} }));
  }
  function targetChoices(d) {
    const out = [{ value: "heizkurve", label: localized({ de: "Heizkurve", en: "Heating curve" }) }];
    for (const section of SECTIONS) {
      for (const entry of objectEntries(d, section)) {
        out.push({ value: entry.object, label: objectName(d, entry.object) });
      }
    }
    return out;
  }
  function comparisonFields(d, object) {
    if (!object || object === "heizkurve") {
      return [
        { key: "heizkurve", label: localized({ de: "Heizkurve", en: "Heating curve" }) },
        { key: "steigung", label: localized({ de: "Steigung", en: "Slope" }) },
        { key: "offset", label: localized({ de: "Offset", en: "Offset" }) }
      ];
    }
    const section = objectSection(object);
    const fields = sectionFields(d, section).filter((item) => item.key !== "notes").map((item) => ({ key: item.key, label: localized(item.label), unit: item.unit || "" }));
    return fields.length ? fields : HEIZKURVE_FIELDS.map((key) => ({ key, label: key }));
  }
  function currentValue(d, object, field) {
    if (!object || object === "heizkurve") {
      const options = d && d.config && d.config.options || {};
      if (field === "steigung") return options.heating_curve_slope ?? "";
      if (field === "offset") return options.heating_curve_offset ?? "";
      return "";
    }
    const section = objectSection(object);
    const key = object.includes(".") ? object.split(".").slice(1).join(".") : "";
    const data = (d && d.inventory || {})[section] || {};
    const record = section === "hydraulics" ? data : data[key] || {};
    const value = record[field];
    return value == null ? "" : value;
  }
  function sectionTitle(d, section) {
    return localized((schemaOf(d)[section] || {}).title) || localized(SECTION_LABEL[section]) || section;
  }
  function sectionSelectionHint(section) {
    if (section === "pumps") return { de: "Heizkreis", en: "Heating circuit" };
    if (section === "thermostats" || section === "radiators") return { de: "Raum", en: "Room" };
    return null;
  }

  // src/charts.js
  var W = 640;
  function withWidth(w, fn) {
    const prev = W;
    W = Math.max(260, Math.round(w || 640));
    try {
      return fn();
    } finally {
      W = prev;
    }
  }
  var PAD = { l: 42, r: 42, t: 24, b: 26 };
  function axisY(scale, h, unit, side = "l", color = "var(--hz-mut)") {
    const x = side === "l" ? PAD.l - 6 : W - PAD.r + 6;
    const anchor = side === "l" ? "end" : "start";
    const y = (v) => PAD.t + (1 - (v - scale.min) / (scale.max - scale.min)) * (h - PAD.t - PAD.b);
    return scale.ticks.map((v) => {
      const lines = side === "l" ? `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/>` : "";
      const digits = scale.step < 1 ? 1 : 0;
      return `${lines}<text x="${x}" y="${y(v) + 4}" text-anchor="${anchor}" style="fill:${color}">${fmt(v, digits)}</text>`;
    }).join("") + (unit ? `<text x="${side === "l" ? 4 : W - 4}" y="10" text-anchor="${side === "l" ? "start" : "end"}" class="unit" style="fill:${color}">${esc(unit)}</text>` : "");
  }
  function timeChart(rows, series, { h = 220, unitL = "", unitR = "", refL = null, markers = [], band = null } = {}) {
    if (!rows.length) return "";
    const inner = W - PAD.l - PAD.r;
    const step = inner / rows.length;
    const xs = (i) => PAD.l + step * (i + 0.5);
    const vals = (axis) => {
      const out = [];
      const stacked2 = series.filter((s) => s.axis === axis && s.stack);
      rows.forEach((r) => {
        let sum = 0;
        for (const s of stacked2) sum += r[s.key] || 0;
        if (stacked2.length) out.push(sum);
      });
      for (const s of series.filter((x) => x.axis === axis && !x.stack)) rows.forEach((r) => r[s.key] != null && out.push(r[s.key]));
      if (axis === "l" && refL != null) out.push(refL);
      if (axis === "l" && band) out.push(band[0], band[1]);
      return out;
    };
    const scaleOf = (axis, zero) => {
      const v = vals(axis);
      if (!v.length) return null;
      return niceScale(zero ? Math.min(0, ...v) : Math.min(...v), Math.max(...v));
    };
    const barAxis = (axis) => series.some((s) => s.axis === axis && s.kind === "bar");
    const sl = scaleOf("l", barAxis("l"));
    const sr = scaleOf("r", barAxis("r"));
    const yOf = (scale) => (v) => PAD.t + (1 - (v - scale.min) / (scale.max - scale.min)) * (h - PAD.t - PAD.b);
    let body = "";
    if (sl) body += axisY(sl, h, unitL, "l");
    if (band && sl) {
      const y = yOf(sl);
      body += `<rect x="${PAD.l}" y="${y(band[1])}" width="${W - PAD.l - PAD.r}" height="${Math.max(0, y(band[0]) - y(band[1]))}" class="band"/>`;
    }
    if (sr) body += axisY(sr, h, unitR, "r", series.find((s) => s.axis === "r")?.color);
    const stacked = series.filter((s) => s.stack && s.kind === "bar");
    if (stacked.length) {
      const scale = stacked[0].axis === "r" ? sr : sl;
      const y = yOf(scale);
      rows.forEach((r, i) => {
        let base = 0;
        for (const s of stacked) {
          const v = r[s.key];
          if (v == null || v <= 0) continue;
          const top = y(base + v);
          const bh = y(base) - top;
          body += `<rect x="${xs(i) - step * 0.36}" y="${top}" width="${step * 0.72}" height="${Math.max(0, bh)}" rx="${Math.min(3, step / 4)}" fill="${s.color}"><title>${dayLabel(r.day)} ${esc(s.label || s.key)}: ${fmt(v, s.digits ?? 1)}</title></rect>`;
          base += v;
        }
      });
    }
    for (const s of series.filter((x) => !x.stack)) {
      const scale = s.axis === "r" ? sr : sl;
      if (!scale) continue;
      const y = yOf(scale);
      if (s.kind === "bar") {
        rows.forEach((r, i) => {
          const v = r[s.key];
          if (v == null) return;
          body += `<rect x="${xs(i) - step * 0.36}" y="${Math.min(y(v), y(0))}" width="${step * 0.72}" height="${Math.abs(y(0) - y(v))}" rx="${Math.min(3, step / 4)}" fill="${s.color}"><title>${dayLabel(r.day)}: ${fmt(v, s.digits ?? 1)}</title></rect>`;
        });
        continue;
      }
      let path = "";
      let open = false;
      const pts = [];
      rows.forEach((r, i) => {
        const v = r[s.key];
        if (v == null) {
          open = false;
          return;
        }
        path += `${open ? "L" : "M"}${xs(i).toFixed(1)} ${y(v).toFixed(1)} `;
        pts.push([xs(i), y(v), r, v]);
        open = true;
      });
      if (s.kind === "area" && pts.length > 1) {
        body += `<path d="${path} L${pts[pts.length - 1][0]} ${y(scale.min)} L${pts[0][0]} ${y(scale.min)} Z" fill="${s.color}" opacity=".12"/>`;
      }
      body += `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.4}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ""}/>`;
      if (rows.length <= 45) {
        for (const [px, py, r, v] of pts) body += `<circle cx="${px}" cy="${py}" r="2.6" fill="${s.color}"><title>${dayLabel(r.day)}: ${fmt(v, s.digits ?? 1)}</title></circle>`;
      }
    }
    if (refL != null && sl) {
      const y = yOf(sl)(refL);
      body += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y}" y2="${y}" class="ref"/>`;
    }
    for (const m of markers) {
      const i = rows.findIndex((r) => r.day === m.day);
      if (i < 0) continue;
      body += `<line x1="${xs(i)}" x2="${xs(i)}" y1="${PAD.t}" y2="${h - PAD.b}" class="mark"/><circle cx="${xs(i)}" cy="${PAD.t + 2}" r="4" class="markdot"><title>${esc(m.label)}</title></circle>`;
    }
    const every = Math.max(1, Math.ceil(rows.length / Math.max(3, Math.min(8, Math.floor(W / 85)))));
    rows.forEach((r, i) => {
      if (i % every === 0 || i === rows.length - 1) {
        if (i !== rows.length - 1 && rows.length - 1 - i < every / 2) return;
        body += `<text x="${xs(i)}" y="${h - 6}" text-anchor="middle">${dayLabel(r.day)}</text>`;
      }
    });
    return `<svg viewBox="0 0 ${W} ${h}" class="chart" role="img">${body}</svg>`;
  }
  function scatterChart(points, { h = 240, unitX = "°C", unitY = "", lines = [], highlight = null, color = "var(--hz-ok)", band = null } = {}) {
    const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (pts.length < 2) return "";
    const allY = pts.map((p) => p.y).concat(lines.flatMap((l) => l.points.map((p) => p.y))).concat(band ? band.upper.concat(band.lower).map((p) => p.y) : []);
    const sx = niceScale(Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x)), 5);
    const sy = niceScale(Math.min(...allY), Math.max(...allY));
    const x = (v) => PAD.l + (v - sx.min) / (sx.max - sx.min) * (W - PAD.l - PAD.r);
    const y = (v) => PAD.t + (1 - (v - sy.min) / (sy.max - sy.min)) * (h - PAD.t - PAD.b);
    let body = axisY(sy, h, unitY, "l");
    for (const v of sx.ticks) body += `<text x="${x(v)}" y="${h - 6}" text-anchor="middle">${fmt(v, 0)}${esc(unitX)}</text>`;
    if (band && band.upper.length > 1) {
      const poly = band.upper.concat([...band.lower].reverse()).map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)} ${y(p.y).toFixed(1)}`).join(" ");
      body += `<path d="${poly} Z" class="band"/>`;
    }
    for (const l of lines) {
      const d = l.points.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)} ${y(p.y).toFixed(1)}`).join(" ");
      body += `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="${l.width || 2.6}" ${l.dash ? `stroke-dasharray="${l.dash}"` : ""} stroke-linecap="round"/>`;
    }
    for (const p of pts) {
      body += `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r || 4.2}" fill="${p.color || color}" opacity="${p.opacity ?? 0.55}"><title>${esc(p.title || "")}</title></circle>`;
    }
    if (highlight) {
      body += `<circle cx="${x(highlight.x)}" cy="${y(highlight.y)}" r="8" fill="none" class="hl"/><text x="${x(highlight.x) + 11}" y="${y(highlight.y) + 18}" class="hlt">${esc(highlight.label)}</text>`;
    }
    return `<svg viewBox="0 0 ${W} ${h}" class="chart" role="img">${body}</svg>`;
  }
  function binChart(bins, { h = 200, color = "var(--hz-warn)", unit = "", ref = null, digits = 1 } = {}) {
    if (!bins.length) return "";
    const vals = bins.map((b) => b.mean);
    if (ref != null) vals.push(ref);
    const sy = niceScale(0, Math.max(...vals));
    const inner = W - PAD.l - PAD.r;
    const step = inner / bins.length;
    const y = (v) => PAD.t + (1 - (v - sy.min) / (sy.max - sy.min)) * (h - PAD.t - PAD.b);
    let body = axisY(sy, h, unit, "l");
    bins.forEach((b, i) => {
      const bx = PAD.l + step * i + step * 0.15;
      const over = ref != null && b.mean > ref;
      body += `<rect x="${bx}" y="${y(b.mean)}" width="${step * 0.7}" height="${y(0) - y(b.mean)}" rx="4" fill="${over ? "var(--hz-bad)" : color}"><title>${fmt(b.lower, 0)}…${fmt(b.upper, 0)} °C: ${fmt(b.mean, digits)} (${b.n})</title></rect>`;
      body += `<text x="${bx + step * 0.35}" y="${y(b.mean) - 5}" text-anchor="middle" class="val">${fmt(b.mean, digits)}</text>`;
      body += `<text x="${bx + step * 0.35}" y="${h - 6}" text-anchor="middle">${fmt(b.lower, 0)}°</text>`;
    });
    if (ref != null) body += `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(ref)}" y2="${y(ref)}" class="ref"/>`;
    return `<svg viewBox="0 0 ${W} ${h}" class="chart" role="img">${body}</svg>`;
  }
  function sparkline(values, color, { h = 36, kind = "line", ref = null } = {}) {
    const v = values.map((x) => x == null ? null : Number(x));
    const nums = v.filter((x) => x != null);
    if (nums.length < 2) return `<svg viewBox="0 0 220 ${h}" class="spark"></svg>`;
    const lo = Math.min(...nums, ref ?? Infinity);
    const hi = Math.max(...nums, ref ?? -Infinity);
    const span = hi - lo || 1;
    const y = (x) => h - 3 - (x - lo) / span * (h - 6);
    const step = 220 / v.length;
    let body = "";
    if (kind === "bar") {
      v.forEach((x, i) => {
        if (x == null) return;
        body += `<rect x="${i * step + step * 0.18}" y="${y(x)}" width="${step * 0.64}" height="${h - y(x)}" rx="2" fill="${color}"/>`;
      });
    } else {
      let d = "";
      let open = false;
      v.forEach((x, i) => {
        if (x == null) return void (open = false);
        d += `${open ? "L" : "M"}${(i * step + step / 2).toFixed(1)} ${y(x).toFixed(1)} `;
        open = true;
      });
      body += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    if (ref != null) body += `<line x1="0" x2="220" y1="${y(ref)}" y2="${y(ref)}" stroke="var(--hz-bad)" stroke-dasharray="4 3" stroke-width="1"/>`;
    return `<svg viewBox="0 0 220 ${h}" class="spark" preserveAspectRatio="none">${body}</svg>`;
  }

  // src/help.js
  var HELP = {
    live: {
      de: "Momentanwerte der Wärmepumpe: Wärmeleistung = Volumenstrom × Spreizung × 4,19 kJ/(kg·K), Strom aus der Leistungsmessung, COP jetzt = Wärme ÷ Strom. Nur sinnvoll, solange der Verdichter läuft; kurz nach dem Start schwanken die Werte stark.",
      en: "Live heat pump values: heat output = volume flow × spread × 4.19 kJ/(kg·K), power from the power reading, COP now = heat ÷ power. Only meaningful while the compressor runs; right after start-up the values fluctuate."
    },
    spread: {
      de: "Spreizung = WP-Vorlauf minus WP-Rücklauf, nur in Stunden, in denen der Verdichter lief. Üblich sind 3–8 K. Kleiner heißt: viel Volumenstrom, Pumpe arbeitet mehr als nötig und die Wärmepumpe taktet leichter. Größer heißt: zu wenig Volumenstrom, die Wärmepumpe muss heißer fahren.",
      en: "Spread = heat pump flow minus heat pump return, only in hours when the compressor ran. 3–8 K is typical. Smaller means a lot of volume flow, the pump works harder than needed and the heat pump cycles more easily. Larger means too little flow, the heat pump has to run hotter."
    },
    overshoot: {
      de: "Wie weit der Vorlauf der Wärmepumpe über dem Puffer-Soll liegt, während sie lädt. Ein paar Kelvin sind nötig, damit der Puffer überhaupt warm wird. Liegt der Wert dauerhaft deutlich höher, lädt die Anlage heißer als nötig – das kostet COP.",
      en: "How far the heat pump flow exceeds the buffer target while charging. A few kelvin are needed for the buffer to warm up at all. If the value stays clearly higher, the system charges hotter than needed – which costs COP."
    },
    score: {
      de: "Ein einfacher Gesamtwert: 100 Punkte, minus 15 je Warnung und minus 5 je Hinweis. Er sagt nur, wie viele Regeln anschlagen – nicht, wie effizient die Anlage absolut ist. In den ersten Tagen steht „Lernt noch“. Laufen COP oder Vorlauf-Prüfung nicht oder weniger als 70 % der Prüfungen, steht „Eingeschränkt“: Was nicht geprüft wird, kann auch nicht gut sein. Darunter steht, welche Prüfung fehlt und warum.",
      en: "A simple overall value: 100 points, minus 15 per warning and minus 5 per note. It only reflects how many rules fire – not how efficient the system is in absolute terms. The first days show “still learning”. If the COP or flow check is not running, or fewer than 70 % of checks, it shows “limited”: what is not checked cannot be called good. Below it lists which check is missing and why."
    },
    cop: {
      de: "COP = erzeugte Wärme ÷ verbrauchter Strom. 4,5 heißt: aus 1 kWh Strom wurden 4,5 kWh Wärme. Gezeigt wird der Wert der letzten 7 Tage, daneben 30 Tage. Bei Kälte sinkt der COP – das ist normal.",
      en: "COP = heat produced ÷ electricity used. 4.5 means 1 kWh of power became 4.5 kWh of heat. Shown is the last 7 days, next to it 30 days. COP drops in cold weather – that is normal."
    },
    starts: {
      de: "Wie oft der Verdichter am Tag anspringt (Mittel über 7 Tage). Viele kurze Starts („Takten“) kosten Effizienz und Lebensdauer. Die rote Linie ist deine eingestellte Schwelle.",
      en: "How often the compressor starts per day (7-day mean). Many short starts (“cycling”) cost efficiency and lifetime. The red line is your threshold."
    },
    runtime: {
      de: "Mittlere Laufzeit je Verdichterstart. Länger ist besser: unter etwa 20 Minuten läuft die Wärmepumpe meist im ineffizienten Anlaufbereich.",
      en: "Mean run time per compressor start. Longer is better: below about 20 minutes the heat pump mostly runs in its inefficient start-up phase."
    },
    flow: {
      de: "Median aus Ist-Vorlauf minus Soll-Vorlauf, nur während der Verdichter läuft. Positiv heißt: wärmer als nötig – die Heizkurve ist vermutlich zu hoch oder ein Mischer regelt schlecht. Jedes Kelvin weniger Vorlauf bringt grob 2–3 % COP.",
      en: "Median of actual minus target flow temperature, only while the compressor runs. Positive means warmer than needed – the heating curve is probably too high or a mixer controls poorly. Each kelvin less flow gains roughly 2–3 % COP."
    },
    findings: {
      de: "Jeder Hinweis stammt aus einer festen Regel (F01–F13) und nennt den Beleg: Zeitraum, Messwerte, Schwelle. Warnungen zuerst. Die Integration greift nie selbst ein – sie sagt nur, wo sich Hinsehen lohnt.",
      en: "Each finding comes from a fixed rule (F01–F13) and states its evidence: period, values, threshold. Warnings first. The integration never intervenes – it only tells you where to look."
    },
    copcurve: {
      de: "Jeder Punkt ist ein Tag: Tages-COP über der mittleren Außentemperatur. Die grüne Linie ist der Trend deiner eigenen Anlage. Liegt der heutige Punkt deutlich darunter, lief etwas schlechter als sonst bei diesem Wetter.",
      en: "Each dot is a day: daily COP against mean outdoor temperature. The green line is your own system's trend. If today's dot is clearly below it, something ran worse than usual for this weather."
    },
    energy: {
      de: "Tägliche Heizwärme und Stromverbrauch der Wärmepumpe, dazu Warmwasser, falls ein Zähler zugeordnet ist. Die Lücke zwischen Wärme und Strom ist die „kostenlose“ Umweltwärme.",
      en: "Daily heat and heat-pump power, plus hot water if a meter is mapped. The gap between heat and power is the “free” ambient heat."
    },
    copline: {
      de: "Tages-COP (grün) und Außentemperatur (blau, rechte Achse). Senkrechte Striche markieren eingetragene Änderungen – so siehst du, ob danach etwas besser wurde.",
      en: "Daily COP (green) and outdoor temperature (blue, right axis). Vertical lines mark logged changes – so you can see whether something improved afterwards."
    },
    curve: {
      de: "Tagesmittel von Ist- und Soll-Vorlauf über der Außentemperatur. Liegt Ist dauerhaft über Soll, heizt die Anlage wärmer als die Kurve verlangt. Eine flachere Kurve (niedriger) spart am meisten.",
      en: "Daily mean of actual and target flow vs outdoor temperature. If actual stays above target, the system heats warmer than the curve demands. A flatter (lower) curve saves the most."
    },
    cycling: {
      de: "Mittlere Verdichterstarts pro Tag, sortiert nach Außentemperatur. Typisch: In der Übergangszeit (5–15 °C) taktet eine Wärmepumpe am meisten, weil wenig Wärme gebraucht wird. Rot = über deiner Schwelle.",
      en: "Mean compressor starts per day, grouped by outdoor temperature. Typical: in shoulder season (5–15 °C) a heat pump cycles most because little heat is needed. Red = above your threshold."
    },
    cycle: {
      de: "Mittlere Minuten je Verdichterstart pro Tag. Steigt die Kurve, laufen die Zyklen länger – gut.",
      en: "Mean minutes per compressor start per day. A rising line means longer cycles – good."
    },
    defrost: {
      de: "Stunden pro Tag mit Abtauung bzw. Heizstab. Abtauen ist bei 0–7 °C und feuchter Luft normal. Ein Heizstab, der regelmäßig läuft, kostet viel Strom – Einsatzgrenzen prüfen.",
      en: "Hours per day with defrost or aux heater. Defrost is normal at 0–7 °C and humid air. An aux heater that runs regularly costs a lot of power – check its limits."
    },
    rooms: {
      de: "Je Raum der Median aus Ist minus Soll über 7 Tage (Stichproben alle 5 Minuten). Der Balken zeigt die Richtung: links zu kalt, rechts zu warm. Darunter die Anteile der Zeit außerhalb der Toleranz und die typische Aufheizzeit nach einer Sollwert-Anhebung.",
      en: "Per room the median of actual minus target over 7 days (sampled every 5 minutes). The bar shows the direction: left too cold, right too warm. Below: share of time outside tolerance and the typical heat-up time after a setpoint increase."
    },
    circuits: {
      de: "Je Heizkreis: Anteil der Pumpenlaufzeit, in der der Verdichter aus war (Pumpe läuft „umsonst“), und wie oft der Mischer pro Tag stellt. Nur sichtbar, wenn Pumpe bzw. Mischer zugeordnet sind.",
      en: "Per circuit: share of pump run time while the compressor was off (pump runs “for nothing”) and how often the mixer moves per day. Only shown if pump or mixer is mapped."
    },
    changes: {
      de: "Trag jede Einstellungsänderung ein (Heizkurve, Pumpenstufe, Abgleich …). Verglichen werden die 7 Tage davor mit den 7 Tagen danach. „Wetterbereinigt“ zieht ab, was allein die andere Außentemperatur am COP ändern würde – laut deiner eigenen Kennlinie.",
      en: "Log every settings change (heating curve, pump stage, balancing …). The 7 days before are compared with the 7 days after. “Weather-adjusted” subtracts what the different outdoor temperature alone would change in COP – according to your own curve."
    },
    inventory: {
      de: "Stammdaten deiner Anlage: Pumpen, Thermostate, Hydraulik und Heizkörper. Die Felder kommen aus dem Schema – Schlüssel werden aus Kreis oder Raum abgeleitet, nie getippt. Für gängige Pumpen und Ventile gibt es einen Herstellerkatalog, der die Werte aus dem Datenblatt vorbelegt; prüfe sie am Typenschild. Jede Änderung landet automatisch im Verlauf. CSV dient nur dem Austausch vieler Werte.",
      en: "Master data of your system: pumps, thermostats, hydraulics and radiators. Fields come from the schema – keys are derived from circuit or room, never typed. A manufacturer catalogue pre-fills common pumps and valves with datasheet values; check them on the nameplate. Every change lands in the history automatically. CSV is only for exchanging many values."
    },
    system: {
      de: "Der Systemstatus zeigt, welche Version die Karte und welche das Backend hat, wann der letzte Lauf war und ob ein Fehler auftrat. Die Karte meldet eigene Fehler selbst mit – dann steht hier die gekürzte Meldung statt einer stillen Fehlfunktion.",
      en: "System status shows which version the card and the backend have, when the last run happened and whether an error occurred. The card reports its own errors itself – then the shortened message appears here instead of a silent failure."
    },
    sources_check: {
      de: "Für jede zugeordnete Quelle: Zustand, Einheit, Anzahl Statistikzeilen und letzter Wert. Grün heißt auswertbar. „Keine Statistik“ bedeutet: Sensor ohne Langzeitdaten – dann rechnet die Integration nicht. „Unpassend“ nennt die Abweichung; der Tipp darunter sagt, was zu tun ist.",
      en: "For every mapped source: state, unit, number of statistics rows and last value. Green means usable. “No statistics” means a sensor without long-term data – the integration will not calculate. “Mismatched” names the deviation; the hint below says what to do."
    },
    log: {
      de: "Das Protokoll hält Start, Auswertung, Quellen, Hinweise, Konfiguration, Inventar, Dashboard und Kartenfehler fest. Höchstens 2000 Einträge oder 30 Tage. Einträge lassen sich nach Kategorie, Stufe und Text filtern, nach Tag gruppiert aufklappen und als JSON exportieren.",
      en: "The log keeps start, analysis, sources, findings, configuration, inventory, dashboard and card errors. At most 2000 entries or 30 days. Entries can be filtered by category, level and text, grouped by day, expanded and exported as JSON."
    },
    cfg_sources: {
      de: "Pflicht- und optionale Quellen. Änderungen werden nach dem Speichern übernommen; die Integration lädt neu. Leere Felder bleiben ungenutzt.",
      en: "Mandatory and optional sources. Changes apply after saving; the integration reloads. Empty fields stay unused."
    },
    cfg_circuits: {
      de: "Heizkreise mit Name, Typ und den zugeordneten Entities. Der Bezeichner wird automatisch vergeben, damit er stabil bleibt.",
      en: "Heating circuits with name, type and mapped entities. The identifier is assigned automatically so it stays stable."
    },
    cfg_rooms: {
      de: "Räume mit Heizkreis und optionalem Thermostat. Ohne Klima-Entity gibt es kein Komfort-Finding, die Raumauswertung bleibt aber möglich.",
      en: "Rooms with heating circuit and optional thermostat. Without a climate entity there is no comfort finding, but room evaluation still works."
    },
    cfg_curve: {
      de: "Vorschlag aus der Vorlauf-Abweichung der letzten 7 Tage. Offset senkt/anhebt die ganze Kurve, Steigung ändert die Temperaturabhängigkeit. Werte werden erst nach Speichern übernommen.",
      en: "Suggestion from the flow deviation of the last 7 days. Offset shifts the whole curve, slope changes the temperature dependence. Values apply only after saving."
    },
    cfg_thresholds: {
      de: "Schwellen der Findings mit Einheit und Grenzen. „Auf Standard zurücksetzen“ stellt die Platzhalter wieder her.",
      en: "Finding thresholds with unit and limits. “Reset to defaults” restores the placeholder values."
    },
    schema: {
      de: "Schematische Darstellung von Wärmepumpe, Puffer und Heizkreisen mit Live-Werten. Dient der Orientierung; keine Steuerung.",
      en: "Schematic of heat pump, buffer and circuits with live values. For orientation only; no control."
    },
    sources: {
      de: "Welche Sensoren zugeordnet sind. Fehlende optionale Sensoren schalten Auswertungen nicht frei – ergänzen lässt sich das unter Konfigurieren.",
      en: "Which sensors are mapped. Missing optional sensors leave analyses locked – add them under Configure."
    },
    timeline: {
      de: "Jede Zeile ist ein Tag von 0 bis 24 Uhr. Orange: Verdichter läuft. Violett: Warmwasser wird geladen. Blau: Abtauen. Rot: Heizstab. Viele kurze Striche heißt Takten; lange Blöcke sind gut. Grundlage ist der Zustandsverlauf von Home Assistant.",
      en: "Each row is a day from 0 to 24 h. Orange: compressor running. Violet: hot water charging. Blue: defrost. Red: aux heater. Many short strokes mean cycling; long blocks are good. Based on the Home Assistant state history."
    },
    schema: {
      de: "Das Fließbild zeigt live, wohin die Wärme gerade geht: von der Wärmepumpe über die Umschaltung in den Puffer oder den Warmwasserspeicher, vom Puffer in die Heizkreise. Rohrfarbe ist die Temperatur, die Strichlinie läuft nur bei laufender Pumpe. Die Raum-Chips färben sich nach der Abweichung zum Soll über sieben Tage.",
      en: "The flow diagram shows live where the heat goes: from the heat pump via the diverter into the buffer or the hot-water tank, from the buffer into the heating circuits. Pipe colour is the temperature; the dashed line moves only while the pump runs. Room chips are coloured by the deviation from target over seven days."
    },
    costs: {
      de: "Kosten des laufenden Monats. Jede Stunde wird mit dem Preis gerechnet, der in dieser Stunde galt – bei dynamischen Tarifen ist das genauer als „Monatsverbrauch × aktueller Preis“. Preise und Wasserzähler kommen aus dem Energie-Dashboard von Home Assistant. „Wärme kostet“ teilt die Stromkosten durch die erzeugte Wärme.",
      en: "Costs of the current month. Every hour is priced with the price valid in that hour – with dynamic tariffs that is more accurate than “monthly usage × current price”. Prices and the water meter come from the Home Assistant energy dashboard. “Heat costs” divides power costs by the heat produced."
    },
    dhw_tank: {
      de: "Warmwasserspeicher: aktuelle Temperatur und Soll, Ladungen pro Tag und deren Dauer aus dem Warmwasserbetrieb, Abkühlung in Kelvin pro Stunde in Stunden ohne Ladung. Die Abkühlung enthält auch gezapftes Wasser; nachts zeigt sie vor allem den Wärmeverlust des Speichers.",
      en: "Hot water tank: current temperature and target, charges per day and their duration from hot-water mode, cooling in kelvin per hour in hours without charging. Cooling includes drawn water; at night it mostly shows the tank's heat loss."
    },
    dhw: {
      de: "Anteil der Warmwasser-Wärme an der gesamten Wärme. Warmwasser braucht höhere Temperaturen und senkt deshalb den COP – ein hoher Anteil erklärt einen niedrigeren Gesamt-COP.",
      en: "Share of hot-water heat in total heat. Hot water needs higher temperatures and therefore lowers COP – a high share explains a lower overall COP."
    }
  };
  function helpText(key) {
    const h = HELP[key];
    if (!h) return "";
    return getLang() === "de" ? h.de : h.en;
  }
  var HELP_KEYS = Object.keys(HELP);

  // src/components.js
  function head(title, key, ui, sub = "") {
    const open = ui.help === key;
    return `<div class="h">${esc(title)}${sub ? ` <span class="sub">${sub}</span>` : ""}<button class="q ${open ? "on" : ""}" data-help="${key}" aria-label="?">?</button></div>${open ? `<div class="help">${esc(helpText(key))}</div>` : ""}`;
  }
  function statusPill(tone, text) {
    return `<span class="pill tone-${tone}">${esc(text)}</span>`;
  }
  function card(title, key, ui, body, sub = "", cls = "") {
    return `<section class="c ${cls}">${head(title, key, ui, sub)}${body}</section>`;
  }
  function empty(text) {
    return `<div class="empty">${esc(text)}</div>`;
  }
  function banner(tone, text) {
    return `<div class="banner tone-${tone}">${esc(text)}</div>`;
  }
  function button(label, { act, variant = "", attrs = "", type = "button" } = {}) {
    const cls = ["btn", variant].filter(Boolean).join(" ");
    return `<button class="${cls}" type="${type}"${act ? ` data-act="${act}"` : ""}${attrs ? ` ${attrs}` : ""}>${esc(label)}</button>`;
  }
  function fieldLabel(name, label, unit = "", required = false) {
    return `<label for="${esc(name)}">${esc(label)}${unit ? ` <span class="unit">${esc(unit)}</span>` : ""}${required ? ` <span class="req" aria-hidden="true">*</span>` : ""}</label>`;
  }
  function textField({ name, label, value = "", type = "text", unit = "", placeholder = "", error = "", attrs = "" }) {
    return `<div class="field${error ? " invalid" : ""}">${fieldLabel(name, label, unit)}
    <input id="${esc(name)}" name="${esc(name)}" type="${esc(type)}" value="${esc(value ?? "")}" placeholder="${esc(placeholder)}"${attrs ? ` ${attrs}` : ""} aria-invalid="${error ? "true" : "false"}">
    ${error ? `<div class="ferr" role="alert">${esc(error)}</div>` : ""}</div>`;
  }
  function selectField({ name, label, value = "", options = [], groups = [], error = "", attrs = "" }) {
    const option = (item) => {
      const val = typeof item === "object" ? item.value : item;
      const text = typeof item === "object" ? localized(item.label) || item.value : item;
      const extra = typeof item === "object" && item.attrs ? ` ${item.attrs}` : "";
      return `<option value="${esc(val)}"${String(val) === String(value ?? "") ? " selected" : ""}${extra}>${esc(text)}</option>`;
    };
    const opts = options.map(option).join("") + groups.map((group) => `<optgroup label="${esc(localized(group.label))}">${group.options.map(option).join("")}</optgroup>`).join("");
    return `<div class="field${error ? " invalid" : ""}">${fieldLabel(name, label)}
    <select id="${esc(name)}" name="${esc(name)}"${attrs ? ` ${attrs}` : ""} aria-invalid="${error ? "true" : "false"}">${opts}</select>
    ${error ? `<div class="ferr" role="alert">${esc(error)}</div>` : ""}</div>`;
  }
  function table({ cols, rows, emptyText = "", cls = "" }) {
    if (!rows.length) return empty(emptyText);
    const head2 = cols.map((col) => `<th${col.cls ? ` class="${col.cls}"` : ""}>${esc(typeof col === "string" ? col : col.label)}</th>`).join("");
    const body = rows.map((row) => {
      const cells = row.map((cell, index) => `<td data-label="${esc(typeof cols[index] === "string" ? cols[index] : cols[index].label)}">${cell}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    return `<div class="tablewrap${cls ? ` ${cls}` : ""}"><table class="rtable"><thead><tr>${head2}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function progress(percent) {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span style="width:${value}%"></span></div>`;
  }

  // src/views8.js
  function box(ui, id, fn) {
    const w = ui.widths && ui.widths[id] || 640;
    return `<div class="cbox" data-cid="${id}">${withWidth(w, fn)}</div>`;
  }
  var ICONS = {
    anlage: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    effizienz: "M3 20h18M6 16l4-5 3 3 5-7",
    betrieb: "M4 6h12M4 12h8M4 18h14",
    raeume: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    schema: "M4 7h9a4 4 0 0 1 4 4v8M4 17h6M17 19h3",
    vergleich: "M7 4v16M17 4v16M4 9h6M14 15h6",
    inventar: "M5 5h14v14H5zM9 9h6v6H9z",
    protokoll: "M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
  };
  var NAV8 = [
    ["anlage", "Übersicht"],
    ["effizienz", "Effizienz"],
    ["betrieb", "Betrieb"],
    ["raeume", "Räume"],
    ["schema", "Hydraulik"],
    ["vergleich", "Änderungen"],
    ["inventar", "Geräte"],
    ["protokoll", "System"]
  ];
  function header8(d, view) {
    const at = d.generated ? new Date(d.generated) : null;
    const time = at ? at.toLocaleTimeString(getLang() === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
    const nav = NAV8.map(
      ([v, label]) => `<button class="tab ${v === view ? "on" : ""}" data-nav="${v}" aria-current="${v === view ? "page" : "false"}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[v]}"/></svg><span>${esc(t(label))}</span></button>`
    ).join("");
    return `<header class="top"><div class="brand"><span class="logo" aria-hidden="true"></span><b>${esc(d.title || t("Heizungsanalyse"))}</b></div>
    <span class="meta"><span class="dot ${d.last_update_success === false ? "off" : ""}"></span>${esc(t("Aktualisiert {t}", { t: time }))} · ${esc(t("Version {v}", { v: d.version }))}</span></header>
    <nav class="tabs" role="tablist">${nav}</nav>`;
  }
  function q(key, ui) {
    return `<button class="q ${ui.help === key ? "on" : ""}" data-help="${key}" aria-label="?">?</button>`;
  }
  function hb(key, ui) {
    return ui.help === key ? `<div class="help">${esc(helpText(key))}</div>` : "";
  }
  function say(text, sub = "") {
    return `<div class="say"><p>${text}</p>${sub ? `<span>${esc(sub)}</span>` : ""}</div>`;
  }
  var STOPS = [
    [-2, [58, 123, 255]],
    [-1, [66, 198, 232]],
    [0, [46, 196, 166]],
    [0.7, [255, 207, 74]],
    [1.4, [255, 138, 61]],
    [2, [255, 77, 109]]
  ];
  function thermal(v) {
    if (v == null || Number.isNaN(v)) return "var(--hz-soft)";
    const x = Math.max(-2, Math.min(2, v));
    for (let i = 0; i < STOPS.length - 1; i++) {
      const [a, ca] = STOPS[i];
      const [b, cb] = STOPS[i + 1];
      if (x <= b) {
        const f = (x - a) / (b - a);
        return `rgb(${ca.map((c, j) => Math.round(c + (cb[j] - c) * f)).join(",")})`;
      }
    }
    return "rgb(255,77,109)";
  }
  var PIPE = [
    [10, [58, 123, 255]],
    [25, [66, 198, 232]],
    [32, [255, 207, 74]],
    [40, [255, 138, 61]],
    [55, [255, 77, 109]]
  ];
  function pipeColor(c) {
    if (c == null) return "var(--hz-line)";
    const x = Math.max(PIPE[0][0], Math.min(PIPE[PIPE.length - 1][0], c));
    for (let i = 0; i < PIPE.length - 1; i++) {
      const [a, ca] = PIPE[i];
      const [b, cb] = PIPE[i + 1];
      if (x <= b) {
        const f = (x - a) / (b - a);
        return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * f)).join(",")})`;
      }
    }
    return "rgb(255,77,109)";
  }
  function num(state) {
    if (!state) return null;
    const v = Number(state.state);
    return Number.isFinite(v) ? v : null;
  }
  function onOff(state) {
    if (!state || state.state === "unavailable" || state.state === "unknown") return null;
    return state.state === "on";
  }
  function liveValues(d, states) {
    const e = d.entities || {};
    const s = (id) => id ? states[id] : null;
    const circuits = {};
    for (const [id, c] of Object.entries(e.circuits || {})) {
      circuits[id] = {
        temp: num(s(c.temp)),
        target: num(s(c.target)),
        pump: onOff(s(c.pump)),
        opening: onOff(s(c.mixer_open)),
        closing: onOff(s(c.mixer_close))
      };
    }
    const flow = num(s(e.hp_flow));
    const ret = num(s(e.hp_return));
    const volume = num(s(e.volume));
    const pStateRaw = s(e.power_now);
    let power = num(pStateRaw);
    if (power != null && pStateRaw && pStateRaw.attributes && pStateRaw.attributes.unit_of_measurement === "W") power /= 1e3;
    const running2 = onOff(s(e.compressor));
    const spread = flow != null && ret != null ? flow - ret : null;
    const heat = running2 === false ? 0 : volume != null && spread != null && volume > 0 ? volume / 60 * 4.186 * spread : null;
    const cop = running2 !== false && heat != null && power != null && power >= 0.1 && heat > 0 ? heat / power : null;
    return {
      running: running2,
      flow,
      ret,
      volume,
      power,
      spread,
      heat,
      cop,
      outdoor: num(s(e.outdoor)),
      buffer: num(s(e.buffer)),
      bufferTarget: num(s(e.buffer_target)),
      dhw: num(s(e.dhw_temp)),
      dhwTarget: num(s(e.dhw_target)),
      dhwCharging: onOff(s(e.dhw_op)) ?? onOff(s(e.dhw_pump)),
      dhwPump: onOff(s(e.dhw_pump)),
      defrost: onOff(s(e.defrost)),
      aux: onOff(s(e.aux)),
      circuits
    };
  }
  function copFit(d) {
    return linearFit((d.series || []).filter((r) => r.cop != null && r.outdoor != null && r.cop < 12 && r.power > 1).map((r) => ({ x: r.outdoor, y: r.cop })));
  }
  function expectation(d) {
    const fit = copFit(d);
    const recent = (d.series || []).slice(-7).filter((r) => r.outdoor != null);
    if (!fit || fit.n < 10 || !recent.length) return null;
    const outdoor = recent.reduce((a, r) => a + r.outdoor, 0) / recent.length;
    const expected = recent.reduce((a, r) => a + fit.at(r.outdoor), 0) / recent.length;
    const cop = d.kpis && d.kpis.cop_short && d.kpis.cop_short.value;
    return { fit, outdoor, expected, cop, rel: cop != null ? cop / expected - 1 : null };
  }
  function viewUebersicht(d, ui, live) {
    const k = d.kpis || {};
    const th = d.thresholds || {};
    const ex = expectation(d);
    const findings = d.findings || [];
    const warn = findings.filter((f) => f.severity === "warning").length;
    let sentence;
    if (!ex || ex.rel == null) {
      sentence = esc(t("Die Anlage sammelt noch Daten für ihre eigene Kennlinie."));
    } else if (Math.abs(ex.rel) <= 0.08) {
      sentence = t("Deine Wärmepumpe läuft <em class='ok'>so effizient, wie es bei {o} °C zu erwarten ist</em>.", { o: fmt(ex.outdoor, 0) });
    } else if (ex.rel > 0) {
      sentence = t("Deine Wärmepumpe läuft <em class='ok'>{p} % besser</em> als sonst bei {o} °C.", { p: fmt(ex.rel * 100, 0), o: fmt(ex.outdoor, 0) });
    } else {
      sentence = t("Deine Wärmepumpe läuft <em class='bad'>{p} % schlechter</em> als sonst bei {o} °C.", { p: fmt(-ex.rel * 100, 0), o: fmt(ex.outdoor, 0) });
    }
    const tail = findings.length === 0 ? t("Kein Handlungsbedarf.") : warn ? t("{n} Punkte brauchen Aufmerksamkeit.", { n: findings.length }) : t("{n} Punkte zum Ansehen.", { n: findings.length });
    const rows = (d.series || []).filter((r) => r.cop != null && r.outdoor != null && r.cop < 12);
    const today = rows[rows.length - 1];
    const fit = ex && ex.fit;
    const xs = rows.map((r) => r.outdoor);
    let chart = "";
    if (fit && xs.length > 2) {
      const lo = Math.min(...xs);
      const hi = Math.max(...xs);
      const w = Math.max(0.25, fit.sigma || 0.3);
      const line = [{ x: lo, y: fit.at(lo) }, { x: hi, y: fit.at(hi) }];
      const band = { upper: line.map((p) => ({ x: p.x, y: p.y + w })), lower: line.map((p) => ({ x: p.x, y: p.y - w })) };
      const pts = rows.map((r, i) => ({ x: r.outdoor, y: r.cop, opacity: 0.25 + 0.55 * (i / Math.max(1, rows.length - 1)), title: `${dayLabel(r.day)}: COP ${fmt(r.cop)} · ${fmt(r.outdoor)} °C` }));
      chart = box(
        ui,
        "ov-curve",
        () => scatterChart(pts, {
          h: 200,
          unitY: "COP",
          lines: [{ color: "var(--hz-ok)", dash: "5 4", width: 1.8, points: line }],
          band,
          highlight: today ? { x: today.outdoor, y: today.cop, label: t("heute {c} · erwartet {e}", { c: fmt(today.cop), e: fmt(fit.at(today.outdoor)) }) } : null
        })
      );
    }
    const score = d.score || {};
    const scoreTone = { very_good: "ok", good: "ok", watch: "warn", action: "bad" }[score.level] || "mut";
    const scoreLabel = { very_good: "Sehr gut", good: "Gut", watch: "Beobachten", action: "Handlungsbedarf", learning: "Lernt noch", limited: "Eingeschränkt" }[score.level] || "Lernt noch";
    const verdict = `<section class="c verdict">
      <div class="h"><span>${esc(t("Diese Woche"))}</span><span class="grow"></span>${statusPill(scoreTone, `${t(scoreLabel)} · ${score.value ?? "–"}`)}</div>
      <p class="big-say">${sentence} ${esc(tail)}</p>
      ${chart}
      <div class="fd">${esc(t("Punkte: Tages-COP · Band: deine eigene Kennlinie ± Streuung"))}</div>
    </section>`;
    const items = findings.slice(0, 3).map(
      (f) => `<div class="todo-i"><i class="tone-${f.severity === "warning" ? "bad" : "warn"}"></i><span><b>${esc(f.title)}</b><small>${esc(f.text)}</small></span><small>${esc(f.id)}</small></div>`
    );
    const flow = k.flow_deviation && k.flow_deviation.median;
    if (items.length < 3 && flow != null && Math.abs(flow) <= 1) items.push(`<div class="todo-i"><i class="tone-ok"></i><span>${esc(t("Vorlauf passt zur Heizkurve ({v} K)", { v: signed(flow) }))}</span><small>ok</small></div>`);
    if (items.length < 3 && k.starts_per_day != null && th.starts_per_day && k.starts_per_day <= th.starts_per_day)
      items.push(`<div class="todo-i"><i class="tone-ok"></i><span>${esc(t("Takten im Rahmen: {s} Starts, {m} min je Zyklus", { s: fmt(k.starts_per_day, 1), m: fmt(k.runtime_per_cycle, 0) }))}</span><small>ok</small></div>`);
    const lv = live;
    const nowBlock = `<div class="h mt14"><span>${esc(t("Jetzt"))}</span><span class="grow"></span>${lv.running === true ? statusPill("ok", lv.dhwCharging ? t("lädt Warmwasser") : lv.defrost ? t("taut ab") : t("heizt")) : lv.running === false ? statusPill("mut", t("Verdichter aus")) : ""}</div>
    <div class="trio">
      <div><small>${esc(t("Wärme"))}</small><b>${fmt(lv.heat, 1)}<i>kW</i></b></div>
      <div><small>${esc(t("Strom"))}</small><b>${fmt(lv.power, 2)}<i>kW</i></b></div>
      <div><small>${esc(t("COP jetzt"))}</small><b>${fmt(lv.cop, 1)}</b></div>
    </div>`;
    const todo = `<section class="c"><div class="h"><span>${esc(t("Was ist zu tun"))}</span><span class="grow"></span><span>${findings.length ? esc(t("{n} Punkte", { n: findings.length })) : esc(t("nichts"))}</span></div>
    <div class="todo">${items.join("")}</div>${nowBlock}</section>`;
    const last30 = (d.series || []).slice(-30);
    const copTone = !ex || ex.rel == null ? "mut" : ex.rel < -0.08 ? "warn" : "ok";
    const startsTone = k.starts_per_day == null ? "mut" : th.starts_per_day && k.starts_per_day > th.starts_per_day ? "bad" : th.starts_per_day && k.starts_per_day > th.starts_per_day * 0.9 ? "warn" : "ok";
    const runTone = k.runtime_per_cycle == null ? "mut" : k.runtime_per_cycle < (th.runtime_minutes || 20) ? "bad" : "ok";
    const flowTone = flow == null ? "mut" : Math.abs(flow) <= 1 ? "ok" : Math.abs(flow) <= (th.flow_deviation_k || 2) ? "warn" : "bad";
    const col = (tone) => `var(--hz-${tone === "mut" ? "mut" : tone})`;
    const tile = (title, value, unit, sub, tone, tag, spark) => `<div class="c kpi"><div class="h"><span>${esc(title)}</span><span class="grow"></span>${statusPill(tone, tag)}</div><div class="num" style="color:${tone === "mut" ? "inherit" : "inherit"}">${value}<i>${esc(unit)}</i></div><div class="fd">${esc(sub)}</div>${spark}</div>`;
    const kpis = `<div class="k4">
    ${tile(t("COP 7 Tage"), fmt(k.cop_short && k.cop_short.value, 1), "", ex ? t("erwartet bei {o} °C: {e} · 30 Tage {l}", { o: fmt(ex.outdoor, 1), e: fmt(ex.expected, 1), l: fmt(k.cop_long && k.cop_long.value, 1) }) : t("30 Tage {l}", { l: fmt(k.cop_long && k.cop_long.value, 1) }), copTone, copTone === "warn" ? t("unter Erwartung") : t("wie erwartet"), sparkline(last30.map((r) => r.cop), col(copTone)))}
    ${tile(t("Starts / Tag"), fmt(k.starts_per_day, 1), th.starts_per_day ? t("von {v}", { v: fmt(th.starts_per_day, 0) }) : "", t("Schwelle aus den Einstellungen"), startsTone, startsTone === "ok" ? t("im Rahmen") : startsTone === "warn" ? t("an der Grenze") : t("zu viele"), sparkline(last30.map((r) => r.starts), col(startsTone), { kind: "bar" }))}
    ${tile(t("Zyklus"), fmt(k.runtime_per_cycle, 0), "min", t("Ziel über {v} min", { v: fmt(th.runtime_minutes || 20, 0) }), runTone, runTone === "ok" ? t("lang") : t("zu kurz"), sparkline(last30.map((r) => r.cycle_min), col(runTone)))}
    ${tile(t("Vorlauf Ist − Soll"), signed(flow), "K", t("Zielband ±1 K"), flowTone, flowTone === "ok" ? t("passt") : flow > 0 ? t("zu warm") : t("zu kalt"), sparkline(last30.map((r) => r.flow != null && r.target_flow != null ? r.flow - r.target_flow : null), col(flowTone), { ref: 0 }))}
  </div>`;
    return `${say(t("Läuft die Anlage so gut, wie sie bei diesem Wetter kann?"))}
    <div class="grid ov">${verdict}${todo}</div>${kpis}${costStrip(d, ui)}`;
  }
  function costStrip(d, ui) {
    const c = d.kpis && d.kpis.costs || {};
    const m = c.month;
    const w = c.water;
    if (!m && !w) return "";
    const eur = (v) => v == null ? "–" : fmt(v, v >= 100 ? 0 : 2);
    const cell = (label, value, unit, sub) => `<div><small>${esc(t(label))}</small><b>${value}<i>${esc(unit)}</i></b><span>${esc(sub || "")}</span></div>`;
    const cells = [];
    if (m) {
      cells.push(cell("Strom Heizen", eur(m.heating && m.heating.eur), "€", `${fmt(m.heating && m.heating.kwh, 0)} kWh`));
      if (m.dhw) cells.push(cell("Strom Warmwasser", eur(m.dhw.eur), "€", `${fmt(m.dhw.kwh, 0)} kWh`));
    }
    if (w) cells.push(cell("Wasser", eur(w.month_eur), "€", t("{m} m³ · heute {d} m³", { m: fmt(w.month_m3, 2), d: fmt(w.today_m3, 2) })));
    if (m && m.heat_price_ct != null) cells.push(cell("Wärme kostet", fmt(m.heat_price_ct, 1), "ct/kWh", t("Strompreis ÷ COP")));
    const month = (/* @__PURE__ */ new Date()).toLocaleDateString(getLang() === "de" ? "de-DE" : "en-GB", { month: "long" });
    return `<section class="c"><div class="h"><span>${esc(t("Kosten {m}", { m: month }))}</span><span class="grow"></span><span>${esc(c.price_now != null ? t("Preis jetzt {p} €/kWh", { p: fmt(c.price_now, 3) }) : "")}</span>${q("costs", ui)}</div>${hb("costs", ui)}
    <div class="strip">${cells.join("")}</div>
    <div class="fd">${esc(t("Stunde für Stunde mit dem Preis aus deinem Energie-Dashboard gerechnet."))}</div></section>`;
  }
  var LANE_COLORS = { compressor: "var(--hz-heat)", dhw: "var(--hz-vio)", defrost: "var(--hz-cool)", aux: "var(--hz-bad)" };
  function lanes(op) {
    const tl = op && op.timeline || {};
    if (!tl.compressor && !tl.dhw) return "";
    const now = new Date((op.now || Date.now() / 1e3) * 1e3);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      days.push(start);
    }
    const fmtDay = (dt) => dt.toLocaleDateString(getLang() === "de" ? "de-DE" : "en-GB", { weekday: "short" });
    const order = ["compressor", "dhw", "defrost", "aux"];
    const rows = days.map((dayStart) => {
      const a = dayStart.getTime() / 1e3;
      const b = a + 86400;
      let bars = "";
      for (const kind of order) {
        for (const [s, e] of tl[kind] || []) {
          if (e <= a || s >= b) continue;
          const left = (Math.max(s, a) - a) / 86400 * 100;
          const width = Math.max(0.35, (Math.min(e, b) - Math.max(s, a)) / 86400 * 100);
          const top = kind === "compressor" ? "" : " thin";
          bars += `<i class="${kind}${top}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%;background:${LANE_COLORS[kind]}"></i>`;
        }
      }
      return `<div class="lane"><span>${esc(fmtDay(dayStart))}</span><div class="bar">${bars}</div></div>`;
    }).join("");
    const legend = order.filter((kind) => tl[kind]).map((kind) => `<span><i style="background:${LANE_COLORS[kind]}"></i>${esc(t({ compressor: "Verdichter", dhw: "Warmwasser", defrost: "Abtauen", aux: "Heizstab" }[kind]))}</span>`).join("");
    return `<div class="lanes">${rows}<div class="lane ax"><span></span><div><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div></div></div><div class="legend">${legend}</div>`;
  }
  function cycleBars(op, ui) {
    const c = op && op.cycles;
    if (!c || !c.cycles) return `<div class="empty">${esc(t("noch keine Zyklen"))}</div>`;
    const labels = c.bins.map((b, i) => i < c.bins.length - 1 ? `${b}–${c.bins[i + 1]}` : `${b}+`);
    const bins = c.counts.map((n, i) => ({ lower: i, upper: i + 1, mean: n, n, label: labels[i] }));
    const svg = box(ui, "cycles", () => binChart(bins, { h: 180, unit: t("Starts"), digits: 0, color: "var(--hz-cool)" }).replace(/>(\d+)°</g, (m, i) => `>${labels[Number(i)] || ""}<`));
    return `${svg}<div class="fd">${esc(t("{n} Zyklen in 7 Tagen · Median {m} min · {s} % kürzer als 20 min", { n: c.cycles, m: fmt(c.median_min, 0), s: fmt((c.short_share || 0) * 100, 0) }))}</div>`;
  }
  function viewBetrieb(d, ui) {
    const op = d.operation || {};
    const th = d.thresholds || {};
    const k = d.kpis || {};
    const hy = k.hydraulics || {};
    const rows = (d.series || []).slice(-30);
    const c = op.cycles || {};
    const sentence = c.cycles ? t("Der Verdichter startete im Schnitt <b>{s}-mal am Tag</b> und lief <b>{m} Minuten</b> am Stück.", { s: fmt(k.starts_per_day, 1), m: fmt(c.median_min ?? k.runtime_per_cycle, 0) }) : esc(t("Für den Tagesverlauf fehlt noch der Verlauf des Verdichters."));
    const timelineCard = `<section class="c wide"><div class="h"><span>${esc(t("Verdichter je Tag"))}</span><span class="grow"></span><span>${esc(t("letzte 7 Tage · 0–24 Uhr"))}</span>${q("timeline", ui)}</div>${hb("timeline", ui)}${lanes(op) || `<div class="empty">${esc(t("keine Daten"))}</div>`}</section>`;
    const cycleCard = `<section class="c"><div class="h"><span>${esc(t("Laufzeit je Start"))}</span><span class="grow"></span><span>${esc(t("Minuten"))}</span>${q("cycle", ui)}</div>${hb("cycle", ui)}${cycleBars(op, ui)}</section>`;
    const startBins = binByOutdoor(rows, "starts");
    const startsCard = `<section class="c"><div class="h"><span>${esc(t("Starts nach Außentemperatur"))}</span>${q("cycling", ui)}</div>${hb("cycling", ui)}${startBins.length ? box(ui, "b-starts", () => binChart(startBins, { h: 180, ref: th.starts_per_day, unit: t("Starts/Tag"), digits: 0 })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}</section>`;
    const dailyRows = (map, key) => Object.entries(map || {}).map(([day, v]) => ({ day, [key]: v }));
    const spreadRows = dailyRows(hy.spread_daily, "spread");
    const overRows = dailyRows(hy.overshoot_daily, "over");
    const spreadCard = spreadRows.length ? `<section class="c"><div class="h"><span>${esc(t("Spreizung"))}</span><span class="grow"></span><span>${esc(t("Ziel {a}–{b} K", { a: fmt(th.spread_min_k ?? 3, 0), b: fmt(th.spread_max_k ?? 8, 0) }))}</span>${q("spread", ui)}</div>${hb("spread", ui)}${box(ui, "b-spread", () => timeChart(spreadRows, [{ key: "spread", kind: "line", color: "var(--hz-vio)", axis: "l", digits: 1 }], { h: 180, unitL: "K", band: [th.spread_min_k ?? 3, th.spread_max_k ?? 8] }))}<div class="fd">${esc(t("Median {m} K über {n} Laufstunden", { m: fmt(hy.spread && hy.spread.median, 1), n: hy.spread && hy.spread.hours || 0 }))}</div></section>` : "";
    const overCard = overRows.length ? `<section class="c"><div class="h"><span>${esc(t("Puffer-Ladung"))}</span><span class="grow"></span><span>${esc(t("WP-Vorlauf über Puffer-Soll"))}</span>${q("overshoot", ui)}</div>${hb("overshoot", ui)}${box(ui, "b-over", () => timeChart(overRows, [{ key: "over", kind: "line", color: "var(--hz-heat)", axis: "l", digits: 1 }], { h: 180, unitL: "K", band: [0, 5] }))}<div class="fd">${esc(t("Median {m} K · Warmwasser-Ladungen herausgerechnet", { m: fmt(hy.overshoot && hy.overshoot.median, 1) }))}</div></section>` : "";
    const hasDef = rows.some((r) => r.defrost_h != null || r.aux_h != null);
    const defrost = hasDef ? `<section class="c"><div class="h"><span>${esc(t("Abtauen & Heizstab"))}</span>${q("defrost", ui)}</div>${hb("defrost", ui)}${box(ui, "b-def", () => timeChart(rows, [
      { key: "defrost_h", kind: "bar", color: "var(--hz-cool)", axis: "l", stack: true, label: t("Abtauen") },
      { key: "aux_h", kind: "bar", color: "var(--hz-bad)", axis: "l", stack: true, label: t("Heizstab") }
    ], { h: 180, unitL: t("h/Tag") }))}</section>` : "";
    return `${say(sentence)}
    <div class="grid">${timelineCard}</div>
    <div class="grid g2">${cycleCard}${startsCard}</div>
    <div class="grid g2">${spreadCard}${overCard}</div>
    ${defrost ? `<div class="grid g2">${defrost}${dhwTankCard(d, ui)}</div>` : dhwTankCard(d, ui)}`;
  }
  function dhwTankCard(d, ui) {
    const w = d.kpis && d.kpis.hydraulics && d.kpis.hydraulics.dhw || null;
    if (!w || w.temperature == null) return "";
    const cell = (label, value, unit) => `<div><small>${esc(t(label))}</small><b>${value}<i>${esc(unit)}</i></b></div>`;
    return `<section class="c"><div class="h"><span>${esc(t("Warmwasserspeicher"))}</span><span class="grow"></span>${w.charging ? statusPill("warn", t("lädt")) : statusPill("mut", t("lädt nicht"))}${q("dhw_tank", ui)}</div>${hb("dhw_tank", ui)}
    <div class="strip">${cell("Ist / Soll", fmt(w.temperature, 1), w.target != null ? `/ ${fmt(w.target, 1)} °C` : "°C")}${cell("Ladungen / Tag", fmt(w.charges_per_day, 1), "")}${cell("Ladedauer", fmt(w.charge_minutes, 0), "min")}${cell("Abkühlung", fmt(w.cooling_k_per_h, 2), "K/h")}</div></section>`;
  }
  function viewRaeume8(d, ui, liveRooms) {
    const rooms = d.rooms || [];
    const profiles = d.operation && d.operation.room_profiles || {};
    const devices = (d.devices && d.devices.thermostats || []).reduce((acc, x) => (acc[x.room] = x, acc), {});
    const tol = (d.thresholds || {}).room_deviation_k ?? 1;
    const off = rooms.filter((r) => r.deviation && r.deviation.median != null && Math.abs(r.deviation.median) > tol / 2);
    const worst = off.sort((a, b) => Math.abs(b.deviation.median) - Math.abs(a.deviation.median))[0];
    const sentence = worst ? t("<b>{r}</b> ist am häufigsten neben dem Soll: im Median {m} K, {p} % der Zeit {w}.", {
      r: esc(worst.name),
      m: signed(worst.deviation.median),
      p: fmt(((worst.deviation.median > 0 ? worst.deviation.over_share : worst.deviation.under_share) || 0) * 100, 0),
      w: worst.deviation.median > 0 ? t("zu warm") : t("zu kalt")
    }) : esc(t("Alle Räume halten ihr Soll."));
    const hours = Array.from({ length: 24 }, (_, h) => h);
    const head24 = `<tr><th></th>${hours.map((h) => `<th>${h % 3 === 0 ? h : ""}</th>`).join("")}<th></th></tr>`;
    const body = rooms.map((r) => {
      const prof = profiles[r.id] || [];
      const cells = hours.map((h) => `<td class="v" style="background:${thermal(prof[h])}" title="${esc(r.name)} ${h}:00 · ${prof[h] == null ? "–" : signed(prof[h]) + " K"}"></td>`).join("");
      const m = r.deviation && r.deviation.median;
      return `<tr><td class="n">${esc(r.name)}</td>${cells}<td class="m">${m == null ? "–" : signed(m)} K</td></tr>`;
    }).join("");
    const heat = `<section class="c wide"><div class="h"><span>${esc(t("Abweichung zum Soll je Uhrzeit"))}</span><span class="grow"></span><span>${esc(t("7 Tage · Median"))}</span>${q("rooms", ui)}</div>${hb("rooms", ui)}
    <div class="heat"><table>${head24}${body}</table></div>
    <div class="scale"><span>−2 K</span><i></i><span>+2 K</span></div></section>`;
    const cards = rooms.map((r) => {
      const lv = liveRooms[r.climate_entity] || {};
      const dev = devices[r.id] || {};
      const m = r.deviation && r.deviation.median;
      const tone = m == null ? "mut" : Math.abs(m) <= 0.5 ? "ok" : Math.abs(m) <= tol ? "warn" : "bad";
      const tag = m == null ? dev.monitor ? t("nur beobachtet") : t("keine Daten") : tone === "ok" ? t("passt") : m > 0 ? t("zu warm {p} %", { p: fmt((r.deviation.over_share || 0) * 100, 0) }) : t("zu kalt {p} %", { p: fmt((r.deviation.under_share || 0) * 100, 0) });
      const valve = lv.valve ?? dev.valve;
      const heatup = dev.heatup_minutes_2k != null ? t("{m} min für 2 K", { m: fmt(dev.heatup_minutes_2k, 0) }) : r.heating_up_min != null ? t("{m} min", { m: fmt(r.heating_up_min, 0) }) : t("noch zu wenig Fälle");
      const trv = (dev.trvs || []).map((x) => x.device && [x.device.manufacturer, x.device.model].filter(Boolean).join(" ")).filter(Boolean)[0];
      return `<div class="c rcard"><div class="top"><b>${esc(r.name)}</b>${statusPill(tone, tag)}</div>
        <div class="num">${fmt(lv.current, 1)}<i>/ ${fmt(lv.target, 1)} °C</i></div>
        ${valve != null ? `<div class="row2"><span>${esc(t("Ventil"))}</span><span>${fmt(valve, 0)} %</span></div><div class="meter"><i style="width:${Math.min(100, valve)}%"></i></div>` : `<div class="row2"><span>${esc(t("Ventil"))}</span><span>${esc(dev.monitor ? t("ohne Thermostat") : t("meldet keinen Wert"))}</span></div>`}
        <div class="row2"><span>${esc(t("Aufheizen"))}</span><span>${esc(heatup)}</span></div>
        ${trv || dev.battery != null ? `<div class="row2"><span>${esc(trv || t("Fühler"))}</span><span>${dev.battery != null ? esc(t("Batterie {b} %", { b: fmt(dev.battery, 0) })) : ""}</span></div>` : ""}
        <div class="fd">${esc(r.circuit_name || "")}</div></div>`;
    }).join("");
    return `${say(sentence)}<div class="grid">${heat}</div><div class="grid rooms">${cards}</div>`;
  }
  function viewHydraulik(d, ui, live) {
    const circuits = (d.circuits || []).filter((c) => c.type !== "buffer");
    const bufferCircuit = (d.circuits || []).find((c) => c.type === "buffer");
    const rooms = d.rooms || [];
    const lv = live;
    const lc = lv.circuits || {};
    const charging = !!lv.dhwCharging;
    const running2 = lv.running === true;
    const pumpOn = (on) => on ? "pump-rot" : "";
    const flowCls = (on) => on ? "pipe-flow" : "";
    const T = (v) => v == null ? "–" : `${fmt(v, 1)} °C`;
    const nCirc = Math.max(1, circuits.length);
    const cardY = (i) => 30 + i * 120;
    const dhwY = Math.max(310, 30 + nCirc * 120 + 10);
    const H = dhwY + 200;
    const hpCol = pipeColor(lv.flow);
    const retCol = pipeColor(lv.ret);
    const bufCol = pipeColor(lv.buffer);
    let svg = `<svg class="flow" viewBox="0 0 980 ${H}" role="img" aria-label="${esc(t("Fließbild"))}">
  <defs>
    <linearGradient id="g-buf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pipeColor(lv.buffer != null ? lv.buffer + 2 : null)}"/><stop offset="1" stop-color="${pipeColor(lv.buffer != null ? lv.buffer - 6 : null)}"/></linearGradient>
    <linearGradient id="g-dhw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pipeColor(lv.dhw)}"/><stop offset="1" stop-color="${pipeColor(lv.dhw != null ? lv.dhw - 12 : null)}"/></linearGradient>
  </defs>`;
    svg += `<rect x="20" y="150" width="180" height="230" rx="18" class="node"/>
  <text x="38" y="178" class="lbl">${esc(t("WÄRMEPUMPE"))}</text>
  <text x="38" y="216" class="v1">${fmt(lv.heat, 1)} kW</text>
  <text x="38" y="236" class="v3">${esc(t("Wärme · Strom {p} kW", { p: fmt(lv.power, 2) }))}</text>
  <text x="38" y="268" class="v2">COP ${fmt(lv.cop, 1)}</text>
  <text x="38" y="300" class="v3 ${running2 ? "ok" : ""}">● ${esc(running2 ? charging ? t("lädt Warmwasser") : lv.defrost ? t("taut ab") : t("heizt") : t("aus"))}</text>
  <text x="38" y="328" class="v3">${esc(t("Spreizung {s} K", { s: fmt(lv.spread, 1) }))}</text>
  <text x="38" y="346" class="v3">${esc(t("Volumenstrom {v} l/min", { v: fmt(lv.volume, 1) }))}</text>
  <text x="38" y="364" class="v3">${esc(t("außen {o} °C", { o: fmt(lv.outdoor, 1) }))}</text>`;
    const toBuf = running2 && !charging;
    const toDhw = running2 && charging;
    svg += `<path d="M200 200 H260" class="pipe" style="stroke:${hpCol}"/><path d="M200 200 H260" class="dash ${flowCls(running2)}"/>
  <rect x="203" y="176" width="54" height="18" rx="5" class="tag"/><text x="230" y="189" class="tv">${esc(fmt(lv.flow, 1))} °C</text>
  <path d="M260 200 V110 H330" class="pipe" style="stroke:${toBuf ? hpCol : "var(--hz-line)"}"/><path d="M260 200 V110 H330" class="dash ${flowCls(toBuf)}"/>
  <path d="M260 200 V${dhwY + 60} H330" class="pipe" style="stroke:${toDhw ? hpCol : "var(--hz-line)"}"/><path d="M260 200 V${dhwY + 60} H330" class="dash ${flowCls(toDhw)}"/>
  <circle cx="260" cy="200" r="7" class="valve"/>
  <text x="268" y="150" class="v3 sm">${esc(t("Umschaltung"))}</text><text x="268" y="163" class="v3 sm">→ ${esc(charging ? t("Warmwasser") : t("Heizen"))}</text>`;
    svg += `<path d="M330 250 H230 V340 H200" class="pipe" style="stroke:${toBuf || !running2 ? retCol : "var(--hz-line)"}"/><path d="M330 250 H230 V340 H200" class="dash ${flowCls(toBuf)}"/>
  <rect x="237" y="260" width="46" height="18" rx="5" class="tag"/><text x="260" y="273" class="tv">${esc(fmt(lv.ret, 1))} °C</text>
  <circle cx="295" cy="250" r="12" class="pumpc"/><path class="${pumpOn(toBuf)}" d="M295 241 L301 255 L289 255 Z" style="fill:${toBuf ? retCol : "var(--hz-mut)"}"/>
  <path d="M330 ${dhwY + 150} H230 V340" class="pipe" style="stroke:${toDhw ? retCol : "var(--hz-line)"}"/>
  <circle cx="295" cy="${dhwY + 150}" r="12" class="pumpc"/><path class="${pumpOn(lv.dhwPump)}" d="M295 ${dhwY + 141} L301 ${dhwY + 155} L289 ${dhwY + 155} Z" style="fill:${lv.dhwPump ? retCol : "var(--hz-mut)"}"/>`;
    svg += `<rect x="330" y="70" width="110" height="200" rx="55" fill="url(#g-buf)" class="tank"/>
  <text x="385" y="60" class="lbl" text-anchor="middle">${esc(t("PUFFER"))}</text>
  <rect x="348" y="150" width="74" height="40" rx="10" class="glass"/>
  <text x="385" y="168" class="v2s" text-anchor="middle">${esc(T(lv.buffer))}</text>
  <text x="385" y="183" class="v3" text-anchor="middle">${esc(t("Soll {s}", { s: fmt(lv.bufferTarget, 1) }))}</text>`;
    if (bufferCircuit) {
      const bc = lc[bufferCircuit.id] || {};
      svg += `<text x="385" y="290" class="v3" text-anchor="middle">${esc(bufferCircuit.name)} · ${esc(bc.pump ? t("Pumpe an") : t("Pumpe aus"))}</text>`;
    }
    svg += `<rect x="320" y="${dhwY + 30}" width="130" height="150" rx="26" fill="url(#g-dhw)" class="tank"/>
  <text x="385" y="${dhwY + 22}" class="lbl" text-anchor="middle">${esc(t("WARMWASSER"))}</text>
  <rect x="345" y="${dhwY + 85}" width="80" height="40" rx="10" class="glass"/>
  <text x="385" y="${dhwY + 103}" class="v2s" text-anchor="middle">${esc(T(lv.dhw))}</text>
  <text x="385" y="${dhwY + 118}" class="v3" text-anchor="middle">${esc(t("Soll {s}", { s: fmt(lv.dhwTarget, 1) }))}</text>
  <path d="M450 ${dhwY + 60} H515" class="pipe thin" style="stroke:${pipeColor(lv.dhw)}"/><text x="458" y="${dhwY + 50}" class="v3">${esc(t("Zapfung"))}</text>
  <path d="M515 ${dhwY + 160} H450" class="pipe thin" style="stroke:${pipeColor(12)}"/><text x="458" y="${dhwY + 178}" class="v3">${esc(t("Kaltwasser"))}</text>`;
    circuits.forEach((c, i) => {
      const y = cardY(i);
      const cv = lc[c.id] || {};
      const col = pipeColor(cv.temp ?? lv.buffer);
      svg += `<path d="M440 130 H520 V${y + 44} H600" class="pipe mid" style="stroke:${col}"/><path d="M440 130 H520 V${y + 44} H600" class="dash ${flowCls(cv.pump)}"/>
    <rect x="600" y="${y}" width="360" height="100" rx="14" class="node"/>
    <circle cx="626" cy="${y + 44}" r="12" class="pumpc"/><path class="${pumpOn(cv.pump)}" d="M626 ${y + 35} L632 ${y + 49} L620 ${y + 49} Z" style="fill:${cv.pump ? col : "var(--hz-mut)"}"/>
    <text x="648" y="${y + 26}" class="v2s">${esc(c.name)}</text>
    <text x="648" y="${y + 44}" class="v3">${esc(t("Vorlauf {a} · Soll {b}", { a: T(cv.temp), b: T(cv.target) }))}${cv.opening ? " · ↑" : cv.closing ? " · ↓" : ""}</text>`;
      const cr = rooms.filter((r) => String(r.circuit) === String(c.id));
      let x = 648;
      for (const r of cr.slice(0, 8)) {
        const m = r.deviation && r.deviation.median;
        const label = r.name.length > 7 ? r.name.slice(0, 6) + "." : r.name;
        const wdt = Math.max(36, label.length * 6.4 + 12);
        if (x + wdt > 952) break;
        svg += `<g class="rchip"><title>${esc(r.name)}: ${m == null ? "–" : signed(m) + " K"}</title><rect x="${x}" y="${y + 58}" width="${wdt}" height="24" rx="6" style="fill:${m == null ? "var(--hz-soft)" : thermal(m)};fill-opacity:${m == null ? 1 : 0.28};stroke:${m == null ? "var(--hz-line)" : thermal(m)}"/><text x="${x + wdt / 2}" y="${y + 74}" text-anchor="middle" class="cv">${esc(label)}</text></g>`;
        x += wdt + 5;
      }
    });
    const w = d.kpis && d.kpis.hydraulics && d.kpis.hydraulics.dhw || {};
    svg += `<rect x="600" y="${dhwY + 30}" width="360" height="150" rx="14" class="node"/>
  <text x="626" y="${dhwY + 58}" class="v2s">${esc(t("Warmwasser"))}</text>
  <text x="626" y="${dhwY + 76}" class="v3">${esc(charging ? t("lädt gerade") : t("lädt nicht"))}${lv.dhw != null && lv.dhwTarget != null ? esc(" · " + t("{k} K unter Soll", { k: fmt(Math.max(0, lv.dhwTarget - lv.dhw), 1) })) : ""}</text>
  <text x="626" y="${dhwY + 108}" class="v3">${esc(t("Ladungen / Tag"))}</text><text x="626" y="${dhwY + 130}" class="v2">${fmt(w.charges_per_day, 1)}</text>
  <text x="736" y="${dhwY + 108}" class="v3">${esc(t("Ladedauer"))}</text><text x="736" y="${dhwY + 130}" class="v2">${fmt(w.charge_minutes, 0)} min</text>
  <text x="846" y="${dhwY + 108}" class="v3">${esc(t("Abkühlung"))}</text><text x="846" y="${dhwY + 130}" class="v2">${fmt(w.cooling_k_per_h, 2)} K/h</text>`;
    const water = d.kpis && d.kpis.costs && d.kpis.costs.water;
    if (water) svg += `<text x="626" y="${dhwY + 162}" class="v3">${esc(t("Wasser heute {d} m³ · Monat {m} m³", { d: fmt(water.today_m3, 2), m: fmt(water.month_m3, 2) }))}</text>`;
    svg += `</svg>`;
    const sentence = running2 ? charging ? t("Die Wärmepumpe <b>lädt gerade Warmwasser</b> ({a} von {b} °C).", { a: fmt(lv.dhw, 1), b: fmt(lv.dhwTarget, 1) }) : t("Die Wärmepumpe <b>heizt den Puffer</b> mit {f} °C, der Puffer hat {p} °C bei {s} °C Soll.", { f: fmt(lv.flow, 1), p: fmt(lv.buffer, 1), s: fmt(lv.bufferTarget, 1) }) : t("Der Verdichter steht. Der Puffer hält {p} °C bei {s} °C Soll.", { p: fmt(lv.buffer, 1), s: fmt(lv.bufferTarget, 1) });
    const rowsCirc = circuits.map((c) => {
      const fl = c.flow || {};
      const dv = fl.deviation && fl.deviation.median;
      const tone = dv == null ? "mut" : Math.abs(dv) <= 1 ? "ok" : Math.abs(dv) <= 2 ? "warn" : "bad";
      const run = c.pump && c.pump.run_share;
      return `<div class="c rcard"><div class="top"><b>${esc(c.name)}</b>${statusPill(tone, dv == null ? t("kein Soll") : t("Median {m} K", { m: signed(dv) }))}</div>
        <div class="row2"><span>${esc(t("Pumpe läuft"))}</span><span>${run == null ? "–" : fmt(run * 100, 0) + " %"}</span></div>
        <div class="row2"><span>${esc(t("Mischer-Impulse"))}</span><span>${c.mixer && c.mixer.pulses_per_day != null ? fmt(c.mixer.pulses_per_day, 0) + " " + t("/Tag") : "–"}</span></div>
        <div class="row2"><span>${esc(t("Räume"))}</span><span>${esc((c.rooms || []).join(", ") || "–")}</span></div></div>`;
    }).join("");
    return `${say(sentence, t("Werte live aus Home Assistant"))}
    <section class="c wide"><div class="h"><span>${esc(t("Fließbild"))}</span>${q("schema", ui)}</div>${hb("schema", ui)}<div class="flowwrap">${svg}</div>
    <div class="fd">${esc(t("Rohrfarbe = Temperatur. Die Strichlinie läuft nur, wenn die Pumpe läuft. Raum-Chips zeigen die Abweichung zum Soll (7 Tage)."))}</div></section>
    <div class="grid g3">${rowsCirc}</div>`;
  }
  function devicesBlock(d) {
    const dv = d.devices || {};
    const hp = dv.heat_pump;
    const label = (x) => x ? [x.manufacturer, x.model].filter(Boolean).join(" · ") || x.name || "" : "";
    const hpCard = `<div class="c dcard"><div class="top"><b>${esc(t("Wärmepumpe"))}</b>${hp ? statusPill("ok", t("erkannt")) : statusPill("mut", t("nicht im Register"))}</div>
    <div class="md">${esc(label(hp) || "–")}</div>${hp && hp.sw_version ? `<div class="row2"><span>${esc(t("Firmware"))}</span><span>${esc(hp.sw_version)}</span></div>` : ""}</div>`;
    const pumps = (dv.pumps || []).map((p) => `<div class="row2"><span>${esc(p.name)}</span><span>${p.on == null ? "–" : p.on ? esc(t("läuft")) : esc(t("aus"))}</span></div>`).join("");
    const pumpCard = `<div class="c dcard"><div class="top"><b>${esc(t("Pumpen ({n} erkannt)", { n: (dv.pumps || []).length }))}</b></div>${pumps || `<div class="fd">${esc(t("keine Pumpe zugeordnet"))}</div>`}
    <div class="fd">${esc(t("Modell und Stufe je Pumpe unten im Inventar ergänzen – der Katalog füllt Datenblattwerte vor."))}</div></div>`;
    const ths = (dv.thermostats || []).map((x) => {
      const trv = (x.trvs || []).map((r) => label(r.device)).filter(Boolean).join(", ");
      return `<tr><td>${esc(x.name)}</td><td>${esc(trv || (x.monitor ? t("ohne Thermostat") : "–"))}</td><td>${x.valve == null ? "–" : fmt(x.valve, 0) + " %"}</td><td>${x.battery == null ? "–" : `<span class="${x.battery_low ? "tone-bad" : ""}">${fmt(x.battery, 0)} %</span>`}</td><td>${x.heatup_minutes_2k == null ? "–" : fmt(x.heatup_minutes_2k, 0) + " min"}</td></tr>`;
    }).join("");
    const thCard = `<div class="c dcard wide"><div class="top"><b>${esc(t("Thermostate und Räume"))}</b></div>
    <div class="tscroll"><table class="tbl"><tr><th>${esc(t("Raum"))}</th><th>${esc(t("Thermostat"))}</th><th>${esc(t("Ventil"))}</th><th>${esc(t("Batterie"))}</th><th>${esc(t("Aufheizen 2 K"))}</th></tr>${ths}</table></div>
    <div class="fd">${esc(t("Aus dem Geräteregister und aus Raumklima. Nichts davon muss von Hand eingetragen werden."))}</div></div>`;
    return `<div class="grid g2">${hpCard}${pumpCard}</div><div class="grid">${thCard}</div>`;
  }

  // src/views.js
  var VIEWS = ["anlage", "effizienz", "betrieb", "raeume", "schema", "vergleich", "inventar", "protokoll"];
  function box2(ui, id, fn) {
    const w = ui.widths && ui.widths[id] || 640;
    return `<div class="cbox" data-cid="${id}">${withWidth(w, fn)}</div>`;
  }
  function header(d, view) {
    return header8(d, view);
  }
  function copFit2(d) {
    return linearFit(d.series.filter((r) => r.cop != null && r.outdoor != null && r.cop < 12).map((r) => ({ x: r.outdoor, y: r.cop })));
  }
  function costsCard(d, ui) {
    const c = d.kpis && d.kpis.costs || {};
    const m = c.month;
    const w = c.water;
    if (!m && !w) return "";
    const eur = (v) => v == null ? "–" : fmt(v, v >= 100 ? 0 : 2);
    const tile = (label, value, unit, sub) => `<div class="lv"><div class="muted">${esc(t(label))}</div><div class="big">${value}<small>${esc(unit)}</small></div>${sub ? `<div class="fd">${esc(sub)}</div>` : ""}</div>`;
    const tiles = [];
    if (m) {
      tiles.push(tile("Strom Heizen", eur(m.heating && m.heating.eur), "€", `${fmt(m.heating && m.heating.kwh, 0)} kWh`));
      if (m.dhw) tiles.push(tile("Strom Warmwasser", eur(m.dhw.eur), "€", `${fmt(m.dhw.kwh, 0)} kWh`));
      if (m.heat_price_ct != null) tiles.push(tile("Wärme kostet", fmt(m.heat_price_ct, 1), "ct/kWh", t("Strompreis ÷ COP")));
    }
    if (w) tiles.push(tile("Wasser", eur(w.month_eur), "€", t("{m} m³ · heute {d} m³", { m: fmt(w.month_m3, 2), d: fmt(w.today_m3, 2) })));
    const price = c.price_now != null ? t("Preis jetzt {p} €/kWh", { p: fmt(c.price_now, 3) }) : "";
    return `<div class="c">${head(t("Kosten diesen Monat"), "costs", ui, esc(price))}<div class="lvgrid">${tiles.join("")}</div>
    <div class="fd mt8">${esc(t("Stunde für Stunde mit dem Preis aus deinem Energie-Dashboard gerechnet."))}</div></div>`;
  }
  function copCurveCard(d, ui, fit) {
    const rows = d.series.filter((r) => r.cop != null && r.outdoor != null && r.cop < 12);
    const today = rows[rows.length - 1];
    const pts = rows.map((r, i) => ({ x: r.outdoor, y: r.cop, title: `${dayLabel(r.day)}: COP ${fmt(r.cop)} · ${fmt(r.outdoor)} °C`, opacity: 0.25 + 0.55 * (i / Math.max(1, rows.length - 1)) }));
    const xs = rows.map((r) => r.outdoor);
    const lines = fit && xs.length ? [{ color: "var(--hz-ok)", points: [{ x: Math.min(...xs), y: fit.at(Math.min(...xs)) }, { x: Math.max(...xs), y: fit.at(Math.max(...xs)) }] }] : [];
    const svg = box2(ui, "copcurve", () => scatterChart(pts, { unitY: "COP", lines, highlight: today ? { x: today.outdoor, y: today.cop, label: `${t("heute")} ${fmt(today.cop)}` } : null }));
    return `<div class="c">${head(t("COP-Kennlinie"), "copcurve", ui, esc(t("Tages-COP gegen Außentemperatur")))}${svg || `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i class="sw-ok"></i>${esc(t("eigene Anlage"))} (${rows.length} ${esc(t("Tage"))})</span>${fit ? `<span>${esc(t("Kennlinie"))}: COP ≈ ${fmt(fit.a, 2)} ${fit.b >= 0 ? "+" : "−"} ${fmt(Math.abs(fit.b), 3)} × T</span>` : ""}</div></div>`;
  }
  function energyCard(d, ui, days) {
    const rows = rangeRows(d.series, days).map((r) => ({ ...r, space: r.heat != null && r.dhw != null ? Math.max(0, r.heat - r.dhw) : r.heat }));
    const hasDhw = rows.some((r) => r.dhw != null);
    const series = hasDhw ? [
      { key: "space", kind: "bar", color: "var(--hz-heat)", axis: "l", stack: true, label: t("Wärme") },
      { key: "dhw", kind: "bar", color: "var(--hz-vio)", axis: "l", stack: true, label: t("Warmwasser") },
      { key: "power", kind: "line", color: "var(--hz-cool)", axis: "l", label: t("Strom") }
    ] : [
      { key: "heat", kind: "bar", color: "var(--hz-heat)", axis: "l", label: t("Wärme") },
      { key: "power", kind: "line", color: "var(--hz-cool)", axis: "l", label: t("Strom") }
    ];
    const sumHeat = rows.reduce((s, r) => s + (r.heat || 0), 0);
    const sumPower = rows.reduce((s, r) => s + (r.power || 0), 0);
    return `<div class="c">${head(t("Energie"), "energy", ui, `${days} ${esc(t("Tage"))}`)}${box2(ui, `energy${days}`, () => timeChart(rows, series, { unitL: "kWh" }))}
    <div class="legend"><span><i class="sw-heat"></i>${esc(t("Wärme"))} ${fmt(sumHeat, 0)} kWh</span>${hasDhw ? `<span><i class="sw-vio"></i>${esc(t("Warmwasser"))}</span>` : ""}<span><i class="sw-cool"></i>${esc(t("Strom"))} ${fmt(sumPower, 0)} kWh</span></div></div>`;
  }
  function viewEffizienz(d, ui) {
    const days = ui.range ?? 90;
    const rows = rangeRows(d.series, days);
    const seg = `<div class="seg">${[[30, "30 Tage"], [90, "90 Tage"], [365, "1 Jahr"]].map(([v, l]) => `<button data-range="${v}" class="${days === v ? "on" : ""}">${esc(t(l))}</button>`).join("")}</div>`;
    const markers = (d.changes || []).filter((c) => c.day).map((c) => ({ day: c.day, label: `${c.object} ${c.field}: ${c.old ?? ""} → ${c.new ?? ""}` }));
    const copLine = `<div class="c">${head(t("COP-Verlauf"), "copline", ui)}${box2(ui, "copline", () => timeChart(rows, [
      { key: "cop", kind: "area", color: "var(--hz-ok)", axis: "l", digits: 2 },
      { key: "outdoor", kind: "line", color: "var(--hz-cool)", axis: "r", width: 1.6, dash: "4 3" }
    ], { unitL: "COP", unitR: "°C", markers }))}
    <div class="legend"><span><i class="sw-ok"></i>COP</span><span><i class="sw-cool"></i>${esc(t("Außentemperatur"))}</span>${markers.length ? `<span><i class="sw-vio"></i>${esc(t("Änderung"))}</span>` : ""}</div></div>`;
    const curveRows = rows.filter((r) => r.outdoor != null && (r.flow != null || r.target_flow != null));
    const flowPts = curveRows.filter((r) => r.flow != null).map((r) => ({ x: r.outdoor, y: r.flow, color: "var(--hz-heat)", opacity: 0.7, title: `${dayLabel(r.day)} ${t("Vorlauf")} ${fmt(r.flow)} °C` }));
    const tgtPts = curveRows.filter((r) => r.target_flow != null).map((r) => ({ x: r.outdoor, y: r.target_flow, color: "var(--hz-cool)", opacity: 0.55, r: 3.4, title: `${dayLabel(r.day)} ${t("Soll-Vorlauf")} ${fmt(r.target_flow)} °C` }));
    const fitF = linearFit(flowPts.map((p) => ({ x: p.x, y: p.y })));
    const fitT = linearFit(tgtPts.map((p) => ({ x: p.x, y: p.y })));
    const xs = curveRows.map((r) => r.outdoor);
    const lineOf = (fit, color, dash) => fit && xs.length ? [{ color, dash, points: [{ x: Math.min(...xs), y: fit.at(Math.min(...xs)) }, { x: Math.max(...xs), y: fit.at(Math.max(...xs)) }] }] : [];
    const curve = `<div class="c">${head(t("Heizkurve"), "curve", ui)}${box2(ui, "curve", () => scatterChart(flowPts.concat(tgtPts), { unitY: "°C", lines: lineOf(fitF, "var(--hz-heat)").concat(lineOf(fitT, "var(--hz-cool)", "6 4")) })) || `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i class="sw-heat"></i>${esc(t("Vorlauf"))}</span><span><i class="sw-cool"></i>${esc(t("Soll-Vorlauf"))}</span></div></div>`;
    const th = d.thresholds || {};
    const startBins = binByOutdoor(rows, "starts");
    const cycling = `<div class="c">${head(t("Takten"), "cycling", ui, esc(t("Starts pro Tag nach Außentemperatur")))}${startBins.length ? box2(ui, "cycling", () => binChart(startBins, { ref: th.starts_per_day, unit: t("Starts/Tag"), digits: 0 })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
    const cycle = `<div class="c">${head(t("Laufzeit je Zyklus"), "cycle", ui)}${rows.some((r) => r.cycle_min != null) ? box2(ui, "cycle", () => timeChart(rows, [{ key: "cycle_min", kind: "line", color: "var(--hz-cool)", axis: "l", digits: 0 }], { unitL: "min", refL: th.runtime_minutes })) : ""}${rows.some((r) => r.cycle_min != null) ? "" : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
    const hasDef = rows.some((r) => r.defrost_h != null || r.aux_h != null);
    const defrost = `<div class="c">${head(t("Abtauen & Heizstab"), "defrost", ui)}${hasDef ? box2(ui, "defrost", () => timeChart(rows, [
      { key: "defrost_h", kind: "bar", color: "var(--hz-cool)", axis: "l", stack: true, label: t("Abtauen") },
      { key: "aux_h", kind: "bar", color: "var(--hz-bad)", axis: "l", stack: true, label: t("Heizstab") }
    ], { unitL: t("h/Tag") })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i class="sw-cool"></i>${esc(t("Abtauen"))}</span><span><i class="sw-bad"></i>${esc(t("Heizstab"))}</span></div></div>`;
    const heat = rows.reduce((s, r) => s + (r.heat || 0), 0);
    const dhw = rows.reduce((s, r) => s + (r.dhw || 0), 0);
    const dhwCard = rows.some((r) => r.dhw != null) ? `<div class="c">${head(t("Warmwasseranteil"), "dhw", ui)}<div class="big">${fmt(heat ? dhw / heat * 100 : null, 0)}<small>%</small></div><div class="meter"><i style="width:${heat ? Math.min(100, dhw / heat * 100) : 0}%;background:var(--hz-vio)"></i></div><div class="muted mt8">${fmt(dhw, 0)} / ${fmt(heat, 0)} kWh</div></div>` : "";
    const hy = d.kpis && d.kpis.hydraulics || {};
    const dailyRows = (map, key) => Object.entries(map || {}).map(([day, v]) => ({ day, [key]: v }));
    const spreadRows = dailyRows(hy.spread_daily, "spread");
    const overRows = dailyRows(hy.overshoot_daily, "over");
    const spreadCard = spreadRows.length ? `<div class="c">${head(t("Spreizung"), "spread", ui, esc(t("WP-Vorlauf − WP-Rücklauf, nur Laufstunden")))}${box2(ui, "spread", () => timeChart(spreadRows, [{ key: "spread", kind: "line", color: "var(--hz-vio)", axis: "l", digits: 1 }], { unitL: "K", refL: th.spread_min_k }))}
      <div class="legend"><span>${esc(t("Median {m} K · Ziel {a}–{b} K", { m: fmt(hy.spread && hy.spread.median, 1), a: fmt(th.spread_min_k, 0), b: fmt(th.spread_max_k, 0) }))}</span></div></div>` : "";
    const overCard = overRows.length ? `<div class="c">${head(t("Puffer-Ladung"), "overshoot", ui, esc(t("WP-Vorlauf − Puffer-Soll")))}${box2(ui, "overshoot", () => timeChart(overRows, [{ key: "over", kind: "line", color: "var(--hz-heat)", axis: "l", digits: 1 }], { unitL: "K", refL: 0 }))}
      <div class="legend"><span>${esc(t("Median {m} K über Puffer-Soll", { m: fmt(hy.overshoot && hy.overshoot.median, 1) }))}</span></div></div>` : "";
    void spreadCard;
    void overCard;
    void cycling;
    void cycle;
    void defrost;
    const cop = (d.kpis && d.kpis.cop_short && d.kpis.cop_short.value) ?? null;
    const total = d.kpis && d.kpis.cop_total_short && d.kpis.cop_total_short.value;
    const sentence = cop != null ? t("COP <b>{c}</b> in den letzten 7 Tagen, mit Warmwasser {w}. Wo der Rest bleibt, zeigen Heizkurve, Warmwasseranteil und Kennlinie.", { c: fmt(cop, 1), w: fmt(total, 1) }) : esc(t("Noch keine Daten für die Effizienz."));
    return `<div class="say"><p>${sentence}</p></div><div class="row">${seg}</div>
    <div class="grid g2">${copLine}${copCurveCard(d, ui, copFit2(d))}</div>
    <div class="grid g2">${curve}${energyCard(d, ui, days)}</div>
    ${dhwCard ? `<div class="grid g2">${dhwCard}${costsCard(d, ui)}</div>` : ""}`;
  }
  function viewVergleich(d, ui) {
    const fit = copFit2(d);
    const changes = d.changes || [];
    const delta = (a, b, digits, betterUp = true) => {
      if (a == null || b == null) return "";
      const diff = b - a;
      const good = betterUp ? diff > 0 : diff < 0;
      return ` <span class="pill tone-${Math.abs(diff) < 1e-9 ? "mut" : good ? "ok" : "warn"}">${signed(diff, digits)}</span>`;
    };
    const fieldName = (object2, field2) => {
      const hit = comparisonFields(d, object2).find((item) => item.key === field2);
      return hit ? hit.label : field2;
    };
    const list = changes.length ? changes.map((c) => {
      const b = c.before;
      const a = c.after;
      const adj = weatherAdjusted(b, a, fit);
      const what = `${objectName(d, c.object)}${c.field ? ` · ${fieldName(c.object, c.field)}` : ""}`;
      const val = c.old != null || c.new != null ? `: ${c.old ?? "–"} → ${c.new ?? "–"}` : "";
      const cmp = a && a.days >= 3 && b ? `<div class="cmp">
                <div>COP<b>${fmt(b.cop, 2)} → ${fmt(a.cop, 2)}${delta(b.cop, a.cop, 2)}</b></div>
                ${adj && adj.adjusted != null ? `<div>${esc(t("wetterbereinigt"))}<b><span class="pill tone-${Math.abs(adj.adjusted) < 0.05 ? "mut" : adj.adjusted > 0 ? "ok" : "warn"}">${signed(adj.adjusted, 2)}</span></b></div>` : ""}
                <div>${esc(t("Starts/Tag"))}<b>${fmt(b.starts_per_day, 1)} → ${fmt(a.starts_per_day, 1)}${delta(b.starts_per_day, a.starts_per_day, 1, false)}</b></div>
                <div>${esc(t("Zyklus (min)"))}<b>${fmt(b.runtime_per_cycle_min, 0)} → ${fmt(a.runtime_per_cycle_min, 0)}${delta(b.runtime_per_cycle_min, a.runtime_per_cycle_min, 0)}</b></div>
                <div>${esc(t("Ø außen"))}<b>${fmt(b.outdoor, 1)} → ${fmt(a.outdoor, 1)} °C</b></div>
              </div>` : `<div class="fd">${esc(t("noch zu wenig Tage danach"))}</div>`;
      return `<div class="chg"><span class="d"></span><div><div class="t">${esc(dayLabel(c.day))} ${esc(what)}${esc(val)}</div>${c.note ? `<div class="fd">${esc(c.note)}</div>` : ""}${cmp}</div></div>`;
    }).join("") : empty(t("Noch keine Änderung eingetragen. Trag z. B. „Heizkurve 0,6 → 0,5“ ein – nach ein paar Tagen siehst du hier, was es gebracht hat."));
    const targets = targetChoices(d);
    const object = targets.some((item) => item.value === ui.chgObject) ? ui.chgObject : "heizkurve";
    const options = comparisonFields(d, object);
    const field = options.some((item) => item.key === ui.chgField) ? ui.chgField : options[0].key;
    const old = currentValue(d, object, field);
    const labels = options.map((item) => ({ value: item.key, label: `${item.label}${item.unit ? ` (${item.unit})` : ""}` }));
    const form = ui.form ? `<form class="log" data-form="log">
        ${selectField({ name: "object", label: t("Was"), value: object, options: targets, attrs: 'data-chg="object"' })}
        ${selectField({ name: "field", label: t("Einstellung"), value: field, options: labels, attrs: 'data-chg="field"' })}
        ${textField({ name: "old_value", label: t("Alt"), value: old, placeholder: "0,6" })}
        ${textField({ name: "new_value", label: t("Neu"), placeholder: "0,5" })}
        <div class="span2">${textField({ name: "note", label: t("Notiz") })}</div>
        <div class="row span2">${button(t("Speichern"), { type: "submit", variant: "primary" })}${button(t("Abbrechen"), { act: "form-close" })}</div>
      </form>` : `<div class="row start">${button(`+ ${t("Änderung eintragen")}`, { act: "form-open" })}</div>`;
    return `<div class="intro">${esc(t("{n} eingetragene Änderungen – Wirkung ab drei Tagen danach.", { n: changes.length }))}</div>
    <div class="grid g2"><div class="c">${head(t("Änderungen und ihre Wirkung"), "changes", ui)}${list}${form}</div>${viewEffizienzCopOnly(d, ui)}</div>`;
  }
  function viewEffizienzCopOnly(d, ui) {
    const rows = rangeRows(d.series, 90);
    const markers = (d.changes || []).filter((c) => c.day).map((c) => ({ day: c.day, label: `${c.object} ${c.field}` }));
    return `<div class="c">${head(t("COP-Verlauf"), "copline", ui, `90 ${esc(t("Tage"))}`)}${box2(ui, "copline90", () => timeChart(rows, [
      { key: "cop", kind: "area", color: "var(--hz-ok)", axis: "l", digits: 2 },
      { key: "outdoor", kind: "line", color: "var(--hz-cool)", axis: "r", width: 1.6, dash: "4 3" }
    ], { unitL: "COP", unitR: "°C", markers })) || `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
  }
  var INV_ERRORS = {
    required: "Pflichtfeld",
    not_found: "Entity nicht gefunden",
    unit: "Einheit passt nicht",
    number: "Bitte eine Zahl eintragen",
    range: "Wert außerhalb des Bereichs",
    option: "Bitte aus der Liste wählen",
    reference: "Verweis nicht gefunden",
    unknown: "Feld ist unbekannt",
    length: "Text ist zu lang",
    section: "Bereich ist unbekannt",
    _: "Wert prüfen"
  };
  function invErrorText(code) {
    return t(INV_ERRORS[code] || INV_ERRORS._);
  }
  function invInputs(d, ui, section, state) {
    const fields = sectionFields(d, section);
    const errors = state.errors || {};
    const editing = Boolean(state.object);
    const catalog = (d.inventory_catalog || {})[section] || [];
    const groups = [];
    if (catalog.length) {
      const byManufacturer = /* @__PURE__ */ new Map();
      for (const entry of catalog) {
        const manufacturer = entry.manufacturer || "";
        if (!byManufacturer.has(manufacturer)) byManufacturer.set(manufacturer, []);
        byManufacturer.get(manufacturer).push({
          value: entry.id,
          label: { de: entry.model || entry.id, en: entry.model || entry.id },
          attrs: `data-fields="${esc(JSON.stringify(entry.fields || {}))}" data-note="${esc(localized(entry.note) || "")}"`
        });
      }
      for (const [manufacturer, options] of byManufacturer) {
        groups.push({ label: { de: manufacturer, en: manufacturer }, options });
      }
    }
    const catalogField = groups.length ? `<div class="span2">${selectField({
      name: `cat_${section}`,
      label: t("Modell aus Katalog"),
      value: "",
      options: [{ value: "", label: { de: "– Freitext –", en: "– free text –" } }],
      groups,
      attrs: `data-catalog="${section}"`
    })}<div class="fd mt6" data-cat-note></div></div>` : "";
    return catalogField + fields.map((spec) => {
      const value = state.values && state.values[spec.key] != null ? state.values[spec.key] : "";
      const name = `f_${spec.key}`;
      const error = errors[spec.key] ? invErrorText(errors[spec.key]) : "";
      const label = localized(spec.label) || spec.key;
      if (spec.type === "select" || spec.type === "room" || spec.type === "circuit") {
        const options = spec.options || [];
        return `<div class="span2">${selectField({ name, label, value, options, error })}</div>`;
      }
      const attrs = spec.type === "number" ? `${spec.min != null ? ` min="${spec.min}"` : ""}${spec.max != null ? ` max="${spec.max}"` : ""}${spec.step != null ? ` step="${spec.step}"` : ""}` : "";
      return `<div class="span2">${textField({ name, label, value, type: spec.type === "number" ? "number" : "text", unit: spec.unit || "", error, attrs })}</div>`;
    }).join("") + (editing ? "" : "");
  }
  function invSelectionField(d, ui, section, state) {
    const hint = sectionSelectionHint(section);
    if (!hint) return "";
    const source = section === "pumps" ? d.circuits || [] : d.rooms || [];
    const options = source.map((item) => ({ value: item.id, label: { de: item.name || item.id, en: item.name || item.id } }));
    const error = state.errors && state.errors.selection ? invErrorText(state.errors.selection) : "";
    return `<div class="span2">${selectField({
      name: "selection",
      label: localized(hint),
      value: state.selection || "",
      options: [{ value: "", label: { de: "– bitte wählen –", en: "– please choose –" } }, ...options],
      error,
      attrs: 'data-inv-selection="1"'
    })}</div>`;
  }
  function invForm(d, ui) {
    const state = ui.invForm;
    if (!state) return "";
    const section = state.section;
    const editing = Boolean(state.object);
    const title = sectionTitle(d, section);
    return `<form class="log invform" data-form="inventory">
      <div class="formhead span2"><b>${esc(editing ? t("{s} bearbeiten", { s: title }) : t("{s} ergänzen", { s: title }))}</b></div>
      <input type="hidden" name="section" value="${esc(section)}">
      ${editing ? `<input type="hidden" name="object" value="${esc(state.object)}">` : invSelectionField(d, ui, section, state)}
      ${invInputs(d, ui, section, state)}
      <div class="span2">${textField({ name: "note", label: t("Grund (optional)"), value: state.note || "", placeholder: t("z. B. Voreinstellung geändert") })}</div>
      ${state.message ? `<div class="ferr span2" role="alert">${esc(state.message)}</div>` : ""}
      <div class="row span2">${button(t("Speichern"), { type: "submit", variant: "primary" })}${button(t("Abbrechen"), { act: "inv-close" })}</div>
    </form>`;
  }
  function invTable(d, ui, section) {
    const entries = objectEntries(d, section);
    const fields = sectionFields(d, section).filter((item) => item.key !== "notes");
    const used = fields.filter((spec) => entries.some((entry) => entry.record[spec.key] != null && entry.record[spec.key] !== ""));
    const first = section === "pumps" ? t("Heizkreis") : section === "hydraulics" ? t("Objekt") : t("Raum");
    const cols = [first, ...used.map((spec) => localized(spec.label) || spec.key), ""];
    const rows = entries.map((entry) => {
      const name = section === "hydraulics" ? localized((schemaOf(d).hydraulics || {}).title) : objectName(d, entry.object);
      const notes = entry.record.notes ? `<div class="fd">${esc(entry.record.notes)}</div>` : "";
      return [
        `<b>${esc(name)}</b>${notes}`,
        ...used.map((spec) => esc(entry.record[spec.key] ?? "")),
        `<span class="rowact">${button(t("Bearbeiten"), { act: "inv-edit", attrs: `data-object="${esc(entry.object)}" data-section="${esc(section)}"` })}${button(t("Löschen"), { act: "inv-del", variant: "ghost danger", attrs: `data-object="${esc(entry.object)}" data-section="${esc(section)}"` })}</span>`
      ];
    });
    return table({ cols, rows, emptyText: t("Noch nichts eingetragen."), cls: "invtable" });
  }
  function viewInventar(d, ui) {
    const inventory = d.inventory || {};
    const completeness = d.inventory_completeness || { percent: 0, sections: {} };
    const percent = completeness.percent || 0;
    const count = ["pumps", "thermostats", "hydraulics", "radiators"].reduce(
      (sum, section) => sum + objectEntries(d, section).length,
      0
    );
    const intro = `<div class="intro"><span>${esc(t("Inventar zu {p} % vollständig · {n} Einträge", { p: percent, n: count }))}</span>${progress(percent)}</div>`;
    const sections = ["pumps", "thermostats", "hydraulics", "radiators"].map((section) => {
      const info = (completeness.sections || {})[section] || {};
      const hint = info.hint && (info.percent || 0) < 100 ? `<div class="fd mt6">${esc(localized(info.hint))}</div>` : "";
      const body = `${invTable(d, ui, section)}${hint}<div class="row start">${button(`+ ${t("Eintrag hinzufügen")}`, { act: "inv-add", attrs: `data-section="${esc(section)}"` })}</div>`;
      return card(sectionTitle(d, section), "inventory", ui, body, info.percent != null ? `${info.percent} %` : "");
    }).join("");
    const prefill = (d.rooms || []).length ? `<div class="row start">${button(t("Aus Räumen übernehmen"), { act: "inv-prefill" })}<span class="muted">${esc(t("Legt Thermostat und Heizkörper je Raum an, ohne Werte zu erfinden."))}</span></div>` : "";
    const csv = `<details class="impexp"><summary>${esc(t("CSV Import und Export"))}</summary>
      <p class="muted">${esc(t("Format: object,field,value – eine Zeile je Wert."))}</p>
      <div class="row start">${button(t("CSV herunterladen"), { act: "inv-export" })}</div>
      <textarea name="inv-csv" data-inv-csv rows="5" placeholder="pumps.hk1,manufacturer,Hersteller"></textarea>
      <div class="row start">${button(t("CSV übernehmen"), { act: "inv-import" })}<span class="muted">${esc(t("Bestehende Werte werden ergänzt."))}</span></div>
    </details>`;
    const saved = ui.invSaved ? `${banner("ok", t("Gespeichert. Vergleiche die Wirkung nach frühestens 14 Tagen."))}<div class="row start">${button(t("Jetzt zum Vergleich"), { act: "goto-vergleich" })}</div>` : "";
    return `${intro}${saved}
    <div class="grid g2">
      <div class="grid">${sections}</div>
      <div class="grid">
        ${card(t("Inventar"), "inventory", ui, `${prefill}${invForm(d, ui)}${csv}
          <div class="row start">${button(t("Bericht herunterladen"), { act: "report" })}</div>`)}
        ${card(t("Datenquellen"), "sources", ui, sourceList(d))}
      </div>
    </div>`;
  }
  function sourceList(d) {
    const labels = {
      power_entity: "Strom",
      heat_entity: "Wärme",
      outdoor_entity: "Außentemperatur",
      compressor_entity: "Verdichter",
      power_fallback_entity: "Strom (Ersatz)",
      dhw_heat_entity: "Warmwasser",
      flow_entity: "Vorlauf",
      target_flow_entity: "Soll-Vorlauf",
      return_entity: "WP-Rücklauf",
      buffer_entity: "Puffer",
      defrost_entity: "Abtauen",
      aux_heater_entity: "Heizstab",
      compressor_starts_entity: "Starts",
      compressor_runtime_entity: "Laufzeit",
      compressor_runtime_extra_entity: "Laufzeit (2. Zähler)",
      hp_flow_entity: "WP-Vorlauf",
      volume_flow_entity: "Volumenstrom",
      power_now_entity: "Leistung jetzt",
      dhw_power_entity: "Warmwasser-Strom",
      dhw_operation_entity: "Warmwasserbetrieb",
      dhw_temp_entity: "Speicher Ist",
      dhw_target_entity: "Speicher Soll",
      dhw_pump_entity: "Warmwasser-Ladepumpe"
    };
    return Object.entries(d.sources || {}).map(([key, ok]) => `<div class="src"><span>${esc(labels[key] ? t(labels[key]) : key)}</span>${statusPill(ok ? "ok" : "mut", ok ? t("verbunden") : t("fehlt"))}</div>`).join("");
  }
  var LEVELS_LOG = [
    ["error", "Fehler"],
    ["warn", "Warnung"],
    ["info", "Info"]
  ];
  var CATS_LOG = [
    ["start", "Start"],
    ["update", "Auswertung"],
    ["source", "Quelle"],
    ["finding", "Hinweis"],
    ["config", "Konfiguration"],
    ["inventory", "Inventar"],
    ["dashboard", "Dashboard"],
    ["frontend", "Karte"],
    ["error", "Fehler"]
  ];
  var RANGES_LOG = [
    [24, "24 Stunden"],
    [168, "7 Tage"],
    [720, "30 Tage"]
  ];
  var SOURCE_STATUS = {
    ok: ["ok", "ok"],
    no_statistics: ["warn", "keine Statistik"],
    history: ["ok", "aus Verlauf"],
    unit_mismatch: ["bad", "unpassend"],
    state_class_mismatch: ["bad", "unpassend"],
    format: ["warn", "Format"],
    not_found: ["bad", "nicht gefunden"],
    unavailable: ["bad", "nicht verfügbar"]
  };
  var LOG_EN = {
    "log.restart": "— restart —",
    "update.run": "Analysis: {rows} statistic rows, {days} days with data, {duration} ms",
    "update.backfill": "History back-filled: {rooms} room, {pumps} pump, {mixer} mixer samples",
    "source.lost": "Source {entity} is unavailable (for {hours} h)",
    "source.back": "Source {entity} is available again",
    "source.no_statistics": "Source {entity} has no long-term statistics",
    "source.unit": "Source {entity}: unit {unit}, expected one of {expected}",
    "source.state_class": "Source {entity}: state_class {state_class}, expected total or total_increasing",
    "finding.new": "New finding {id}: {title}",
    "finding.changed": "Finding {id} changed",
    "finding.resolved": "Finding {id} resolved",
    "config.option": "Option {field}: {old} → {new}",
    "config.thresholds": "Threshold {field}: {old} → {new}",
    "config.circuit_added": "Heating circuit added",
    "config.circuit_removed": "Heating circuit removed",
    "config.room_added": "Room added",
    "config.room_removed": "Room removed",
    "inventory.updated": "Inventory {object}: {count} fields changed",
    "inventory.logged": "Change documented: {object}.{field}",
    "dashboard.resource": "Card registered as resource ({mode} mode, {url})",
    "dashboard.created": "Dashboard {path} created",
    "dashboard.exists": "Dashboard {path} already exists",
    "frontend.error": "Card reports: {message}",
    "error.update": "Update failed: {error}"
  };
  function logMessage(entry) {
    if (getLang() !== "en" || !entry.key) return entry.msg;
    const template = LOG_EN[entry.key];
    if (!template) return entry.msg;
    return template.replace(/\{(\w+)\}/g, (match, key) => entry.params && entry.params[key] != null ? entry.params[key] : match);
  }
  var timeOf = (iso) => {
    const at = iso ? new Date(iso) : null;
    if (!at || Number.isNaN(at.getTime())) return "–";
    return at.toLocaleTimeString(getLang() === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
  var dayOf = (iso) => {
    const at = iso ? new Date(iso) : null;
    if (!at || Number.isNaN(at.getTime())) return "";
    return at.toLocaleDateString(getLang() === "de" ? "de-DE" : "en-GB", { weekday: "short", day: "2-digit", month: "2-digit" });
  };
  function runtimeCard(d, ui) {
    const rt = d.diag && d.diag.runtime || {};
    const versions = d.diag && d.diag.versions || {};
    const card2 = versions.card || {};
    const mismatch = card2.matches === false;
    const storage = d.diag && d.diag.storage || {};
    const k = d.diag && d.diag.summary && d.diag.summary.kpis || {};
    const next = rt.next_run ? timeOf(rt.next_run) : "–";
    const rows = [
      [t("Backend"), esc(String(versions.integration || "–"))],
      [t("Karte"), esc(String(card2.version || "–"))],
      [t("Letzter Lauf"), `${esc(String(rt.run_index ?? 0))}. ${esc(t("Lauf"))} · ${esc(fmt(rt.last_duration_ms, 0))} ${esc(t("ms"))}`],
      [t("Nächster Lauf"), esc(next)],
      [t("Letzter Fehler"), rt.last_error ? statusPill("bad", rt.last_error) : statusPill("ok", t("keiner"))],
      [t("Tage mit Daten"), esc(fmt(k.days_with_data, 0))],
      [t("Speicherstand"), `${esc(fmt(storage.rollups, 0))} ${esc(t("Roll-ups"))} · ${esc(fmt(storage.log_entries, 0))} ${esc(t("Protokollzeilen"))}`]
    ];
    return `<div class="c">${head(t("Systemstatus"), "system", ui)}${mismatch ? `<div class="fs">${statusPill("warn", t("Version weicht ab"))}</div>` : ""}
    <table class="kv">${rows.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join("")}</table>
    <div class="row mt10">
      <button class="btn" data-act="log-download">${esc(t("Diagnose herunterladen"))}</button>
      <button class="btn ghost" data-act="log-copy">${esc(t("Protokoll kopieren"))}</button>
      <button class="btn primary" data-act="log-refresh">${esc(t("Jetzt neu berechnen"))}</button>
    </div>
    ${rt.last_error ? `<div class="fd mt8">${esc(t("Letzter Fehler"))}: ${esc(rt.last_error)}</div>` : ""}
  </div>`;
  }
  function sourcesCard(d, ui) {
    const rows = d.diag && d.diag.source_checks || [];
    if (!rows.length) return `<div class="c">${head(t("Quellen-Check"), "sources_check", ui)}<div class="empty">${esc(t("Keine Quellen zugeordnet."))}</div></div>`;
    const body = rows.map((row) => {
      const [tone, label] = SOURCE_STATUS[row.status] || ["mut", row.status || "–"];
      const last = row.daily_last ? `${dayOf(row.daily_last)} ${timeOf(row.daily_last)}` : "–";
      return `<tr>
        <td><b>${esc(row.entity)}</b><div class="muted">${esc(row.kind || "")}</div></td>
        <td>${statusPill(tone, t(label))}${row.advice ? `<div class="fd">${esc(t(row.advice))}</div>` : ""}</td>
        <td>${esc(row.unit || row.statistic_unit || "–")}<div class="muted">${esc(row.state_class || "")}</div></td>
        <td>${esc(fmt(row.hourly_rows, 0))} / ${esc(fmt(row.daily_rows, 0))}</td>
        <td>${esc(last)}</td>
      </tr>`;
    }).join("");
    return `<div class="c">${head(t("Quellen-Check"), "sources_check", ui)}
    <table class="src"><tr><th>${esc(t("Quelle"))}</th><th>${esc(t("Status"))}</th><th>${esc(t("Einheit"))}</th><th>${esc(t("Zeilen 7/31"))}</th><th>${esc(t("Letzter Wert"))}</th></tr>
    ${body}</table></div>`;
  }
  function logList(d, ui) {
    const entries = d.log && d.log.entries || [];
    const cats = [...new Set(entries.map((e) => e.cat))];
    const chipRow = (items, current, attr) => [`<button class="chip ${current ? "" : "on"}" ${attr}="">${esc(t("Alle"))}</button>`].concat(items.map(([value, label]) => `<button class="chip ${current === value ? "on" : ""}" ${attr}="${esc(value)}">${esc(t(label))}</button>`)).join("");
    const catChips = chipRow(CATS_LOG.filter(([value]) => cats.includes(value) || !cats.length), ui.logCat, "data-log-cat");
    const levelChips = LEVELS_LOG.some(([value]) => entries.some((e) => e.level === value)) ? chipRow(LEVELS_LOG.filter(([value]) => entries.some((e) => e.level === value)), ui.logLevel, "data-log-level") : "";
    const range = `<div class="seg">${RANGES_LOG.map(([h, label]) => `<button data-log-range="${h}" class="${(ui.logHours ?? 168) === h ? "on" : ""}">${esc(t(label))}</button>`).join("")}</div>`;
    const search = `<input class="search" data-log-search type="search" value="${esc(ui.logQ || "")}" placeholder="${esc(t("Suchen"))}" aria-label="${esc(t("Suchen"))}">`;
    const groups = [];
    for (const entry of entries) {
      const key = dayOf(entry.ts);
      let group = groups[groups.length - 1];
      if (!group || group.day !== key) {
        group = { day: key, rows: [] };
        groups.push(group);
      }
      if (entry.cat === "start" && entry.key === "log.restart") {
        group.rows.push(`<div class="restart">${esc(t("Neustart"))}</div>`);
        continue;
      }
      const tone = entry.level === "error" ? "bad" : entry.level === "warn" ? "warn" : "cool";
      const id = entry.ts + entry.msg;
      const open = ui.logOpen === id;
      group.rows.push(`<div class="log ${open ? "open" : ""}">
      <button class="logrow" data-log-open="${esc(id)}">
        <span class="lt">${esc(timeOf(entry.ts))}</span>
        <span class="pill tone-${tone}">${esc(t(entry.level))}</span>
        <span class="cat">${esc(t(entry.cat))}</span>
        <span class="msg">${esc(logMessage(entry))}</span>
      </button>
      ${open ? `<div class="details"><div class="muted">${esc(t("Details"))}</div><pre>${esc(JSON.stringify(entry.details || {}, null, 2))}</pre></div>` : ""}
    </div>`);
    }
    return `<div class="c">${head(t("Protokoll"), "log", ui, `${entries.length} ${esc(t("Einträge"))}`)}
    <div class="filters">${catChips}</div>
    <div class="filters">${levelChips}${range}${search}</div>
    ${entries.length ? groups.map((g) => `<div class="day">${esc(g.day)}</div>${g.rows.join("")}`).join("") : `<div class="empty">${esc(t("Keine Einträge für diesen Filter."))}</div>`}
  </div>`;
  }
  function viewProtokoll(d, ui) {
    const diag = d.diag;
    return `<div class="grid g2">${runtimeCard(d, ui)}${sourcesCard(d, ui)}</div>
    <div class="grid">${logList(d, ui)}</div>
    ${!diag ? `<div class="c empty">${esc(t("Diagnose nicht verfügbar – Protokoll wird trotzdem angezeigt."))}</div>` : ""}`;
  }
  function renderView(view, d, ui, live, states = {}) {
    const plant = liveValues(d, states || {});
    const say2 = (q2) => `<div class="say"><p>${esc(t(q2))}</p></div>`;
    switch (view) {
      case "effizienz":
        return viewEffizienz(d, ui);
      case "betrieb":
        return viewBetrieb(d, ui);
      case "raeume":
        return viewRaeume8(d, ui, live || {});
      case "schema":
        return viewHydraulik(d, ui, plant);
      case "vergleich":
        return say2("Hat eine Einstellung etwas gebracht? Wetter ist herausgerechnet.") + viewVergleich(d, ui);
      case "inventar":
        return say2("Was ist eingebaut – und fehlt etwas, das eine Auswertung braucht?") + devicesBlock(d) + viewInventar(d, ui);
      case "protokoll":
        return say2("Liefern alle Quellen, und was ist passiert?") + viewProtokoll(d, ui);
      default:
        return viewUebersicht(d, ui, plant);
    }
  }

  // src/card.js
  var HeizungsanalyseCard = class extends HTMLElement {
    setConfig(config) {
      this._config = { view: "anlage", ...config || {} };
      if (this._config.view === "einstellungen") this._config.view = "protokoll";
      if (!VIEWS.includes(this._config.view)) this._config.view = "anlage";
      this._ui = {
        help: null,
        range: 90,
        form: false,
        widths: {},
        logCat: "",
        logLevel: "",
        logQ: "",
        logHours: 168,
        logOpen: null,
        cfgMsg: null,
        cfgErrors: {},
        invForm: null,
        invSaved: false,
        chgObject: "heizkurve",
        chgField: "",
        hass: null
      };
      this._log = [];
      this._cfgData = null;
      this._cfgSuggestion = null;
      this._diag = null;
      this._logError = null;
      this._diagError = null;
      if (!this.shadowRoot) {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.addEventListener("click", (e) => this._click(e));
        this.shadowRoot.addEventListener("submit", (e) => this._submit(e));
        this.shadowRoot.addEventListener("input", (e) => this._input(e));
        this.shadowRoot.addEventListener("change", (e) => this._change(e));
      }
    }
    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      setLang(hass);
      if (first) this._load();
      else if (this._data && ["raeume", "schema", "anlage"].includes(this._config.view)) this._liveChanged() && this._render();
    }
    getCardSize() {
      return 12;
    }
    static getStubConfig() {
      return { view: "anlage" };
    }
    connectedCallback() {
      this._timer = setInterval(() => this._load(), 5 * 60 * 1e3 + 5e3);
      this._logTimer = setInterval(() => {
        if (this._config.view === "protokoll" && document.visibilityState !== "hidden") this._loadLog(true);
      }, 30 * 1e3);
      this._onError = (event) => this._reportTrace("Darstellungsfehler: " + (event && event.message || "unbekannt"));
      this._onReject = (event) => {
        const reason = event && event.reason;
        this._reportTrace("Promise-Fehler: " + (reason && (reason.message || reason.code) || String(reason || "unbekannt")));
      };
      window.addEventListener("error", this._onError);
      window.addEventListener("unhandledrejection", this._onReject);
      if (!this._ro && window.ResizeObserver) {
        this._ro = new ResizeObserver(() => {
          clearTimeout(this._roT);
          this._roT = setTimeout(() => this._measure(), 120);
        });
        this._ro.observe(this);
      }
    }
    disconnectedCallback() {
      clearInterval(this._timer);
      clearInterval(this._logTimer);
      if (this._onError) window.removeEventListener("error", this._onError);
      if (this._onReject) window.removeEventListener("unhandledrejection", this._onReject);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
    }
    // Diagramme in echter Breite zeichnen, damit die Schrift überall gleich groß bleibt
    _measure() {
      if (!this.shadowRoot || !this._data) return;
      let changed = false;
      this.shadowRoot.querySelectorAll(".cbox[data-cid]").forEach((el) => {
        const w = Math.round(el.clientWidth);
        if (w > 0 && Math.abs((this._ui.widths[el.dataset.cid] || 0) - w) > 6) {
          this._ui.widths[el.dataset.cid] = w;
          changed = true;
        }
      });
      if (changed) this._render(true);
    }
    async _load(force = false) {
      if (!this._hass) return;
      if (!this._data) this._paint(`<div class="c skeleton"><div class="sk sk-title"></div><div class="sk sk-line"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div>`);
      try {
        this._data = await loadSummary(this._hass, { force });
        this._error = null;
      } catch (e) {
        this._error = e && (e.message || e.code) ? e.message || e.code : String(e);
        this._reportTrace("summary failed: " + this._error);
      }
      if (this._config.view === "einstellungen") {
        await this._loadConfig();
        await this._loadSuggestion();
        return;
      }
      if (this._config.view === "protokoll") {
        await this._loadDiag();
        await this._loadLog(force);
        return;
      }
      this._render();
    }
    async _loadDiag() {
      if (!this._hass) return;
      try {
        this._diag = await this._hass.callWS({ type: "heizungsanalyse/status" });
        this._diagError = null;
      } catch (e) {
        this._diagError = e && (e.message || e.code) ? e.message || e.code : String(e);
        this._diag = null;
        this._reportTrace("status failed: " + this._diagError);
      }
    }
    async _loadLog(force = false) {
      if (!this._hass) return;
      const since = new Date(Date.now() - (this._ui.logHours || 168) * 3600 * 1e3).toISOString();
      const payload = { type: "heizungsanalyse/log", limit: 500, since };
      if (this._ui.logCat) payload.cat = this._ui.logCat;
      if (this._ui.logLevel) payload.level = this._ui.logLevel;
      if (this._ui.logQ) payload.q = this._ui.logQ;
      try {
        const result = await this._hass.callWS(payload);
        this._log = result && result.entries || [];
        this._logError = null;
      } catch (e) {
        this._logError = e && (e.message || e.code) ? e.message || e.code : String(e);
        this._log = [];
        this._reportTrace("log failed: " + this._logError);
      }
      if (!force || this._config.view === "protokoll") this._render();
    }
    async _loadSuggestion() {
      if (!this._hass) return;
      try {
        const res = await this._hass.callWS({ type: "heizungsanalyse/suggest_curve" });
        this._cfgSuggestion = res && res.suggestion ? res.suggestion : null;
      } catch (e) {
        this._cfgSuggestion = null;
      }
      this._render();
    }
    async _loadConfig() {
      if (!this._hass) return;
      try {
        const res = await this._hass.callWS({ type: "heizungsanalyse/config" });
        res.options = res.options || {};
        res.options.circuits = res.circuits || res.options.circuits || [];
        res.options.rooms = res.rooms || res.options.rooms || [];
        res.options.thresholds = res.thresholds || res.options.thresholds || {};
        this._cfgData = res;
        this._cfgOriginal = JSON.parse(JSON.stringify({ data: res.data || {}, options: res.options || {} }));
        this._cfgError = null;
      } catch (e) {
        this._cfgError = e && (e.message || e.code) ? e.message || e.code : String(e);
        this._cfgData = null;
        this._reportTrace("config failed: " + this._cfgError);
      }
      this._render();
    }
    _collectConfig() {
      const cfg = this._cfgData;
      if (!cfg || !this.shadowRoot) return;
      const root = this.shadowRoot;
      root.querySelectorAll("[data-cfg]").forEach((el) => {
        const target = el.dataset.cfg === "data" ? cfg.data : cfg.options;
        const value = el.value.trim();
        if (value !== "") target[el.dataset.key] = value;
        else delete target[el.dataset.key];
      });
      root.querySelectorAll("[data-thr]").forEach((el) => {
        cfg.options.thresholds = { ...cfg.options.thresholds || {} };
        if (el.value !== "") cfg.options.thresholds[el.dataset.thr] = el.value;
        else delete cfg.options.thresholds[el.dataset.thr];
      });
      root.querySelectorAll("[data-arr]").forEach((el) => {
        const list = cfg.options[el.dataset.arr] || [];
        const item = list[Number(el.dataset.idx)];
        if (item) item[el.dataset.key] = el.value.trim();
      });
    }
    _nextId(prefix, list) {
      const used = new Set((list || []).map((item) => item.id));
      let index = 1;
      while (used.has(`${prefix}${index}`)) index += 1;
      return `${prefix}${index}`;
    }
    _validateConfigDraft() {
      const cfg = this._cfgData;
      const errors = {};
      if (!cfg) return errors;
      const states = this._hass && this._hass.states || {};
      const previous = this._cfgOriginal || {};
      const previousData = previous.data || {};
      const previousOptions = previous.options || {};
      for (const spec of cfg.schema && cfg.schema.sources || []) {
        const target = spec.scope === "data" ? cfg.data : cfg.options;
        const value = String((target || {})[spec.key] || "").trim();
        const was = String((spec.scope === "data" ? previousData : previousOptions)[spec.key] || "").trim();
        if (!value) {
          if (spec.required && !was) errors[spec.key] = "required";
          continue;
        }
        if (value === was) continue;
        const state = states[value];
        if (!state) {
          errors[spec.key] = "not_found";
          continue;
        }
        const unit = state.attributes && state.attributes.unit_of_measurement;
        if (spec.units && spec.units.length && unit && !spec.units.includes(unit)) errors[spec.key] = "unit";
      }
      const circuits = cfg.options && cfg.options.circuits || [];
      const circuitIds = /* @__PURE__ */ new Set();
      circuits.forEach((circuit, index) => {
        const id = String(circuit.id || "").trim();
        if (!id) errors[`circuits.${index}.id`] = "required";
        else if (circuitIds.has(id)) errors[`circuits.${index}.id`] = "duplicate";
        else circuitIds.add(id);
        if (!String(circuit.name || "").trim()) errors[`circuits.${index}.name`] = "required";
        if (!String(circuit.type || "").trim()) errors[`circuits.${index}.type`] = "required";
      });
      const rooms = cfg.options && cfg.options.rooms || [];
      const roomIds = /* @__PURE__ */ new Set();
      rooms.forEach((room, index) => {
        const id = String(room.id || "").trim();
        if (!id) errors[`rooms.${index}.id`] = "required";
        else if (roomIds.has(id)) errors[`rooms.${index}.id`] = "duplicate";
        else roomIds.add(id);
        if (!String(room.name || "").trim()) errors[`rooms.${index}.name`] = "required";
        if (!String(room.circuit || "").trim()) errors[`rooms.${index}.circuit`] = "required";
      });
      const thresholds = cfg.options && cfg.options.thresholds || {};
      for (const spec of cfg.schema && cfg.schema.thresholds || []) {
        const raw = thresholds[spec.key];
        if (raw == null || raw === "") continue;
        const number = Number(String(raw).replace(",", "."));
        if (!Number.isFinite(number)) errors[`thresholds.${spec.key}`] = "number";
        else if (number < spec.min || number > spec.max) errors[`thresholds.${spec.key}`] = "range";
      }
      return errors;
    }
    async _saveConfig() {
      if (!this._hass || !this._cfgData) return;
      this._collectConfig();
      const draftErrors = this._validateConfigDraft();
      if (Object.keys(draftErrors).length) {
        this._ui.cfgErrors = draftErrors;
        this._ui.cfgMsg = t("{n} Felder prüfen.", { n: Object.keys(draftErrors).length });
        this._render();
        return;
      }
      this._ui.cfgErrors = {};
      try {
        const result = await this._hass.callWS({
          type: "heizungsanalyse/config/save",
          data: this._cfgData.data,
          options: this._cfgData.options
        });
        if (result && result.ok === false) {
          this._ui.cfgErrors = result.errors || {};
          this._ui.cfgMsg = t("{n} Felder prüfen.", { n: Object.keys(this._ui.cfgErrors).length });
          this._render();
          return;
        }
        this._ui.cfgMsg = t("Gespeichert");
        invalidate();
        setTimeout(() => this._load(true), 1500);
      } catch (e) {
        this._ui.cfgMsg = t("Fehler: {e}", { e: e.message || e });
        this._reportTrace("config save failed: " + (e.message || e));
      }
      this._render();
    }
    _live() {
      const out = {};
      for (const r of this._data && this._data.rooms || []) {
        const st = r.climate_entity && this._hass.states[r.climate_entity];
        if (!st) continue;
        const a = st.attributes;
        const target = a.temperature ?? a.effective_target ?? (a.monitor ? a.comfort_temperature : void 0);
        out[r.climate_entity] = { current: a.current_temperature, target, valve: a.valve_position ?? null };
      }
      return out;
    }
    _liveChanged() {
      const now = Date.now();
      if (this._liveAt && now - this._liveAt < 1e4) return false;
      this._liveAt = now;
      const key = JSON.stringify([this._live(), liveValues(this._data, this._hass.states)]);
      if (key === this._liveKey) return false;
      this._liveKey = key;
      return true;
    }
    _render(fromMeasure = false) {
      if (this._error) return this._paint(`<div class="c">${esc(t("Fehler: {e}", { e: this._error }))}</div>`);
      const d = this._data;
      if (!d) return;
      if (!d.configured) return this._paint(`<div class="c empty">${esc(t("Die Heizungsanalyse ist noch nicht eingerichtet."))}</div>`);
      const view = this._config.view;
      this._ui.hass = this._hass;
      let data = d;
      if (view === "protokoll") data = { ...d, diag: this._diag, log: { entries: this._log }, logError: this._logError };
      if (view === "einstellungen") data = { ...d, config: this._cfgData, configError: this._cfgError, suggestion: this._cfgSuggestion };
      this._paint(`${header(d, view)}${renderView(view, data, this._ui, this._live(), this._hass ? this._hass.states : {})}`);
      if (!fromMeasure) requestAnimationFrame(() => this._measure());
    }
    _paint(html) {
      const y = window.scrollY;
      this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="wrap">${html}</div>${this._flashText ? `<div class="flash">${esc(this._flashText)}</div>` : ""}`;
      if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
    }
    _flash(text) {
      this._flashText = text;
      this._render();
      clearTimeout(this._flashTimer);
      this._flashTimer = setTimeout(() => {
        this._flashText = null;
        this._render();
      }, 2500);
    }
    _reportTrace(message) {
      if (!this._hass || !message) return;
      const now = Date.now();
      if (now - (this._traceAt || 0) < 60 * 1e3) return;
      this._traceAt = now;
      this._hass.callWS({ type: "heizungsanalyse/trace", message: String(message).slice(0, 500), version: HA_VERSION, ua: navigator.userAgent }).catch(() => {
      });
    }
    _click(e) {
      const el = e.target.closest("[data-help],[data-range],[data-act],[data-log-cat],[data-log-level],[data-log-range],[data-log-open],[data-nav]");
      if (!el) return;
      if (el.dataset.nav) {
        window.history.pushState(null, "", `/heizungs-analyse/${el.dataset.nav}`);
        window.dispatchEvent(new CustomEvent("location-changed"));
        return;
      }
      if (el.dataset.help) this._ui.help = this._ui.help === el.dataset.help ? null : el.dataset.help;
      else if (el.dataset.range) this._ui.range = Number(el.dataset.range);
      else if (el.dataset.logCat !== void 0) {
        this._ui.logCat = this._ui.logCat === el.dataset.logCat && el.dataset.logCat ? "" : el.dataset.logCat;
        this._loadLog(true);
        return;
      } else if (el.dataset.logLevel !== void 0) {
        this._ui.logLevel = this._ui.logLevel === el.dataset.logLevel && el.dataset.logLevel ? "" : el.dataset.logLevel;
        this._loadLog(true);
        return;
      } else if (el.dataset.logRange) {
        this._ui.logHours = Number(el.dataset.logRange);
        this._loadLog(true);
        return;
      } else if (el.dataset.logOpen) {
        const id = el.dataset.logOpen;
        this._ui.logOpen = this._ui.logOpen === id ? null : id;
      } else if (el.dataset.act === "form-open") this._ui.form = true;
      else if (el.dataset.act === "form-close") this._ui.form = false;
      else if (el.dataset.act === "report") return void this._report();
      else if (el.dataset.act === "log-download") return void this._download();
      else if (el.dataset.act === "log-copy") return void this._copy();
      else if (el.dataset.act === "log-refresh") return void this._refresh();
      else if (el.dataset.act === "cfg-save") return void this._saveConfig();
      else if (el.dataset.act === "cfg-circ-add") {
        this._collectConfig();
        const list = this._cfgData.options.circuits;
        list.push({ id: this._nextId("hk", list), name: "", type: "radiators" });
        this._render();
        return;
      } else if (el.dataset.act === "cfg-circ-del") {
        this._collectConfig();
        this._cfgData.options.circuits.splice(Number(el.dataset.idx), 1);
        this._render();
        return;
      } else if (el.dataset.act === "cfg-room-add") {
        this._collectConfig();
        const list = this._cfgData.options.rooms;
        const circuits = this._cfgData.options.circuits || [];
        list.push({ id: this._nextId("raum", list), name: "", room_type: "", circuit: circuits[0] ? circuits[0].id : "" });
        this._render();
        return;
      } else if (el.dataset.act === "cfg-room-del") {
        this._collectConfig();
        this._cfgData.options.rooms.splice(Number(el.dataset.idx), 1);
        this._render();
        return;
      } else if (el.dataset.act === "cfg-thr-reset") {
        this._collectConfig();
        this._cfgData.options.thresholds = {};
        this._render();
        return;
      } else if (el.dataset.act === "inv-add") {
        this._ui.invForm = this._inventoryForm(el.dataset.section);
        this._ui.invSaved = false;
      } else if (el.dataset.act === "inv-edit") {
        const section = el.dataset.section;
        this._ui.invForm = this._inventoryForm(section, el.dataset.object);
        this._ui.invSaved = false;
      } else if (el.dataset.act === "inv-del") {
        if (!window.confirm(t("Objekt wirklich löschen?"))) return;
        this._hass.callWS({ type: "heizungsanalyse/inventory/remove", object: el.dataset.object }).then(async () => {
          invalidate();
          await this._load(true);
          this._flash(t("Gelöscht"));
        }).catch((err) => this._flash(t("Fehler: {e}", { e: err.message || err })));
        return;
      } else if (el.dataset.act === "inv-prefill") return void this._inventoryPrefill();
      else if (el.dataset.act === "inv-export") return void this._inventoryExport();
      else if (el.dataset.act === "inv-import") return void this._inventoryImport();
      else if (el.dataset.act === "inv-close") {
        this._ui.invForm = null;
        this._ui.invSaved = false;
      } else if (el.dataset.act === "goto-vergleich") {
        window.history.pushState(null, "", "/heizungs-analyse/vergleich");
        window.dispatchEvent(new CustomEvent("location-changed"));
        return;
      }
      this._render();
    }
    _input(e) {
      const el = e.target;
      if (!el || !el.matches || !el.matches("[data-log-search]")) return;
      this._ui.logQ = el.value;
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this._loadLog(true), 250);
    }
    _change(e) {
      const el = e.target;
      if (!el || !el.dataset) return;
      if (el.dataset.catalog) {
        const selected = el.selectedOptions && el.selectedOptions[0];
        if (!selected) return;
        const form = el.closest("form");
        let fields = {};
        try {
          fields = JSON.parse(selected.dataset.fields || "{}");
        } catch (err) {
          fields = {};
        }
        for (const [key, value] of Object.entries(fields)) {
          const input = form && form.querySelector(`[name="f_${key}"]`);
          if (input) input.value = value == null ? "" : String(value);
        }
        const note = form && form.querySelector("[data-cat-note]");
        if (note) note.textContent = selected.dataset.note || "";
        return;
      }
      if (!el.dataset.chg) return;
      if (el.dataset.chg === "object") {
        this._ui.chgObject = el.value;
        this._ui.chgField = "";
        this._render();
      } else if (el.dataset.chg === "field") {
        this._ui.chgField = el.value;
        this._render();
      }
    }
    _inventoryForm(section, object = null) {
      const data = (this._data.inventory || {})[section] || {};
      const key = object && object.includes(".") ? object.split(".").slice(1).join(".") : "";
      const record = object ? section === "hydraulics" ? data : data[key] || {} : {};
      return {
        section,
        object,
        selection: object && object.includes(".") ? object.split(".").slice(1).join(".") : "",
        values: { ...record },
        note: "",
        errors: {}
      };
    }
    async _inventorySave(form, values, note) {
      const section = form.section;
      const object = form.object || objectKey(section, form.selection);
      if (!form.object && section !== "hydraulics" && !form.selection) {
        form.errors = { selection: "required" };
        this._render();
        return;
      }
      try {
        const result = await this._hass.callWS({ type: "heizungsanalyse/inventory/save", object, values, note: note || void 0 });
        if (result && result.ok === false) {
          form.errors = result.errors || {};
          form.message = t("Bitte die markierten Felder prüfen.");
          this._render();
          return;
        }
        this._ui.invForm = null;
        this._ui.invSaved = true;
        invalidate();
        await this._load(true);
        this._flash(t("Gespeichert"));
      } catch (err) {
        form.message = t("Fehler: {e}", { e: err.message || err });
        this._render();
      }
    }
    async _inventoryPrefill() {
      if (typeof window !== "undefined" && typeof window.confirm === "function" && !window.confirm(t("Für alle Räume Thermostat und Heizkörper anlegen?"))) return;
      const rooms = this._data && this._data.rooms || [];
      let created = 0;
      for (const room of rooms) {
        if (!room.id) continue;
        for (const [section, values] of [
          ["thermostats", { room: room.id }],
          ["radiators", { room: room.id, circuit: room.circuit || "" }]
        ]) {
          const object = `${section}.${room.id}`;
          const existing = ((this._data.inventory || {})[section] || {})[room.id];
          if (existing) continue;
          const clean = Object.fromEntries(Object.entries(values).filter(([, value]) => value));
          try {
            await this._hass.callWS({ type: "heizungsanalyse/inventory/save", object, values: clean, note: t("Aus Räumen übernommen") });
            created += 1;
          } catch (err) {
          }
        }
      }
      invalidate();
      await this._load(true);
      this._flash(t("{n} Einträge aus Räumen angelegt", { n: created }));
    }
    async _inventoryExport() {
      try {
        const result = await this._hass.callWS({ type: "heizungsanalyse/inventory/export" });
        const blob = new Blob([result.csv || ""], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = result.filename || "inventar.csv";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2e3);
        this._flash(t("CSV heruntergeladen"));
      } catch (err) {
        this._flash(t("Fehler: {e}", { e: err.message || err }));
      }
    }
    async _inventoryImport() {
      const area = this.shadowRoot.querySelector("[data-inv-csv]");
      const csv = area ? area.value.trim() : "";
      if (!csv) {
        this._flash(t("Bitte CSV einfügen."));
        return;
      }
      try {
        const result = await this._hass.callWS({ type: "heizungsanalyse/inventory/import", csv });
        invalidate();
        this._ui.invSaved = true;
        await this._load(true);
        const problems = Object.keys(result.errors || {}).length + (result.rows || []).length;
        this._flash(problems ? t("{n} übernommen, {e} Zeilen übersprungen", { n: result.imported || 0, e: problems }) : t("{n} übernommen", { n: result.imported || 0 }));
      } catch (err) {
        this._flash(t("Fehler: {e}", { e: err.message || err }));
      }
    }
    async _submit(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      if (e.target.dataset.form === "inventory") {
        const form = this._ui.invForm || { section: data.section, object: null };
        let values = form.values || {};
        for (const spec of sectionFields(this._data, form.section)) {
          const key = `f_${spec.key}`;
          if (data[key] !== void 0) values[spec.key] = data[key];
        }
        if (!form.object) values = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
        form.values = values;
        form.note = data.note || "";
        await this._inventorySave(form, values, form.note);
        return;
      }
      const payload = { object: data.object.trim(), field: data.field.trim() };
      for (const k of ["old_value", "new_value", "note"]) if (data[k] && data[k].trim()) payload[k] = data[k].trim();
      try {
        await this._hass.callService("heizungsanalyse", "log_change", payload);
        this._ui.form = false;
        invalidate();
        await this._load(true);
        this._flash(t("Gespeichert"));
      } catch (err) {
        this._flash(t("Fehler: {e}", { e: err.message || err }));
      }
    }
    async _report() {
      try {
        const res = await this._hass.callWS({
          type: "execute_script",
          sequence: [{ action: "heizungsanalyse.export_report", data: { format: "markdown" }, response_variable: "r" }, { stop: "done", response_variable: "r" }]
        });
        const body = res?.response?.report || "";
        const blob = new Blob([body], { type: "text/markdown" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `heizungsanalyse-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.md`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2e3);
      } catch (err) {
        this._flash(t("Fehler: {e}", { e: err.message || err }));
      }
    }
    _download() {
      const body = JSON.stringify(this._diag || { error: this._diagError || "Diagnose nicht verfügbar" }, null, 2);
      const blob = new Blob([body], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `heizungsanalyse-diagnose-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2e3);
      this._flash(t("Diagnose heruntergeladen"));
    }
    async _copy() {
      const text = (this._log || []).map((e) => `${e.ts} ${e.level.toUpperCase()} [${e.cat}] ${e.msg}`).join("\n");
      try {
        await navigator.clipboard.writeText(text || t("Keine Einträge"));
        this._flash(t("Kopiert"));
      } catch (err) {
        this._flash(t("Fehler: {e}", { e: err.message || err }));
      }
    }
    async _refresh() {
      try {
        await this._hass.callService("heizungsanalyse", "refresh");
        this._flash(t("Neu berechnet"));
        invalidate();
        setTimeout(() => this._load(true), 1500);
      } catch (err) {
        this._flash(t("Fehler: {e}", { e: err.message || err }));
      }
    }
  };

  // src/strategy.js
  var VIEW_DEFS = [
    { view: "anlage", title: "Übersicht", icon: "mdi:view-dashboard-outline" },
    { view: "effizienz", title: "Effizienz", icon: "mdi:chart-bell-curve-cumulative" },
    { view: "betrieb", title: "Betrieb", icon: "mdi:chart-timeline" },
    { view: "raeume", title: "Räume", icon: "mdi:home-thermometer" },
    { view: "schema", title: "Hydraulik", icon: "mdi:pipe" },
    { view: "vergleich", title: "Änderungen", icon: "mdi:compare-horizontal" },
    { view: "inventar", title: "Geräte", icon: "mdi:devices" },
    { view: "protokoll", title: "System", icon: "mdi:heart-pulse" }
  ];
  function buildDashboard(config = {}) {
    return {
      title: config.title || t("Heizungsanalyse"),
      views: VIEW_DEFS.map((v) => ({
        title: t(v.title),
        path: v.view,
        icon: v.icon,
        type: "panel",
        cards: [{ type: "custom:heizungsanalyse-card", view: v.view }]
      }))
    };
  }
  var Base = typeof HTMLElement === "undefined" ? class {
  } : HTMLElement;
  var HeizungsanalyseDashboardStrategy = class extends Base {
    static async generate(config, hass) {
      setLang(hass);
      return buildDashboard(config);
    }
  };

  // src/autodash.js
  var running = false;
  async function ensureDashboard(hass) {
    if (running || !hass || !hass.user || !hass.user.is_admin) return null;
    running = true;
    try {
      const status = await hass.callWS({ type: "heizungsanalyse/dashboard/status" });
      if (!status || !status.wanted) return null;
      const path = status.url_path;
      const list = await hass.callWS({ type: "lovelace/dashboards/list" });
      const exists = (list || []).some((d) => d.url_path === path);
      if (!exists) {
        await hass.callWS({
          type: "lovelace/dashboards/create",
          url_path: path,
          title: status.title || "Heizungsanalyse",
          icon: status.icon || "mdi:heat-pump",
          show_in_sidebar: true,
          require_admin: false
        });
        await hass.callWS({ type: "lovelace/config/save", url_path: path, config: { strategy: { type: "custom:heizungsanalyse" } } });
      }
      await hass.callWS({ type: "heizungsanalyse/dashboard/mark", url_path: path, created: !exists });
      return exists ? null : path;
    } catch (e) {
      try {
        await hass.callWS({ type: "heizungsanalyse/trace", message: `Dashboard anlegen fehlgeschlagen: ${String(e && (e.message || e.code) || e).slice(0, 200)}` });
      } catch (err) {
      }
      return null;
    } finally {
      running = false;
    }
  }
  function findHass() {
    const ha = document.querySelector("home-assistant");
    return ha && ha.hass ? ha.hass : null;
  }

  // src/index.js
  if (!customElements.get("heizungsanalyse-card")) customElements.define("heizungsanalyse-card", HeizungsanalyseCard);
  if (!customElements.get("ll-strategy-dashboard-heizungsanalyse")) {
    customElements.define("ll-strategy-dashboard-heizungsanalyse", HeizungsanalyseDashboardStrategy);
  }
  window.customCards = window.customCards || [];
  if (!window.customCards.find((c) => c.type === "heizungsanalyse-card")) {
    window.customCards.push({ type: "heizungsanalyse-card", name: "Heizungsanalyse", description: "Anlage, Effizienz, Räume, Vorher/Nachher, Inventar", preview: false });
  }
  window.customStrategies = window.customStrategies || [];
  if (!window.customStrategies.find((x) => x.type === "heizungsanalyse")) {
    window.customStrategies.push({
      type: "heizungsanalyse",
      strategyType: "dashboard",
      name: "Heizungsanalyse",
      description: "Wärmepumpe: Kennzahlen, Hinweise, Räume, Vorher/Nachher, Protokoll – baut sich automatisch auf",
      documentationURL: "https://github.com/Goldi5/Heizungsanalyse"
    });
  }
  (function autoCreate(tries = 0) {
    const hass = findHass();
    if (hass && hass.connection) {
      ensureDashboard(hass);
      return;
    }
    if (tries < 30) setTimeout(() => autoCreate(tries + 1), 2e3);
  })();
  console.info(`%c HEIZUNGSANALYSE %c ${HA_VERSION} `, "background:#ff7a45;color:#fff;font-weight:700", "background:#121826;color:#fff");
})();
