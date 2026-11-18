/* Heizungsanalyse 0.7.0 - gebaut aus frontend/src (npm run build). Nicht von Hand bearbeiten. */
(() => {
  // src/version.js
  var HA_VERSION = "0.7.0";

  // src/i18n.js
  var EN = {
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
  var SCORE_LEVEL = {
    very_good: { label: "Sehr gut", tone: "ok" },
    good: { label: "Gut", tone: "ok" },
    watch: { label: "Beobachten", tone: "warn" },
    action: { label: "Handlungsbedarf", tone: "bad" },
    learning: { label: "Lernt noch", tone: "mut" },
    limited: { label: "Eingeschränkt", tone: "warn" }
  };
  var CHECK_NAMES = {
    cop: "COP",
    flow: "Vorlauf Ist − Soll",
    starts: "Starts",
    runtime: "Laufzeit je Zyklus",
    rooms: "Räume",
    pumps: "Pumpen",
    mixer: "Mischer",
    defrost: "Abtauen",
    aux: "Heizstab",
    dhw: "Warmwasser",
    spread: "Spreizung"
  };
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
    return { a: my - b * mx, b, n, at: (x) => my - b * mx + b * x };
  }
  function trend(values, n = 7, tolerance = 0.03) {
    const v = values.filter((x) => x != null);
    if (v.length < n * 2) return null;
    const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
    const recent = mean(v.slice(-n));
    const before = mean(v.slice(-2 * n, -n));
    if (!before) return null;
    const rel = (recent - before) / Math.abs(before);
    return { rel, dir: rel > tolerance ? "up" : rel < -tolerance ? "down" : "flat" };
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
  function kpiTone(value, threshold, higherIsBad = true) {
    if (value == null || threshold == null) return "mut";
    const bad = higherIsBad ? value > threshold : value < threshold;
    if (bad) return "bad";
    const near = higherIsBad ? value > threshold * 0.8 : value < threshold * 1.2;
    return near ? "warn" : "ok";
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
  function timeChart(rows, series, { h = 220, unitL = "", unitR = "", refL = null, markers = [] } = {}) {
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
  function scatterChart(points, { h = 240, unitX = "°C", unitY = "", lines = [], highlight = null, color = "var(--hz-ok)" } = {}) {
    const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (pts.length < 2) return "";
    const allY = pts.map((p) => p.y).concat(lines.flatMap((l) => l.points.map((p) => p.y)));
    const sx = niceScale(Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x)), 5);
    const sy = niceScale(Math.min(...allY), Math.max(...allY));
    const x = (v) => PAD.l + (v - sx.min) / (sx.max - sx.min) * (W - PAD.l - PAD.r);
    const y = (v) => PAD.t + (1 - (v - sy.min) / (sy.max - sy.min)) * (h - PAD.t - PAD.b);
    let body = axisY(sy, h, unitY, "l");
    for (const v of sx.ticks) body += `<text x="${x(v)}" y="${h - 6}" text-anchor="middle">${fmt(v, 0)}${esc(unitX)}</text>`;
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
  function ring(value, tone) {
    const r = 50;
    const c = 2 * Math.PI * r;
    const share = value == null ? 0 : Math.max(0, Math.min(100, value)) / 100;
    return `<svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="${r}" class="ringbg"/><circle cx="60" cy="60" r="${r}" class="ringfg tone-${tone}" stroke-dasharray="${(c * share).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)"/><text x="60" y="70" text-anchor="middle" class="ringv">${value == null ? "…" : value}</text></svg>`;
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
      de: "Stammdaten deiner Anlage: Pumpen, Thermostate, Hydraulik und Heizkörper. Die Felder kommen aus dem Schema – Schlüssel werden aus Kreis oder Raum abgeleitet, nie getippt. Jede Änderung landet automatisch im Verlauf. CSV dient nur dem Austausch vieler Werte.",
      en: "Master data of your system: pumps, thermostats, hydraulics and radiators. Fields come from the schema – keys are derived from circuit or room, never typed. Every change lands in the history automatically. CSV is only for exchanging many values."
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
  function kpiTile({ title, key, ui, value, unit = "", spark = "", body = "", sub = "" }) {
    return `<div class="c">${head(title, key, ui, sub)}<div class="big">${value}${unit ? `<small>${esc(unit)}</small>` : ""}</div>${spark}${body}</div>`;
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
  function selectField({ name, label, value = "", options = [], error = "", attrs = "" }) {
    const opts = options.map((option) => {
      const val = typeof option === "object" ? option.value : option;
      const text = typeof option === "object" ? localized(option.label) || option.value : option;
      return `<option value="${esc(val)}"${String(val) === String(value ?? "") ? " selected" : ""}>${esc(text)}</option>`;
    }).join("");
    return `<div class="field${error ? " invalid" : ""}">${fieldLabel(name, label)}
    <select id="${esc(name)}" name="${esc(name)}"${attrs ? ` ${attrs}` : ""} aria-invalid="${error ? "true" : "false"}">${opts}</select>
    ${error ? `<div class="ferr" role="alert">${esc(error)}</div>` : ""}</div>`;
  }
  function entityField({ name, label, value = "", domains = ["sensor"], error = "", listId = "", attrs = "" }) {
    const list = listId || `hz-ent-${domains.join("-")}`;
    return `<div class="field${error ? " invalid" : ""}">${fieldLabel(name, label)}
    <input id="${esc(name)}" name="${esc(name)}" type="text" value="${esc(value ?? "")}" placeholder="entity.id" list="${esc(list)}" spellcheck="false" autocomplete="off" aria-invalid="${error ? "true" : "false"}"${attrs ? ` ${attrs}` : ""}>
    ${error ? `<div class="ferr" role="alert">${esc(error)}</div>` : ""}</div>`;
  }
  function entityDatalists(ui) {
    const states = ui && ui.hass && ui.hass.states || {};
    const domains = [...new Set(Object.keys(states).map((id) => id.split(".")[0]))];
    return domains.map((domain) => {
      const ids = Object.keys(states).filter((id) => id.startsWith(`${domain}.`)).sort().slice(0, 800);
      return `<datalist id="hz-ent-${esc(domain)}">${ids.map((id) => `<option value="${esc(id)}"></option>`).join("")}</datalist>`;
    }).join("");
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

  // src/views.js
  var VIEWS = ["anlage", "effizienz", "raeume", "vergleich", "inventar", "protokoll", "einstellungen", "schema"];
  function box(ui, id, fn) {
    const w = ui.widths && ui.widths[id] || 640;
    return `<div class="cbox" data-cid="${id}">${withWidth(w, fn)}</div>`;
  }
  var EVIDENCE = {
    median_k: (v) => `Median ${signed(v)} K`,
    p90_k: (v) => `p90 ${signed(v)} K`,
    hours: (v) => `${fmt(v, 0)} h`,
    days: (v) => `${fmt(v, 0)} ${t("Tage")}`,
    samples: (v) => t("{n} Stichproben", { n: fmt(v, 0) }),
    outdoor_mean: (v) => `${t("Ø außen")} ${fmt(v)} °C`
  };
  function evidence(ev) {
    return Object.entries(ev || {}).filter(([, v]) => v != null && typeof v !== "object").slice(0, 5).map(([k, v]) => `<span>${esc(EVIDENCE[k] ? EVIDENCE[k](v) : `${k}: ${typeof v === "number" ? fmt(v, Math.abs(v) < 10 ? 1 : 0) : v}`)}</span>`).join("");
  }
  var NAV = [
    ["anlage", "Anlage"],
    ["effizienz", "Effizienz"],
    ["raeume", "Räume & Kreise"],
    ["vergleich", "Vorher / Nachher"],
    ["inventar", "Inventar"],
    ["protokoll", "Protokoll"],
    ["einstellungen", "Einstellungen"],
    ["schema", "Schema"]
  ];
  function header(d, view) {
    const names = { anlage: "Anlage", effizienz: "Effizienz", raeume: "Räume & Kreise", vergleich: "Vorher / Nachher", inventar: "Inventar", protokoll: "Protokoll", einstellungen: "Einstellungen", schema: "Schema" };
    const at = d.generated ? new Date(d.generated) : null;
    const time = at ? at.toLocaleTimeString(getLang() === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
    const nav = NAV.map(([v, label]) => `<button class="navpill ${v === view ? "on" : ""}" data-nav="${v}">${esc(t(label))}</button>`).join("");
    return `<div class="head"><h1>${esc(t(names[view] || "Anlage"))}</h1><span class="muted">${esc(d.title || t("Heizungsanalyse"))}</span>
    <span class="meta"><span class="dot ${d.last_update_success === false ? "off" : ""}"></span>${esc(t("Aktualisiert {t}", { t: time }))} · ${esc(t("Version {v}", { v: d.version }))}</span></div>
    <nav class="nav">${nav}</nav>`;
  }
  function tabVerdict(d, view) {
    const k = d.kpis || {};
    const score = d.score || {};
    const line = (text, extra = "") => `<div class="intro"><span>${esc(text)}</span>${extra ? `<span class="muted">${esc(extra)}</span>` : ""}</div>`;
    if (view === "anlage") {
      const text = score.active ? t("{w} Warnungen · {i} Hinweise", { w: score.warnings || 0, i: score.infos || 0 }) : t("Alles in Ordnung");
      return line(text, t("Datenbasis {d} Tage", { d: k.days_with_data ?? 0 }));
    }
    if (view === "effizienz") {
      const cop = (k.cop_short || {}).value;
      return line(cop != null ? t("COP {v} in den letzten 7 Tagen", { v: fmt(cop, 1) }) : t("Noch keine Daten für die Effizienz."));
    }
    if (view === "raeume") {
      const rooms = d.rooms || [];
      const tol = (d.thresholds || {}).room_deviation_k ?? 1;
      const outside = rooms.filter((r) => r.deviation && r.deviation.median != null && Math.abs(r.deviation.median) > tol).length;
      return line(t("{n} Räume · {k} außerhalb der Toleranz", { n: rooms.length, k: outside }));
    }
    if (view === "protokoll") {
      const count = (d.log && d.log.entries || []).length;
      return line(t("{n} Ereignisse in den letzten 48 Stunden", { n: count }));
    }
    if (view === "schema") {
      return line(t("{c} Heizkreise · {r} Räume", { c: (d.circuits || []).length, r: (d.rooms || []).length }));
    }
    return "";
  }
  function copFit(d) {
    return linearFit(d.series.filter((r) => r.cop != null && r.outdoor != null && r.cop < 12).map((r) => ({ x: r.outdoor, y: r.cop })));
  }
  function viewAnlage(d, ui) {
    const k = d.kpis;
    const th = d.thresholds || {};
    const lvl = SCORE_LEVEL[d.score.level] || SCORE_LEVEL.learning;
    const last30 = d.series.slice(-30);
    const fit = copFit(d);
    const copTrend = trend(d.series.map((r) => r.cop));
    const trendTxt = copTrend ? { up: t("steigend"), down: t("fallend"), flat: t("stabil") }[copTrend.dir] : null;
    const scoreCard = `<div class="c">${head(t("Anlagen-Check"), "score", ui)}
    <div class="score">${ring(d.score.value, lvl.tone)}
      <div><div class="lvl">${esc(t(lvl.label))}</div>
      <div class="muted">${esc(t("{w} Warnung · {i} Hinweise", { w: d.score.warnings, i: d.score.infos }))}<br>${esc(t("Datenbasis {d} Tage", { d: k.days_with_data }))}${d.score.total ? `<br>${esc(t("{a} von {n} Prüfungen aktiv", { a: d.score.active, n: d.score.total }))}` : ""}</div>
      ${k.power_source === "fallback" ? `<div class="mt8">${statusPill("warn", t("Quelle {s}", { s: t("Ersatzquelle") }))}</div>` : ""}</div></div>
    ${(d.score.checks || []).some((c) => !c.active) ? `<div class="fs mt10">${esc(t("Ohne Bewertung:"))}</div><div class="ev">${(d.score.checks || []).filter((c) => !c.active).map((c) => `<span title="${esc(c.reason === "no_source" ? t("kein Sensor zugeordnet") : t("noch keine Daten"))}">${esc(t(CHECK_NAMES[c.key] || c.key))} · ${esc(c.reason === "no_source" ? t("kein Sensor") : t("keine Daten"))}</span>`).join("")}</div>` : ""}</div>`;
    const cop = k.cop_short.value;
    const copPill = (() => {
      if (cop == null) return statusPill("mut", t("keine Daten"));
      const today = d.series[d.series.length - 1];
      if (fit && today && today.cop != null && today.outdoor != null) {
        const exp = fit.at(today.outdoor);
        const rel = (today.cop - exp) / exp;
        return statusPill(rel > 0.08 ? "ok" : rel < -0.08 ? "warn" : "cool", rel > 0.08 ? t("über Kennlinie") : rel < -0.08 ? t("unter Kennlinie") : t("auf Kennlinie"));
      }
      return trendTxt ? statusPill(copTrend.dir === "down" ? "warn" : "ok", `${t("Trend")}: ${trendTxt}`) : "";
    })();
    const startsTone = kpiTone(k.starts_per_day, th.starts_per_day);
    const runTone = kpiTone(k.runtime_per_cycle, th.runtime_minutes, false);
    const flow = k.flow_deviation.median;
    const flowTone = flow == null ? "mut" : Math.abs(flow) <= 1 ? "ok" : Math.abs(flow) < (th.flow_deviation_k ?? 5) ? "warn" : "bad";
    const kpi = (key, title, value, unit, spark, body) => kpiTile({ title, key, ui, value, unit, spark, body });
    const kpis = `<div class="kpis">
    ${kpi("cop", t("COP 7 Tage"), fmt(cop, 1), cop != null && k.cop_long.value != null ? esc(t("30 T: {v}", { v: fmt(k.cop_long.value, 1) })) : "", sparkline(last30.map((r) => r.cop), "var(--hz-ok)"), copPill + (k.cop_total_short && k.cop_total_short.value != null ? `<div class="muted mt6">${esc(t("inkl. Warmwasser {v}", { v: fmt(k.cop_total_short.value, 1) }))}</div>` : ""))}
    ${kpi("starts", t("Starts / Tag"), fmt(k.starts_per_day, 0), th.starts_per_day ? esc(t("Schwelle {v}", { v: fmt(th.starts_per_day, 0) })) : "", sparkline(last30.map((r) => r.starts), "var(--hz-warn)", { kind: "bar", ref: th.starts_per_day }), k.starts_per_day == null ? statusPill("mut", t("keine Daten")) : statusPill(startsTone, startsTone === "bad" ? t("über der Schwelle") : t("im grünen Bereich")))}
    ${kpi("runtime", t("Laufzeit / Zyklus"), fmt(k.runtime_per_cycle, 0), t("min"), sparkline(last30.map((r) => r.cycle_min), "var(--hz-cool)"), k.runtime_per_cycle == null ? statusPill("mut", t("keine Daten")) : statusPill(runTone, runTone === "bad" ? t("unter der Schwelle") : t("im grünen Bereich")))}
    ${kpi("flow", t("Vorlauf Ist − Soll"), signed(flow), "K", sparkline(last30.map((r) => r.flow != null && r.target_flow != null ? r.flow - r.target_flow : null), "var(--hz-bad)", { ref: 0 }), flow == null ? statusPill("mut", t("keine Daten")) : statusPill(flowTone, flow > 1 ? t("Vorlauf zu warm → Kurve prüfen") : flow < -1 ? t("Vorlauf zu kalt") : t("passt")))}
  </div>`;
    const findings = d.findings.length ? d.findings.map((f) => `<div class="alert ${f.severity === "warning" ? "warning" : "info"}">
          <div class="abody">
            <div class="atitle"><span class="aid">${esc(f.id)}</span>${esc(f.title)}</div>
            <div class="adesc">${esc(f.text)}</div>
            ${f.suggestion ? `<div class="asug"><b>${esc(t("Empfehlung"))}:</b> ${esc(f.suggestion)}</div>` : ""}
            ${evidence(f.evidence) ? `<div class="aev">${evidence(f.evidence)}</div>` : ""}
          </div>
        </div>`).join("") : `<div class="alert info"><div class="abody"><div class="atitle">${esc(t("Keine Hinweise"))}</div><div class="adesc">${esc(t("Keine Hinweise – keine Regel hat angeschlagen. Das heißt nicht, dass alles optimal ist."))}</div></div></div>`;
    const curve = copCurveCard(d, ui, fit);
    const energy = energyCard(d, ui, 30);
    const missing = missingCard(d);
    const liveCard = liveNow(d, ui);
    return `<div class="grid hero">${scoreCard}${kpis}</div>
    <div class="grid g2"><div>${findings}</div>${curve}</div>
    <div class="grid g2">${energy}${liveCard || missing || ""}</div>
    ${liveCard && missing ? `<div class="grid g2">${missing}</div>` : ""}`;
  }
  function liveNow(d, ui) {
    const h = d.kpis && d.kpis.hydraulics || {};
    const lv = h.live;
    if (!lv || lv.spread == null && lv.power_kw == null) return "";
    const tile = (label, value, unit, tone = "") => `<div class="lv"><div class="muted">${esc(t(label))}</div><div class="big ${tone}">${value}<small>${esc(unit)}</small></div></div>`;
    const state = lv.running === true ? statusPill("ok", t("Verdichter läuft")) : lv.running === false ? statusPill("mut", t("Verdichter aus")) : "";
    const sp = h.spread || {};
    return `<div class="c">${head(t("Jetzt"), "live", ui)}<div class="row mt6">${state}</div>
    <div class="lvgrid">
      ${tile("Wärmeleistung", fmt(lv.heat_kw, 1), "kW")}
      ${tile("Strom", fmt(lv.power_kw, 2), "kW")}
      ${tile("COP jetzt", fmt(lv.cop, 1), "")}
      ${tile("Spreizung", fmt(lv.spread, 1), "K")}
    </div>
    ${sp.median != null ? `<div class="fd mt8">${esc(t("Spreizung im Lauf (7 Tage): Median {m} K, {n} Stunden", { m: fmt(sp.median, 1), n: sp.hours }))}</div>` : ""}</div>`;
  }
  function copCurveCard(d, ui, fit) {
    const rows = d.series.filter((r) => r.cop != null && r.outdoor != null && r.cop < 12);
    const today = rows[rows.length - 1];
    const pts = rows.map((r, i) => ({ x: r.outdoor, y: r.cop, title: `${dayLabel(r.day)}: COP ${fmt(r.cop)} · ${fmt(r.outdoor)} °C`, opacity: 0.25 + 0.55 * (i / Math.max(1, rows.length - 1)) }));
    const xs = rows.map((r) => r.outdoor);
    const lines = fit && xs.length ? [{ color: "var(--hz-ok)", points: [{ x: Math.min(...xs), y: fit.at(Math.min(...xs)) }, { x: Math.max(...xs), y: fit.at(Math.max(...xs)) }] }] : [];
    const svg = box(ui, "copcurve", () => scatterChart(pts, { unitY: "COP", lines, highlight: today ? { x: today.outdoor, y: today.cop, label: `${t("heute")} ${fmt(today.cop)}` } : null }));
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
    return `<div class="c">${head(t("Energie"), "energy", ui, `${days} ${esc(t("Tage"))}`)}${box(ui, `energy${days}`, () => timeChart(rows, series, { unitL: "kWh" }))}
    <div class="legend"><span><i class="sw-heat"></i>${esc(t("Wärme"))} ${fmt(sumHeat, 0)} kWh</span>${hasDhw ? `<span><i class="sw-vio"></i>${esc(t("Warmwasser"))}</span>` : ""}<span><i class="sw-cool"></i>${esc(t("Strom"))} ${fmt(sumPower, 0)} kWh</span></div></div>`;
  }
  function missingCard(d) {
    if (!d.missing || !d.missing.length) return "";
    const names = {
      heating_curve: "Heizkurve und Vorlauf-Abweichung",
      flow_deviation: "",
      cycling: "Taktanalyse",
      defrost: "Abtauanalyse",
      aux_heater: "Heizstab-Auswertung",
      dhw: "Warmwasseranteil",
      spread: "Spreizung Vor-/Rücklauf"
    };
    const items = d.missing.map((m) => names[m]).filter(Boolean);
    if (!items.length) return "";
    return `<div class="c"><div class="h">${esc(t("Was fehlt?"))}</div><div class="fs">${esc(t("Diese Auswertungen brauchen noch einen Sensor:"))}</div>
    <div class="ev">${items.map((x) => `<span>${esc(t(x))}</span>`).join("")}</div><div class="fd mt10">${esc(t("Ein Sensor lässt sich unter Einstellungen → Geräte & Dienste → Heizungsanalyse → Konfigurieren ergänzen."))}</div></div>`;
  }
  function viewEffizienz(d, ui) {
    const days = ui.range ?? 90;
    const rows = rangeRows(d.series, days);
    const seg = `<div class="seg">${[[30, "30 Tage"], [90, "90 Tage"], [365, "1 Jahr"]].map(([v, l]) => `<button data-range="${v}" class="${days === v ? "on" : ""}">${esc(t(l))}</button>`).join("")}</div>`;
    const markers = (d.changes || []).filter((c) => c.day).map((c) => ({ day: c.day, label: `${c.object} ${c.field}: ${c.old ?? ""} → ${c.new ?? ""}` }));
    const copLine = `<div class="c">${head(t("COP-Verlauf"), "copline", ui)}${box(ui, "copline", () => timeChart(rows, [
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
    const curve = `<div class="c">${head(t("Heizkurve"), "curve", ui)}${box(ui, "curve", () => scatterChart(flowPts.concat(tgtPts), { unitY: "°C", lines: lineOf(fitF, "var(--hz-heat)").concat(lineOf(fitT, "var(--hz-cool)", "6 4")) })) || `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i class="sw-heat"></i>${esc(t("Vorlauf"))}</span><span><i class="sw-cool"></i>${esc(t("Soll-Vorlauf"))}</span></div></div>`;
    const th = d.thresholds || {};
    const startBins = binByOutdoor(rows, "starts");
    const cycling = `<div class="c">${head(t("Takten"), "cycling", ui, esc(t("Starts pro Tag nach Außentemperatur")))}${startBins.length ? box(ui, "cycling", () => binChart(startBins, { ref: th.starts_per_day, unit: t("Starts/Tag"), digits: 0 })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
    const cycle = `<div class="c">${head(t("Laufzeit je Zyklus"), "cycle", ui)}${rows.some((r) => r.cycle_min != null) ? box(ui, "cycle", () => timeChart(rows, [{ key: "cycle_min", kind: "line", color: "var(--hz-cool)", axis: "l", digits: 0 }], { unitL: "min", refL: th.runtime_minutes })) : ""}${rows.some((r) => r.cycle_min != null) ? "" : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
    const hasDef = rows.some((r) => r.defrost_h != null || r.aux_h != null);
    const defrost = `<div class="c">${head(t("Abtauen & Heizstab"), "defrost", ui)}${hasDef ? box(ui, "defrost", () => timeChart(rows, [
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
    const spreadCard = spreadRows.length ? `<div class="c">${head(t("Spreizung"), "spread", ui, esc(t("WP-Vorlauf − WP-Rücklauf, nur Laufstunden")))}${box(ui, "spread", () => timeChart(spreadRows, [{ key: "spread", kind: "line", color: "var(--hz-vio)", axis: "l", digits: 1 }], { unitL: "K", refL: th.spread_min_k }))}
      <div class="legend"><span>${esc(t("Median {m} K · Ziel {a}–{b} K", { m: fmt(hy.spread && hy.spread.median, 1), a: fmt(th.spread_min_k, 0), b: fmt(th.spread_max_k, 0) }))}</span></div></div>` : "";
    const overCard = overRows.length ? `<div class="c">${head(t("Puffer-Ladung"), "overshoot", ui, esc(t("WP-Vorlauf − Puffer-Soll")))}${box(ui, "overshoot", () => timeChart(overRows, [{ key: "over", kind: "line", color: "var(--hz-heat)", axis: "l", digits: 1 }], { unitL: "K", refL: 0 }))}
      <div class="legend"><span>${esc(t("Median {m} K über Puffer-Soll", { m: fmt(hy.overshoot && hy.overshoot.median, 1) }))}</span></div></div>` : "";
    return `<div class="row">${seg}</div>
    <div class="grid g2">${copLine}${curve}</div>
    ${spreadCard || overCard ? `<div class="grid g2">${spreadCard}${overCard}</div>` : ""}
    <div class="grid g3">${cycling}${cycle}${defrost}${dhwCard}</div>
    <div class="grid g2">${energyCard(d, ui, days)}</div>`;
  }
  function viewRaeume(d, ui, live = {}) {
    const tol = 1;
    const span = 3;
    const rooms = (d.rooms || []).slice().sort((a, b) => Math.abs(b.deviation?.median ?? 0) - Math.abs(a.deviation?.median ?? 0));
    const pos = (v) => 50 + Math.max(-span, Math.min(span, v)) / span * 50;
    const roomRows = rooms.length ? rooms.map((r) => {
      const dv = r.deviation;
      const m = dv?.median;
      const tone = m == null ? "mut" : Math.abs(m) <= 0.5 ? "ok" : Math.abs(m) <= tol ? "warn" : "bad";
      const color = { ok: "var(--hz-ok)", warn: "var(--hz-warn)", bad: "var(--hz-bad)", mut: "var(--hz-mut)" }[tone];
      const bar = m == null ? "" : `<i style="left:${Math.min(50, pos(m))}%;width:${Math.max(1.5, Math.abs(pos(m) - 50))}%;background:${color}"></i>`;
      const p90 = dv?.p90 != null ? `<span class="p90" style="left:${pos(dv.p90)}%"></span>` : "";
      const lv = live[r.climate_entity];
      const now = lv ? `${fmt(lv.current)} / ${fmt(lv.target)} °C` : "";
      const extras = [
        dv?.under_share != null && dv.under_share > 0.05 ? statusPill("cool", t("zu kalt {p} %", { p: fmt(dv.under_share * 100, 0) })) : "",
        dv?.over_share != null && dv.over_share > 0.05 ? statusPill("warn", t("zu warm {p} %", { p: fmt(dv.over_share * 100, 0) })) : "",
        r.heating_up_min != null ? statusPill("mut", `${t("Aufheizzeit")} ${fmt(r.heating_up_min, 0)} min`) : "",
        !r.valve_available ? statusPill("mut", t("ohne Ventilwert")) : "",
        dv && !dv.samples ? statusPill("mut", t("noch keine Stichproben")) : ""
      ].filter(Boolean).join("");
      return `<div class="room"><div class="nm">${esc(r.name)}<small>${esc(r.circuit_name || "")}${now ? ` · ${now}` : ""}</small></div>
            <div class="dev"><span class="tol" style="left:${pos(-tol)}%;width:${pos(tol) - pos(-tol)}%"></span><span class="mid"></span>${bar}${p90}</div>
            <b>${m == null ? "–" : signed(m)} K</b>${extras ? `<div class="extra">${extras}</div>` : ""}</div>`;
    }).join("") : `<div class="empty">${esc(t("noch keine Stichproben"))}</div>`;
    const roomsCard = `<div class="c">${head(t("Räume"), "rooms", ui, esc(t("Abweichung zum Soll")))}
    <div class="legend between"><span>← ${esc(t("zu kalt"))}</span><span>${esc(t("zu warm"))} →</span></div>${roomRows}</div>`;
    const th = d.thresholds || {};
    const circuits = (d.circuits || []).map((c) => {
      const idle = c.pump?.idle_share;
      const idleTone = idle == null ? "mut" : kpiTone(idle, th.pump_idle_share);
      const pulses = c.mixer?.pulses_per_day;
      return `<div class="cblock"><div class="ct">${esc(c.name)} <span class="muted">${esc(c.rooms.join(", "))}</span></div>
        <div class="circ"><div><div class="muted">${esc(t("Pumpe ohne Verdichter"))}</div>
        ${c.has_pump ? `<div class="big">${fmt(idle == null ? null : idle * 100, 0)}<small>%</small></div><div class="meter"><i style="width:${idle == null ? 0 : Math.min(100, idle * 100)}%;background:var(--hz-${idleTone === "mut" ? "cool" : idleTone})"></i></div>` : `<div class="fd">${esc(t("keine Pumpe zugeordnet"))}</div>`}</div>
        <div><div class="muted">${esc(t("Mischer-Impulse"))}</div>${c.has_mixer ? `<div class="big">${fmt(pulses, 0)}<small>${esc(t("/Tag"))}</small></div>` : `<div class="fd">${esc(t("kein Mischer zugeordnet"))}</div>`}</div></div></div>`;
    }).join("");
    return `<div class="grid g2">${roomsCard}${circuits ? `<div class="c">${head(t("Heizkreise"), "circuits", ui)}${circuits}</div>` : ""}</div>`;
  }
  function viewVergleich(d, ui) {
    const fit = copFit(d);
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
    return `<div class="c">${head(t("COP-Verlauf"), "copline", ui, `90 ${esc(t("Tage"))}`)}${box(ui, "copline90", () => timeChart(rows, [
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
    return fields.map((spec) => {
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
      dhw_power_entity: "Warmwasser-Strom"
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
  var CFG_ERRORS = {
    required: "Pflichtfeld",
    not_found: "Entity nicht gefunden",
    unit: "Einheit passt nicht",
    number: "Bitte eine Zahl eintragen",
    range: "Wert außerhalb des Bereichs",
    option: "Bitte aus der Liste wählen",
    reference: "Verweis nicht gefunden",
    duplicate: "Bezeichner ist doppelt",
    format: "Aufbau ist ungültig",
    _: "Wert prüfen"
  };
  function cfgErrorText(code) {
    return t(CFG_ERRORS[code] || CFG_ERRORS._);
  }
  function cfgSources(d, ui, data, options, schema, errors) {
    const render = (spec) => {
      const value = spec.scope === "data" ? data[spec.key] : options[spec.key];
      return `<div class="srcrow">${entityField({
        name: `src_${spec.key}`,
        label: localized(spec.label),
        value,
        domains: spec.domain || ["sensor"],
        listId: `hz-ent-${(spec.domain || ["sensor"])[0]}`,
        error: errors[spec.key] ? cfgErrorText(errors[spec.key]) : "",
        attrs: `data-cfg="${spec.scope}" data-key="${esc(spec.key)}"`
      })}</div>`;
    };
    const required = (schema.sources || []).filter((spec) => spec.required);
    const optional = (schema.sources || []).filter((spec) => !spec.required);
    return `
    <div class="cfggroup"><div class="h">${esc(t("Pflicht"))}</div>${required.map(render).join("") || empty(t("keine"))}</div>
    <div class="cfggroup"><div class="h">${esc(t("Optional"))}</div>${optional.map(render).join("") || empty(t("keine"))}</div>`;
  }
  function cfgCircuits(d, ui, options, schema, errors) {
    const types = (schema.circuit_types || []).map((type) => ({ value: type, label: type }));
    const list = options.circuits || [];
    const item = (circuit, index) => `<div class="arrcard">
      <div class="arrhead"><b>${esc(circuit.name || circuit.id || t("Neuer Heizkreis"))}</b>${button(t("Entfernen"), { act: "cfg-circ-del", variant: "ghost danger", attrs: `data-idx="${index}"` })}</div>
      <div class="grid g2">
        ${textField({ name: `c${index}_name`, label: t("Name"), value: circuit.name, error: errors[`circuits.${index}.name`] ? cfgErrorText(errors[`circuits.${index}.name`]) : "", attrs: `data-arr="circuits" data-idx="${index}" data-key="name"` })}
        ${selectField({ name: `c${index}_type`, label: t("Typ"), value: circuit.type, options: types, error: errors[`circuits.${index}.type`] ? cfgErrorText(errors[`circuits.${index}.type`]) : "", attrs: `data-arr="circuits" data-idx="${index}" data-key="type"` })}
        ${entityField({ name: `c${index}_temp`, label: t("Vorlauftemperatur"), value: circuit.temperature_entity, domains: ["sensor"], listId: "hz-ent-sensor", error: errors[`circuits.${index}.temperature_entity`] ? cfgErrorText(errors[`circuits.${index}.temperature_entity`]) : "", attrs: `data-arr="circuits" data-idx="${index}" data-key="temperature_entity"` })}
        ${entityField({ name: `c${index}_pump`, label: t("Pumpe"), value: circuit.pump_entity, domains: ["switch", "binary_sensor", "sensor"], listId: "hz-ent-switch", error: errors[`circuits.${index}.pump_entity`] ? cfgErrorText(errors[`circuits.${index}.pump_entity`]) : "", attrs: `data-arr="circuits" data-idx="${index}" data-key="pump_entity"` })}
        ${entityField({ name: `c${index}_mo`, label: t("Mischer auf"), value: circuit.mixer_open_entity, domains: ["switch", "binary_sensor"], listId: "hz-ent-switch", attrs: `data-arr="circuits" data-idx="${index}" data-key="mixer_open_entity"` })}
        ${entityField({ name: `c${index}_mc`, label: t("Mischer zu"), value: circuit.mixer_close_entity, domains: ["switch", "binary_sensor"], listId: "hz-ent-switch", attrs: `data-arr="circuits" data-idx="${index}" data-key="mixer_close_entity"` })}
      </div>
    </div>`;
    return `${list.map(item).join("") || empty(t("Noch kein Heizkreis."))}
    <div class="row start">${button(`+ ${t("Heizkreis hinzufügen")}`, { act: "cfg-circ-add" })}</div>`;
  }
  function cfgRooms(d, ui, options, schema, errors) {
    const types = (schema.room_types || []).map((type) => ({ value: type, label: type }));
    const circuitOptions = (options.circuits || []).map((circuit) => ({ value: circuit.id, label: { de: circuit.name || circuit.id, en: circuit.name || circuit.id } }));
    const list = options.rooms || [];
    const item = (room, index) => `<div class="arrcard">
      <div class="arrhead"><b>${esc(room.name || room.id || t("Neuer Raum"))}</b>${button(t("Entfernen"), { act: "cfg-room-del", variant: "ghost danger", attrs: `data-idx="${index}"` })}</div>
      <div class="grid g2">
        ${textField({ name: `r${index}_name`, label: t("Name"), value: room.name, error: errors[`rooms.${index}.name`] ? cfgErrorText(errors[`rooms.${index}.name`]) : "", attrs: `data-arr="rooms" data-idx="${index}" data-key="name"` })}
        ${selectField({ name: `r${index}_type`, label: t("Raumtyp"), value: room.room_type, options: [{ value: "", label: { de: "– keine Angabe –", en: "– not specified –" } }, ...types], error: errors[`rooms.${index}.room_type`] ? cfgErrorText(errors[`rooms.${index}.room_type`]) : "", attrs: `data-arr="rooms" data-idx="${index}" data-key="room_type"` })}
        ${selectField({ name: `r${index}_circuit`, label: t("Heizkreis"), value: room.circuit, options: [{ value: "", label: { de: "– bitte wählen –", en: "– please choose –" } }, ...circuitOptions], error: errors[`rooms.${index}.circuit`] ? cfgErrorText(errors[`rooms.${index}.circuit`]) : "", attrs: `data-arr="rooms" data-idx="${index}" data-key="circuit"` })}
        ${entityField({ name: `r${index}_climate`, label: t("Klima-Entity"), value: room.climate_entity, domains: ["climate"], listId: "hz-ent-climate", attrs: `data-arr="rooms" data-idx="${index}" data-key="climate_entity"` })}
        ${entityField({ name: `r${index}_valve`, label: t("Ventilposition"), value: room.valve_position_entity, domains: ["sensor", "number"], listId: "hz-ent-sensor", attrs: `data-arr="rooms" data-idx="${index}" data-key="valve_position_entity"` })}
      </div>
    </div>`;
    return `${list.map(item).join("") || empty(t("Noch kein Raum."))}
    <div class="row start">${button(`+ ${t("Raum hinzufügen")}`, { act: "cfg-room-add" })}</div>`;
  }
  function cfgThresholds(d, ui, options, schema, errors) {
    const specs = schema.thresholds || [];
    const thresholds = options.thresholds || {};
    const rows = specs.map((spec) => {
      const key = `thresholds.${spec.key}`;
      return textField({
        name: `thr_${spec.key}`,
        label: localized(spec.label),
        value: thresholds[spec.key] ?? spec.default,
        type: "number",
        unit: spec.unit || "",
        error: errors[key] ? cfgErrorText(errors[key]) : "",
        attrs: `data-thr="${esc(spec.key)}" min="${spec.min}" max="${spec.max}" step="${spec.step}"`
      });
    });
    return `<div class="grid g3">${rows.join("")}</div>
    <div class="row start">${button(t("Auf Standard zurücksetzen"), { act: "cfg-thr-reset" })}</div>`;
  }
  function viewEinstellungen(d, ui) {
    const cfg = d && d.config || {};
    const data = cfg.data || {};
    const options = cfg.options || {};
    const schema = d && d.settings_schema || { sources: [], thresholds: [], circuit_types: [], room_types: [] };
    const errors = ui && ui.cfgErrors || {};
    const coverage = d && d.settings_coverage || {};
    const errorCount = Object.keys(errors).length;
    const intro = `<div class="intro"><span>${esc(t("Pflichtquellen: {a} von {b} verbunden", { a: coverage.required_filled ?? 0, b: coverage.required ?? 0 }))}</span>${cfg.coverage ? "" : ""}</div>`;
    const errBanner = errorCount ? banner("bad", t("{n} Felder brauchen Aufmerksamkeit.", { n: errorCount })) : "";
    const sg = d && d.suggestion || {};
    const bins = sg.bins || [];
    let curveCard = "";
    if (bins.length) {
      const rows = bins.map((b) => `<tr><td>${esc(fmt(b.outdoor_lower, 0))}–${esc(fmt(b.outdoor_upper, 0))} °C</td><td>${esc((b.median_deviation_k > 0 ? "+" : "") + fmt(b.median_deviation_k, 1))} K</td><td>${esc(fmt(b.samples, 0))}</td></tr>`).join("");
      const offset = (sg.suggested_offset_k > 0 ? "+" : "") + fmt(sg.suggested_offset_k, 1);
      const conf = sg.confidence === "high" ? t("hoch") : sg.confidence === "medium" ? t("mittel") : t("niedrig");
      curveCard = `<div class="muted">${esc(sg.reason || "")}</div>
      <div class="tablewrap"><table class="rtable"><thead><tr><th>${esc(t("Außen"))}</th><th>${esc(t("Median-Abweichung"))}</th><th>${esc(t("Stunden"))}</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="detailgrid">
        <div class="detail"><span class="dl">${esc(t("Vorschlag Offset"))}</span><span class="dv">${esc(offset)} K</span></div>
        <div class="detail"><span class="dl">${esc(t("Geschätzter COP-Gewinn"))}</span><span class="dv">${esc(fmt(sg.estimated_cop_gain_pct, 1))} %</span></div>
        <div class="detail"><span class="dl">${esc(t("Konfidenz"))}</span><span class="dv">${esc(conf)}</span></div>
      </div>`;
    } else {
      curveCard = empty(t("Noch keine Daten für einen Vorschlag."));
    }
    return `${entityDatalists(ui)}${intro}${errBanner}<div class="grid">
    ${card(t("Quellen"), "cfg_sources", ui, cfgSources(d, ui, data, options, schema, errors))}
    ${card(t("Heizkreise"), "cfg_circuits", ui, cfgCircuits(d, ui, options, schema, errors))}
    ${card(t("Räume"), "cfg_rooms", ui, cfgRooms(d, ui, options, schema, errors))}
    ${card(t("Schwellen und Grenzwerte"), "cfg_thresholds", ui, cfgThresholds(d, ui, options, schema, errors))}
    ${card(t("Heizkurve"), "cfg_curve", ui, `${curveCard}
      <div class="cfggroup"><div class="h">${esc(t("Manuelle Anpassung"))}</div>
        <div class="grid g2">
          ${textField({ name: "heating_curve_offset", label: t("Offset"), value: options.heating_curve_offset ?? 0, type: "number", unit: "K", attrs: 'data-cfg="options" data-key="heating_curve_offset" step="0.1"' })}
          ${textField({ name: "heating_curve_slope", label: t("Steigung"), value: options.heating_curve_slope ?? 1, type: "number", attrs: 'data-cfg="options" data-key="heating_curve_slope" step="0.01"' })}
        </div>
      </div>`)}
    <section class="c"><div class="row start">${button(t("Speichern"), { act: "cfg-save", variant: "primary" })}<span class="muted">${esc(t("Speichern lädt die Integration neu."))}</span></div>${ui.cfgMsg ? `<div class="fd" role="status">${esc(ui.cfgMsg)}</div>` : ""}</section>
  </div>`;
  }
  function viewSchema(d, ui, live) {
    const k = d.kpis || {};
    const hyd = d.hydraulics || {};
    const rooms = d.rooms || [];
    const circuits = d.circuits || [];
    const byCircuit = {};
    for (const r of rooms) {
      const cid = r.circuit || "none";
      (byCircuit[cid] = byCircuit[cid] || []).push(r);
    }
    const circuitBoxes = circuits.map((c) => {
      const rs = byCircuit[c.id] || [];
      const idle = c.pump && c.pump.idle_share != null ? (c.pump.idle_share * 100).toFixed(0) + " %" : "–";
      const roomBoxes = rs.map((r) => {
        const lv = live[r.climate_entity] || {};
        const cur = lv.current != null ? lv.current : "–";
        const tgt = lv.target != null ? lv.target : "–";
        const dev = r.deviation && r.deviation.median != null ? (r.deviation.median > 0 ? "+" : "") + r.deviation.median.toFixed(1) : "–";
        return `<div class="sroom"><div class="snm">${esc(r.name)}</div><div class="sval">${esc(String(cur))} / ${esc(String(tgt))} °C</div><div class="smut">${esc(dev)} K</div></div>`;
      }).join("");
      return `<div class="scircuit">
      <div class="sbox scirc"><div class="stitle">${esc(c.name)}</div><div class="smut">${esc(c.type || "")}</div><div class="sval">Pumpe ${esc(idle)}</div></div>
      <div class="sarrow">↓</div>
      <div class="srooms">${roomBoxes || `<div class="smut">${esc(t("keine Räume"))}</div>`}</div>
    </div>`;
    }).join(`<div class="sarrowh">→</div>`);
    const cop = k.cop_short && k.cop_short.value != null ? k.cop_short.value.toFixed(1) : "–";
    const flow = k.flow_deviation ? k.flow_deviation.median : null;
    const flowTxt = flow != null ? (flow > 0 ? "+" : "") + flow.toFixed(1) + " K" : "–";
    return `<div class="schema">
    <div class="srow">
      <div class="sbox swp"><div class="stitle">${esc(t("Wärmepumpe"))}</div><div class="sval">COP ${esc(cop)}</div><div class="smut">Vorlauf ${esc(flowTxt)}</div></div>
    </div>
    <div class="sarrow">↓</div>
    <div class="srow">
      <div class="sbox spuffer"><div class="stitle">${esc(t("Puffer"))}</div><div class="smut">${esc(t("Puffer-Soll Vorlauf"))}</div></div>
    </div>
    <div class="sarrow">↓</div>
    <div class="scircuits">${circuitBoxes || `<div class="smut">${esc(t("Keine Heizkreise."))}</div>`}</div>
    <div class="slegend">${esc(t("Werte: Ist / Soll °C, Abweichung zum Soll."))}</div>
  </div>`;
  }
  function renderView(view, d, ui, live) {
    let body;
    switch (view) {
      case "effizienz":
        body = viewEffizienz(d, ui);
        break;
      case "raeume":
        body = viewRaeume(d, ui, live);
        break;
      case "vergleich":
        body = viewVergleich(d, ui);
        break;
      case "inventar":
        body = viewInventar(d, ui);
        break;
      case "protokoll":
        body = viewProtokoll(d, ui);
        break;
      case "einstellungen":
        body = viewEinstellungen(d, ui);
        break;
      case "schema":
        body = viewSchema(d, ui, live);
        break;
      default:
        body = viewAnlage(d, ui);
        break;
    }
    const withVerdict = ["anlage", "effizienz", "raeume", "protokoll", "schema"];
    return (withVerdict.includes(view) ? tabVerdict(d, view) : "") + body;
  }

  // src/card.js
  var HeizungsanalyseCard = class extends HTMLElement {
    setConfig(config) {
      this._config = { view: "anlage", ...config || {} };
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
      else if (this._data && this._config.view === "raeume") this._liveChanged() && this._render();
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
        if (st) out[r.climate_entity] = { current: st.attributes.current_temperature, target: st.attributes.temperature };
      }
      return out;
    }
    _liveChanged() {
      const key = JSON.stringify(this._live());
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
      this._paint(`${header(d, view)}${renderView(view, data, this._ui, this._live())}`);
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
      if (!el || !el.dataset || !el.dataset.chg) return;
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
    { view: "anlage", title: "Anlage", icon: "mdi:heat-pump" },
    { view: "effizienz", title: "Effizienz", icon: "mdi:chart-bell-curve-cumulative" },
    { view: "raeume", title: "Räume & Kreise", icon: "mdi:home-thermometer" },
    { view: "vergleich", title: "Vorher / Nachher", icon: "mdi:compare-horizontal" },
    { view: "inventar", title: "Inventar", icon: "mdi:clipboard-list-outline" },
    { view: "protokoll", title: "Protokoll", icon: "mdi:text-box-search-outline" },
    { view: "einstellungen", title: "Einstellungen", icon: "mdi:tune-variant" },
    { view: "schema", title: "Schema", icon: "mdi:sitemap-outline" }
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
