// Ansichten als reine HTML-Funktionen (ohne DOM) - die Karte verdrahtet nur Klicks.
import { getLang, t } from "./i18n.js";
import { binChart, ring, scatterChart, sparkline, timeChart, withWidth } from "./charts.js";
import { banner, button, card, empty, entityDatalists, entityField, head, kpiTile, progress, selectField, statusPill as pill, table, textField } from "./components.js";
import {
  comparisonFields,
  currentValue,
  fieldSpec,
  localized,
  objectEntries,
  objectName,
  objectSection,
  schemaOf,
  sectionFields,
  sectionSelectionHint,
  sectionTitle,
  targetChoices,
} from "./inventory.js";
import { CHECK_NAMES, SCORE_LEVEL, binByOutdoor, dayLabel, esc, fmt, kpiTone, linearFit, rangeRows, signed, trend, weatherAdjusted } from "./logic.js";

export const VIEWS = ["anlage", "effizienz", "raeume", "vergleich", "inventar", "protokoll", "einstellungen", "schema"];

// Diagramm in einem Messkasten: die Karte trägt die echte Breite in ui.widths ein
function box(ui, id, fn) {
  const w = (ui.widths && ui.widths[id]) || 640;
  return `<div class="cbox" data-cid="${id}">${withWidth(w, fn)}</div>`;
}

const EVIDENCE = {
  median_k: (v) => `Median ${signed(v)} K`,
  p90_k: (v) => `p90 ${signed(v)} K`,
  hours: (v) => `${fmt(v, 0)} h`,
  days: (v) => `${fmt(v, 0)} ${t("Tage")}`,
  samples: (v) => t("{n} Stichproben", { n: fmt(v, 0) }),
  outdoor_mean: (v) => `${t("Ø außen")} ${fmt(v)} °C`,
};

function evidence(ev) {
  return Object.entries(ev || {})
    .filter(([, v]) => v != null && typeof v !== "object")
    .slice(0, 5)
    .map(([k, v]) => `<span>${esc(EVIDENCE[k] ? EVIDENCE[k](v) : `${k}: ${typeof v === "number" ? fmt(v, Math.abs(v) < 10 ? 1 : 0) : v}`)}</span>`)
    .join("");
}

const NAV = [
  ["anlage", "Anlage"],
  ["effizienz", "Effizienz"],
  ["raeume", "Räume & Kreise"],
  ["vergleich", "Vorher / Nachher"],
  ["inventar", "Inventar"],
  ["protokoll", "Protokoll"],
  ["einstellungen", "Einstellungen"],
  ["schema", "Schema"],
];

export function header(d, view) {
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
    const count = ((d.log && d.log.entries) || []).length;
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

// ---------------------------------------------------------------- Anlage
export function viewAnlage(d, ui) {
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
      ${k.power_source === "fallback" ? `<div class="mt8">${pill("warn", t("Quelle {s}", { s: t("Ersatzquelle") }))}</div>` : ""}</div></div>
    ${(d.score.checks || []).some((c) => !c.active) ? `<div class="fs mt10">${esc(t("Ohne Bewertung:"))}</div><div class="ev">${(d.score.checks || []).filter((c) => !c.active).map((c) => `<span title="${esc(c.reason === "no_source" ? t("kein Sensor zugeordnet") : t("noch keine Daten"))}">${esc(t(CHECK_NAMES[c.key] || c.key))} · ${esc(c.reason === "no_source" ? t("kein Sensor") : t("keine Daten"))}</span>`).join("")}</div>` : ""}</div>`;

  const cop = k.cop_short.value;
  const copPill = (() => {
    if (cop == null) return pill("mut", t("keine Daten"));
    const today = d.series[d.series.length - 1];
    if (fit && today && today.cop != null && today.outdoor != null) {
      const exp = fit.at(today.outdoor);
      const rel = (today.cop - exp) / exp;
      return pill(rel > 0.08 ? "ok" : rel < -0.08 ? "warn" : "cool", rel > 0.08 ? t("über Kennlinie") : rel < -0.08 ? t("unter Kennlinie") : t("auf Kennlinie"));
    }
    return trendTxt ? pill(copTrend.dir === "down" ? "warn" : "ok", `${t("Trend")}: ${trendTxt}`) : "";
  })();
  const startsTone = kpiTone(k.starts_per_day, th.starts_per_day);
  const runTone = kpiTone(k.runtime_per_cycle, th.runtime_minutes, false);
  const flow = k.flow_deviation.median;
  const flowTone = flow == null ? "mut" : Math.abs(flow) <= 1 ? "ok" : Math.abs(flow) < (th.flow_deviation_k ?? 5) ? "warn" : "bad";

  const kpi = (key, title, value, unit, spark, body) => kpiTile({ title, key, ui, value, unit, spark, body });

  const kpis = `<div class="kpis">
    ${kpi("cop", t("COP 7 Tage"), fmt(cop, 1), cop != null && k.cop_long.value != null ? esc(t("30 T: {v}", { v: fmt(k.cop_long.value, 1) })) : "", sparkline(last30.map((r) => r.cop), "var(--hz-ok)"), copPill + (k.cop_total_short && k.cop_total_short.value != null ? `<div class="muted mt6">${esc(t("inkl. Warmwasser {v}", { v: fmt(k.cop_total_short.value, 1) }))}</div>` : ""))}
    ${kpi("starts", t("Starts / Tag"), fmt(k.starts_per_day, 0), th.starts_per_day ? esc(t("Schwelle {v}", { v: fmt(th.starts_per_day, 0) })) : "", sparkline(last30.map((r) => r.starts), "var(--hz-warn)", { kind: "bar", ref: th.starts_per_day }), k.starts_per_day == null ? pill("mut", t("keine Daten")) : pill(startsTone, startsTone === "bad" ? t("über der Schwelle") : t("im grünen Bereich")))}
    ${kpi("runtime", t("Laufzeit / Zyklus"), fmt(k.runtime_per_cycle, 0), t("min"), sparkline(last30.map((r) => r.cycle_min), "var(--hz-cool)"), k.runtime_per_cycle == null ? pill("mut", t("keine Daten")) : pill(runTone, runTone === "bad" ? t("unter der Schwelle") : t("im grünen Bereich")))}
    ${kpi("flow", t("Vorlauf Ist − Soll"), signed(flow), "K", sparkline(last30.map((r) => (r.flow != null && r.target_flow != null ? r.flow - r.target_flow : null)), "var(--hz-bad)", { ref: 0 }), flow == null ? pill("mut", t("keine Daten")) : pill(flowTone, flow > 1 ? t("Vorlauf zu warm → Kurve prüfen") : flow < -1 ? t("Vorlauf zu kalt") : t("passt")))}
  </div>`;

  const findings = d.findings.length
    ? d.findings
        .map((f) => `<div class="alert ${f.severity === "warning" ? "warning" : "info"}">
          <div class="abody">
            <div class="atitle"><span class="aid">${esc(f.id)}</span>${esc(f.title)}</div>
            <div class="adesc">${esc(f.text)}</div>
            ${f.suggestion ? `<div class="asug"><b>${esc(t("Empfehlung"))}:</b> ${esc(f.suggestion)}</div>` : ""}
            ${evidence(f.evidence) ? `<div class="aev">${evidence(f.evidence)}</div>` : ""}
          </div>
        </div>`)
        .join("")
    : `<div class="alert info"><div class="abody"><div class="atitle">${esc(t("Keine Hinweise"))}</div><div class="adesc">${esc(t("Keine Hinweise – keine Regel hat angeschlagen. Das heißt nicht, dass alles optimal ist."))}</div></div></div>`;

  const curve = copCurveCard(d, ui, fit);
  const energy = energyCard(d, ui, 30);
  const missing = missingCard(d);
  const liveCard = liveNow(d, ui);
  const extra = [costsCard(d, ui), dhwCard(d, ui), missing].filter(Boolean);

  return `<div class="grid hero">${scoreCard}${kpis}</div>
    <div class="grid g2"><div>${findings}</div>${curve}</div>
    <div class="grid g2">${energy}${liveCard || extra.shift() || ""}</div>
    ${extra.length ? `<div class="grid g2">${extra.join("")}</div>` : ""}`;
}

// Kosten aus Stundenverbrauch × Preis zur jeweiligen Stunde (Energie-Dashboard)
function costsCard(d, ui) {
  const c = (d.kpis && d.kpis.costs) || {};
  const m = c.month;
  const w = c.water;
  if (!m && !w) return "";
  const eur = (v) => (v == null ? "–" : fmt(v, v >= 100 ? 0 : 2));
  const tile = (label, value, unit, sub) =>
    `<div class="lv"><div class="muted">${esc(t(label))}</div><div class="big">${value}<small>${esc(unit)}</small></div>${sub ? `<div class="fd">${esc(sub)}</div>` : ""}</div>`;
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

// Warmwasserspeicher
function dhwCard(d, ui) {
  const w = (d.kpis && d.kpis.hydraulics && d.kpis.hydraulics.dhw) || null;
  if (!w || w.temperature == null) return "";
  const state = w.charging ? pill("warn", t("lädt")) : pill("mut", t("lädt nicht"));
  const tile = (label, value, unit) => `<div class="lv"><div class="muted">${esc(t(label))}</div><div class="big">${value}<small>${esc(unit)}</small></div></div>`;
  return `<div class="c">${head(t("Warmwasserspeicher"), "dhw_tank", ui)}<div class="row mt6">${state}</div>
    <div class="lvgrid">
      ${tile("Ist / Soll", `${fmt(w.temperature, 1)}`, w.target != null ? `/ ${fmt(w.target, 1)} °C` : "°C")}
      ${tile("Ladungen / Tag", fmt(w.charges_per_day, 1), "")}
      ${tile("Ladedauer", fmt(w.charge_minutes, 0), "min")}
      ${tile("Abkühlung", fmt(w.cooling_k_per_h, 2), "K/h")}
    </div></div>`;
}

// Momentanwerte der Wärmepumpe (WP-Vorlauf/-Rücklauf, Volumenstrom, Leistung)
function liveNow(d, ui) {
  const h = (d.kpis && d.kpis.hydraulics) || {};
  const lv = h.live;
  if (!lv || (lv.spread == null && lv.power_kw == null)) return "";
  const tile = (label, value, unit, tone = "") =>
    `<div class="lv"><div class="muted">${esc(t(label))}</div><div class="big ${tone}">${value}<small>${esc(unit)}</small></div></div>`;
  const state = lv.running === true ? pill("ok", t("Verdichter läuft")) : lv.running === false ? pill("mut", t("Verdichter aus")) : "";
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
  const series = hasDhw
    ? [
        { key: "space", kind: "bar", color: "var(--hz-heat)", axis: "l", stack: true, label: t("Wärme") },
        { key: "dhw", kind: "bar", color: "var(--hz-vio)", axis: "l", stack: true, label: t("Warmwasser") },
        { key: "power", kind: "line", color: "var(--hz-cool)", axis: "l", label: t("Strom") },
      ]
    : [
        { key: "heat", kind: "bar", color: "var(--hz-heat)", axis: "l", label: t("Wärme") },
        { key: "power", kind: "line", color: "var(--hz-cool)", axis: "l", label: t("Strom") },
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
    spread: "Spreizung Vor-/Rücklauf",
  };
  const items = d.missing.map((m) => names[m]).filter(Boolean);
  if (!items.length) return "";
  return `<div class="c"><div class="h">${esc(t("Was fehlt?"))}</div><div class="fs">${esc(t("Diese Auswertungen brauchen noch einen Sensor:"))}</div>
    <div class="ev">${items.map((x) => `<span>${esc(t(x))}</span>`).join("")}</div><div class="fd mt10">${esc(t("Ein Sensor lässt sich unter Einstellungen → Geräte & Dienste → Heizungsanalyse → Konfigurieren ergänzen."))}</div></div>`;
}

// ---------------------------------------------------------------- Effizienz
export function viewEffizienz(d, ui) {
  const days = ui.range ?? 90;
  const rows = rangeRows(d.series, days);
  const seg = `<div class="seg">${[[30, "30 Tage"], [90, "90 Tage"], [365, "1 Jahr"]].map(([v, l]) => `<button data-range="${v}" class="${days === v ? "on" : ""}">${esc(t(l))}</button>`).join("")}</div>`;
  const markers = (d.changes || []).filter((c) => c.day).map((c) => ({ day: c.day, label: `${c.object} ${c.field}: ${c.old ?? ""} → ${c.new ?? ""}` }));
  const copLine = `<div class="c">${head(t("COP-Verlauf"), "copline", ui)}${box(ui, "copline", () => timeChart(rows, [
    { key: "cop", kind: "area", color: "var(--hz-ok)", axis: "l", digits: 2 },
    { key: "outdoor", kind: "line", color: "var(--hz-cool)", axis: "r", width: 1.6, dash: "4 3" },
  ], { unitL: "COP", unitR: "°C", markers }))}
    <div class="legend"><span><i class="sw-ok"></i>COP</span><span><i class="sw-cool"></i>${esc(t("Außentemperatur"))}</span>${markers.length ? `<span><i class="sw-vio"></i>${esc(t("Änderung"))}</span>` : ""}</div></div>`;

  const curveRows = rows.filter((r) => r.outdoor != null && (r.flow != null || r.target_flow != null));
  const flowPts = curveRows.filter((r) => r.flow != null).map((r) => ({ x: r.outdoor, y: r.flow, color: "var(--hz-heat)", opacity: 0.7, title: `${dayLabel(r.day)} ${t("Vorlauf")} ${fmt(r.flow)} °C` }));
  const tgtPts = curveRows.filter((r) => r.target_flow != null).map((r) => ({ x: r.outdoor, y: r.target_flow, color: "var(--hz-cool)", opacity: 0.55, r: 3.4, title: `${dayLabel(r.day)} ${t("Soll-Vorlauf")} ${fmt(r.target_flow)} °C` }));
  const fitF = linearFit(flowPts.map((p) => ({ x: p.x, y: p.y })));
  const fitT = linearFit(tgtPts.map((p) => ({ x: p.x, y: p.y })));
  const xs = curveRows.map((r) => r.outdoor);
  const lineOf = (fit, color, dash) => (fit && xs.length ? [{ color, dash, points: [{ x: Math.min(...xs), y: fit.at(Math.min(...xs)) }, { x: Math.max(...xs), y: fit.at(Math.max(...xs)) }] }] : []);
  const curve = `<div class="c">${head(t("Heizkurve"), "curve", ui)}${box(ui, "curve", () => scatterChart(flowPts.concat(tgtPts), { unitY: "°C", lines: lineOf(fitF, "var(--hz-heat)").concat(lineOf(fitT, "var(--hz-cool)", "6 4")) })) || `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i class="sw-heat"></i>${esc(t("Vorlauf"))}</span><span><i class="sw-cool"></i>${esc(t("Soll-Vorlauf"))}</span></div></div>`;

  const th = d.thresholds || {};
  const startBins = binByOutdoor(rows, "starts");
  const cycling = `<div class="c">${head(t("Takten"), "cycling", ui, esc(t("Starts pro Tag nach Außentemperatur")))}${startBins.length ? box(ui, "cycling", () => binChart(startBins, { ref: th.starts_per_day, unit: t("Starts/Tag"), digits: 0 })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
  const cycle = `<div class="c">${head(t("Laufzeit je Zyklus"), "cycle", ui)}${rows.some((r) => r.cycle_min != null) ? box(ui, "cycle", () => timeChart(rows, [{ key: "cycle_min", kind: "line", color: "var(--hz-cool)", axis: "l", digits: 0 }], { unitL: "min", refL: th.runtime_minutes })) : ""}${rows.some((r) => r.cycle_min != null) ? "" : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
  const hasDef = rows.some((r) => r.defrost_h != null || r.aux_h != null);
  const defrost = `<div class="c">${head(t("Abtauen & Heizstab"), "defrost", ui)}${hasDef ? box(ui, "defrost", () => timeChart(rows, [
    { key: "defrost_h", kind: "bar", color: "var(--hz-cool)", axis: "l", stack: true, label: t("Abtauen") },
    { key: "aux_h", kind: "bar", color: "var(--hz-bad)", axis: "l", stack: true, label: t("Heizstab") },
  ], { unitL: t("h/Tag") })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i class="sw-cool"></i>${esc(t("Abtauen"))}</span><span><i class="sw-bad"></i>${esc(t("Heizstab"))}</span></div></div>`;
  const heat = rows.reduce((s, r) => s + (r.heat || 0), 0);
  const dhw = rows.reduce((s, r) => s + (r.dhw || 0), 0);
  const dhwCard = rows.some((r) => r.dhw != null)
    ? `<div class="c">${head(t("Warmwasseranteil"), "dhw", ui)}<div class="big">${fmt(heat ? (dhw / heat) * 100 : null, 0)}<small>%</small></div><div class="meter"><i style="width:${heat ? Math.min(100, (dhw / heat) * 100) : 0}%;background:var(--hz-vio)"></i></div><div class="muted mt8">${fmt(dhw, 0)} / ${fmt(heat, 0)} kWh</div></div>`
    : "";

  const hy = (d.kpis && d.kpis.hydraulics) || {};
  const dailyRows = (map, key) => Object.entries(map || {}).map(([day, v]) => ({ day, [key]: v }));
  const spreadRows = dailyRows(hy.spread_daily, "spread");
  const overRows = dailyRows(hy.overshoot_daily, "over");
  const spreadCard = spreadRows.length
    ? `<div class="c">${head(t("Spreizung"), "spread", ui, esc(t("WP-Vorlauf − WP-Rücklauf, nur Laufstunden")))}${box(ui, "spread", () => timeChart(spreadRows, [{ key: "spread", kind: "line", color: "var(--hz-vio)", axis: "l", digits: 1 }], { unitL: "K", refL: th.spread_min_k }))}
      <div class="legend"><span>${esc(t("Median {m} K · Ziel {a}–{b} K", { m: fmt(hy.spread && hy.spread.median, 1), a: fmt(th.spread_min_k, 0), b: fmt(th.spread_max_k, 0) }))}</span></div></div>`
    : "";
  const overCard = overRows.length
    ? `<div class="c">${head(t("Puffer-Ladung"), "overshoot", ui, esc(t("WP-Vorlauf − Puffer-Soll")))}${box(ui, "overshoot", () => timeChart(overRows, [{ key: "over", kind: "line", color: "var(--hz-heat)", axis: "l", digits: 1 }], { unitL: "K", refL: 0 }))}
      <div class="legend"><span>${esc(t("Median {m} K über Puffer-Soll", { m: fmt(hy.overshoot && hy.overshoot.median, 1) }))}</span></div></div>`
    : "";

  return `<div class="row">${seg}</div>
    <div class="grid g2">${copLine}${curve}</div>
    ${spreadCard || overCard ? `<div class="grid g2">${spreadCard}${overCard}</div>` : ""}
    <div class="grid g3">${cycling}${cycle}${defrost}${dhwCard}</div>
    <div class="grid g2">${energyCard(d, ui, days)}</div>`;
}

// ---------------------------------------------------------------- Räume & Kreise
export function viewRaeume(d, ui, live = {}) {
  const tol = 1;
  const span = 3;
  const rooms = (d.rooms || []).slice().sort((a, b) => Math.abs(b.deviation?.median ?? 0) - Math.abs(a.deviation?.median ?? 0));
  const pos = (v) => 50 + (Math.max(-span, Math.min(span, v)) / span) * 50;
  const roomRows = rooms.length
    ? rooms
        .map((r) => {
          const dv = r.deviation;
          const m = dv?.median;
          const tone = m == null ? "mut" : Math.abs(m) <= 0.5 ? "ok" : Math.abs(m) <= tol ? "warn" : "bad";
          const color = { ok: "var(--hz-ok)", warn: "var(--hz-warn)", bad: "var(--hz-bad)", mut: "var(--hz-mut)" }[tone];
          const bar = m == null ? "" : `<i style="left:${Math.min(50, pos(m))}%;width:${Math.max(1.5, Math.abs(pos(m) - 50))}%;background:${color}"></i>`;
          const p90 = dv?.p90 != null ? `<span class="p90" style="left:${pos(dv.p90)}%"></span>` : "";
          const lv = live[r.climate_entity];
          const now = lv ? `${fmt(lv.current)} / ${fmt(lv.target)} °C` : "";
          const extras = [
            dv?.under_share != null && dv.under_share > 0.05 ? pill("cool", t("zu kalt {p} %", { p: fmt(dv.under_share * 100, 0) })) : "",
            dv?.over_share != null && dv.over_share > 0.05 ? pill("warn", t("zu warm {p} %", { p: fmt(dv.over_share * 100, 0) })) : "",
            r.heating_up_min != null ? pill("mut", `${t("Aufheizzeit")} ${fmt(r.heating_up_min, 0)} min`) : "",
            lv && lv.valve != null ? pill("mut", t("Ventil {v} %", { v: fmt(lv.valve, 0) })) : !r.valve_available ? pill("mut", t("ohne Ventilwert")) : "",
            dv && !dv.samples ? pill("mut", t("noch keine Stichproben")) : "",
          ].filter(Boolean).join("");
          return `<div class="room"><div class="nm">${esc(r.name)}<small>${esc(r.circuit_name || "")}${now ? ` · ${now}` : ""}</small></div>
            <div class="dev"><span class="tol" style="left:${pos(-tol)}%;width:${pos(tol) - pos(-tol)}%"></span><span class="mid"></span>${bar}${p90}</div>
            <b>${m == null ? "–" : signed(m)} K</b>${extras ? `<div class="extra">${extras}</div>` : ""}</div>`;
        })
        .join("")
    : `<div class="empty">${esc(t("noch keine Stichproben"))}</div>`;
  const roomsCard = `<div class="c">${head(t("Räume"), "rooms", ui, esc(t("Abweichung zum Soll")))}
    <div class="legend between"><span>← ${esc(t("zu kalt"))}</span><span>${esc(t("zu warm"))} →</span></div>${roomRows}</div>`;

  const th = d.thresholds || {};
  const circuits = (d.circuits || [])
    .map((c) => {
      const idle = c.pump?.idle_share;
      const idleTone = idle == null ? "mut" : kpiTone(idle, th.pump_idle_share);
      const pulses = c.mixer?.pulses_per_day;
      const run = c.pump?.run_share;
      const fl = c.flow || {};
      const pumpBlock = !c.has_pump
        ? `<div class="fd">${esc(t("keine Pumpe zugeordnet"))}</div>`
        : c.decoupled
          ? `<div class="big">${fmt(run == null ? null : run * 100, 0)}<small>%</small></div><div class="meter"><i style="width:${run == null ? 0 : Math.min(100, run * 100)}%;background:var(--hz-cool)"></i></div><div class="fd mt6">${esc(t("Hinter dem Puffer: Laufen ohne Verdichter ist normal."))}</div>`
          : `<div class="big">${fmt(idle == null ? null : idle * 100, 0)}<small>%</small></div><div class="meter"><i style="width:${idle == null ? 0 : Math.min(100, idle * 100)}%;background:var(--hz-${idleTone === "mut" ? "cool" : idleTone})"></i></div>`;
      const flowBlock = fl.actual != null
        ? `<div><div class="muted">${esc(t("Vorlauf Ist / Soll"))}</div><div class="big">${fmt(fl.actual, 1)}<small>/ ${fmt(fl.target, 1)} °C</small></div>${fl.deviation && fl.deviation.median != null ? `<div class="fd">${esc(t("Median 7 Tage {m} K", { m: signed(fl.deviation.median) }))}</div>` : ""}</div>`
        : "";
      return `<div class="cblock"><div class="ct">${esc(c.name)} <span class="muted">${esc(c.rooms.join(", "))}</span></div>
        <div class="circ"><div><div class="muted">${esc(t(c.decoupled ? "Pumpe läuft" : "Pumpe ohne Verdichter"))}</div>
        ${pumpBlock}</div>${flowBlock}
        <div><div class="muted">${esc(t("Mischer-Impulse"))}</div>${c.has_mixer ? `<div class="big">${fmt(pulses, 0)}<small>${esc(t("/Tag"))}</small></div>` : `<div class="fd">${esc(t("kein Mischer zugeordnet"))}</div>`}</div></div></div>`;
    })
    .join("");
  return `<div class="grid g2">${roomsCard}${circuits ? `<div class="c">${head(t("Heizkreise"), "circuits", ui)}${circuits}</div>` : ""}</div>`;
}

// ---------------------------------------------------------------- Vorher / Nachher
const SECTIONS = { pumps: "Pumpe", thermostats: "Thermostat", hydraulics: "Hydraulik" };
export function objectLabel(obj) {
  const [section, key] = String(obj || "").split(".");
  const name = SECTIONS[section] ? t(SECTIONS[section]) : section;
  return key ? `${name} ${key}` : name;
}
export function viewVergleich(d, ui) {
  const fit = copFit(d);
  const changes = d.changes || [];
  const delta = (a, b, digits, betterUp = true) => {
    if (a == null || b == null) return "";
    const diff = b - a;
    const good = betterUp ? diff > 0 : diff < 0;
    return ` <span class="pill tone-${Math.abs(diff) < 1e-9 ? "mut" : good ? "ok" : "warn"}">${signed(diff, digits)}</span>`;
  };
  const fieldName = (object, field) => {
    const hit = comparisonFields(d, object).find((item) => item.key === field);
    return hit ? hit.label : field;
  };
  const list = changes.length
    ? changes
        .map((c) => {
          const b = c.before;
          const a = c.after;
          const adj = weatherAdjusted(b, a, fit);
          const what = `${objectName(d, c.object)}${c.field ? ` · ${fieldName(c.object, c.field)}` : ""}`;
          const val = c.old != null || c.new != null ? `: ${c.old ?? "–"} → ${c.new ?? "–"}` : "";
          const cmp = a && a.days >= 3 && b
            ? `<div class="cmp">
                <div>COP<b>${fmt(b.cop, 2)} → ${fmt(a.cop, 2)}${delta(b.cop, a.cop, 2)}</b></div>
                ${adj && adj.adjusted != null ? `<div>${esc(t("wetterbereinigt"))}<b><span class="pill tone-${Math.abs(adj.adjusted) < 0.05 ? "mut" : adj.adjusted > 0 ? "ok" : "warn"}">${signed(adj.adjusted, 2)}</span></b></div>` : ""}
                <div>${esc(t("Starts/Tag"))}<b>${fmt(b.starts_per_day, 1)} → ${fmt(a.starts_per_day, 1)}${delta(b.starts_per_day, a.starts_per_day, 1, false)}</b></div>
                <div>${esc(t("Zyklus (min)"))}<b>${fmt(b.runtime_per_cycle_min, 0)} → ${fmt(a.runtime_per_cycle_min, 0)}${delta(b.runtime_per_cycle_min, a.runtime_per_cycle_min, 0)}</b></div>
                <div>${esc(t("Ø außen"))}<b>${fmt(b.outdoor, 1)} → ${fmt(a.outdoor, 1)} °C</b></div>
              </div>`
            : `<div class="fd">${esc(t("noch zu wenig Tage danach"))}</div>`;
          return `<div class="chg"><span class="d"></span><div><div class="t">${esc(dayLabel(c.day))} ${esc(what)}${esc(val)}</div>${c.note ? `<div class="fd">${esc(c.note)}</div>` : ""}${cmp}</div></div>`;
        })
        .join("")
    : empty(t("Noch keine Änderung eingetragen. Trag z. B. „Heizkurve 0,6 → 0,5“ ein – nach ein paar Tagen siehst du hier, was es gebracht hat."));

  const targets = targetChoices(d);
  const object = targets.some((item) => item.value === ui.chgObject) ? ui.chgObject : "heizkurve";
  const options = comparisonFields(d, object);
  const field = options.some((item) => item.key === ui.chgField) ? ui.chgField : options[0].key;
  const old = currentValue(d, object, field);
  const labels = options.map((item) => ({ value: item.key, label: `${item.label}${item.unit ? ` (${item.unit})` : ""}` }));
  const form = ui.form
    ? `<form class="log" data-form="log">
        ${selectField({ name: "object", label: t("Was"), value: object, options: targets, attrs: 'data-chg="object"' })}
        ${selectField({ name: "field", label: t("Einstellung"), value: field, options: labels, attrs: 'data-chg="field"' })}
        ${textField({ name: "old_value", label: t("Alt"), value: old, placeholder: "0,6" })}
        ${textField({ name: "new_value", label: t("Neu"), placeholder: "0,5" })}
        <div class="span2">${textField({ name: "note", label: t("Notiz") })}</div>
        <div class="row span2">${button(t("Speichern"), { type: "submit", variant: "primary" })}${button(t("Abbrechen"), { act: "form-close" })}</div>
      </form>`
    : `<div class="row start">${button(`+ ${t("Änderung eintragen")}`, { act: "form-open" })}</div>`;
  return `<div class="intro">${esc(t("{n} eingetragene Änderungen – Wirkung ab drei Tagen danach.", { n: changes.length }))}</div>
    <div class="grid g2"><div class="c">${head(t("Änderungen und ihre Wirkung"), "changes", ui)}${list}${form}</div>${viewEffizienzCopOnly(d, ui)}</div>`;
}

function viewEffizienzCopOnly(d, ui) {
  const rows = rangeRows(d.series, 90);
  const markers = (d.changes || []).filter((c) => c.day).map((c) => ({ day: c.day, label: `${c.object} ${c.field}` }));
  return `<div class="c">${head(t("COP-Verlauf"), "copline", ui, `90 ${esc(t("Tage"))}`)}${box(ui, "copline90", () => timeChart(rows, [
    { key: "cop", kind: "area", color: "var(--hz-ok)", axis: "l", digits: 2 },
    { key: "outdoor", kind: "line", color: "var(--hz-cool)", axis: "r", width: 1.6, dash: "4 3" },
  ], { unitL: "COP", unitR: "°C", markers })) || `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
}

// ---------------------------------------------------------------- Inventar
const INV_ERRORS = {
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
  _: "Wert prüfen",
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
    const byManufacturer = new Map();
    for (const entry of catalog) {
      const manufacturer = entry.manufacturer || "";
      if (!byManufacturer.has(manufacturer)) byManufacturer.set(manufacturer, []);
      byManufacturer.get(manufacturer).push({
        value: entry.id,
        label: { de: entry.model || entry.id, en: entry.model || entry.id },
        attrs: `data-fields="${esc(JSON.stringify(entry.fields || {}))}" data-note="${esc(localized(entry.note) || "")}"`,
      });
    }
    for (const [manufacturer, options] of byManufacturer) {
      groups.push({ label: { de: manufacturer, en: manufacturer }, options });
    }
  }
  const catalogField = groups.length
    ? `<div class="span2">${selectField({
        name: `cat_${section}`,
        label: t("Modell aus Katalog"),
        value: "",
        options: [{ value: "", label: { de: "– Freitext –", en: "– free text –" } }],
        groups,
        attrs: `data-catalog="${section}"`,
      })}<div class="fd mt6" data-cat-note></div></div>`
    : "";
  return catalogField + fields
    .map((spec) => {
      const value = state.values && state.values[spec.key] != null ? state.values[spec.key] : "";
      const name = `f_${spec.key}`;
      const error = errors[spec.key] ? invErrorText(errors[spec.key]) : "";
      const label = localized(spec.label) || spec.key;
      if (spec.type === "select" || spec.type === "room" || spec.type === "circuit") {
        const options = spec.options || [];
        return `<div class="span2">${selectField({ name, label, value, options, error })}</div>`;
      }
      const attrs =
        spec.type === "number"
          ? `${spec.min != null ? ` min="${spec.min}"` : ""}${spec.max != null ? ` max="${spec.max}"` : ""}${spec.step != null ? ` step="${spec.step}"` : ""}`
          : "";
      return `<div class="span2">${textField({ name, label, value, type: spec.type === "number" ? "number" : "text", unit: spec.unit || "", error, attrs })}</div>`;
    })
    .join("") + (editing ? "" : "");
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
    attrs: 'data-inv-selection="1"',
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
      `<span class="rowact">${button(t("Bearbeiten"), { act: "inv-edit", attrs: `data-object="${esc(entry.object)}" data-section="${esc(section)}"` })}${button(t("Löschen"), { act: "inv-del", variant: "ghost danger", attrs: `data-object="${esc(entry.object)}" data-section="${esc(section)}"` })}</span>`,
    ];
  });
  return table({ cols, rows, emptyText: t("Noch nichts eingetragen."), cls: "invtable" });
}

export function viewInventar(d, ui) {
  const inventory = d.inventory || {};
  const completeness = d.inventory_completeness || { percent: 0, sections: {} };
  const percent = completeness.percent || 0;
  const count = ["pumps", "thermostats", "hydraulics", "radiators"].reduce(
    (sum, section) => sum + objectEntries(d, section).length,
    0,
  );
  const intro = `<div class="intro"><span>${esc(t("Inventar zu {p} % vollständig · {n} Einträge", { p: percent, n: count }))}</span>${progress(percent)}</div>`;

  const sections = ["pumps", "thermostats", "hydraulics", "radiators"]
    .map((section) => {
      const info = (completeness.sections || {})[section] || {};
      const hint = info.hint && (info.percent || 0) < 100 ? `<div class="fd mt6">${esc(localized(info.hint))}</div>` : "";
      const body = `${invTable(d, ui, section)}${hint}<div class="row start">${button(`+ ${t("Eintrag hinzufügen")}`, { act: "inv-add", attrs: `data-section="${esc(section)}"` })}</div>`;
      return card(sectionTitle(d, section), "inventory", ui, body, info.percent != null ? `${info.percent} %` : "");
    })
    .join("");

  const prefill = (d.rooms || []).length
    ? `<div class="row start">${button(t("Aus Räumen übernehmen"), { act: "inv-prefill" })}<span class="muted">${esc(t("Legt Thermostat und Heizkörper je Raum an, ohne Werte zu erfinden."))}</span></div>`
    : "";

  const csv = `<details class="impexp"><summary>${esc(t("CSV Import und Export"))}</summary>
      <p class="muted">${esc(t("Format: object,field,value – eine Zeile je Wert."))}</p>
      <div class="row start">${button(t("CSV herunterladen"), { act: "inv-export" })}</div>
      <textarea name="inv-csv" data-inv-csv rows="5" placeholder="pumps.hk1,manufacturer,Hersteller"></textarea>
      <div class="row start">${button(t("CSV übernehmen"), { act: "inv-import" })}<span class="muted">${esc(t("Bestehende Werte werden ergänzt."))}</span></div>
    </details>`;

  const saved = ui.invSaved
    ? `${banner("ok", t("Gespeichert. Vergleiche die Wirkung nach frühestens 14 Tagen."))}<div class="row start">${button(t("Jetzt zum Vergleich"), { act: "goto-vergleich" })}</div>`
    : "";

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
    dhw_pump_entity: "Warmwasser-Ladepumpe",
  };
  return Object.entries(d.sources || {})
    .map(([key, ok]) => `<div class="src"><span>${esc(labels[key] ? t(labels[key]) : key)}</span>${pill(ok ? "ok" : "mut", ok ? t("verbunden") : t("fehlt"))}</div>`)
    .join("");
}

// ---------------------------------------------------------------- Protokoll
const LEVELS_LOG = [
  ["error", "Fehler"],
  ["warn", "Warnung"],
  ["info", "Info"],
];
const CATS_LOG = [
  ["start", "Start"],
  ["update", "Auswertung"],
  ["source", "Quelle"],
  ["finding", "Hinweis"],
  ["config", "Konfiguration"],
  ["inventory", "Inventar"],
  ["dashboard", "Dashboard"],
  ["frontend", "Karte"],
  ["error", "Fehler"],
];
const RANGES_LOG = [
  [24, "24 Stunden"],
  [168, "7 Tage"],
  [720, "30 Tage"],
];
const SOURCE_STATUS = {
  ok: ["ok", "ok"],
  no_statistics: ["warn", "keine Statistik"],
  history: ["ok", "aus Verlauf"],
  unit_mismatch: ["bad", "unpassend"],
  state_class_mismatch: ["bad", "unpassend"],
  format: ["warn", "Format"],
  not_found: ["bad", "nicht gefunden"],
  unavailable: ["bad", "nicht verfügbar"],
};

const LOG_EN = {
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
  "error.update": "Update failed: {error}",
};

function logMessage(entry) {
  if (getLang() !== "en" || !entry.key) return entry.msg;
  const template = LOG_EN[entry.key];
  if (!template) return entry.msg;
  return template.replace(/\{(\w+)\}/g, (match, key) => (entry.params && entry.params[key] != null ? entry.params[key] : match));
}

const timeOf = (iso) => {
  const at = iso ? new Date(iso) : null;
  if (!at || Number.isNaN(at.getTime())) return "–";
  return at.toLocaleTimeString(getLang() === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};
const dayOf = (iso) => {
  const at = iso ? new Date(iso) : null;
  if (!at || Number.isNaN(at.getTime())) return "";
  return at.toLocaleDateString(getLang() === "de" ? "de-DE" : "en-GB", { weekday: "short", day: "2-digit", month: "2-digit" });
};

function runtimeCard(d, ui) {
  const rt = (d.diag && d.diag.runtime) || {};
  const versions = (d.diag && d.diag.versions) || {};
  const card = versions.card || {};
  const mismatch = card.matches === false;
  const storage = (d.diag && d.diag.storage) || {};
  const k = (d.diag && d.diag.summary && d.diag.summary.kpis) || {};
  const next = rt.next_run ? timeOf(rt.next_run) : "–";
  const rows = [
    [t("Backend"), esc(String(versions.integration || "–"))],
    [t("Karte"), esc(String(card.version || "–"))],
    [t("Letzter Lauf"), `${esc(String(rt.run_index ?? 0))}. ${esc(t("Lauf"))} · ${esc(fmt(rt.last_duration_ms, 0))} ${esc(t("ms"))}`],
    [t("Nächster Lauf"), esc(next)],
    [t("Letzter Fehler"), rt.last_error ? pill("bad", rt.last_error) : pill("ok", t("keiner"))],
    [t("Tage mit Daten"), esc(fmt(k.days_with_data, 0))],
    [t("Speicherstand"), `${esc(fmt(storage.rollups, 0))} ${esc(t("Roll-ups"))} · ${esc(fmt(storage.log_entries, 0))} ${esc(t("Protokollzeilen"))}`],
  ];
  return `<div class="c">${head(t("Systemstatus"), "system", ui)}${mismatch ? `<div class="fs">${pill("warn", t("Version weicht ab"))}</div>` : ""}
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
  const rows = (d.diag && d.diag.source_checks) || [];
  if (!rows.length) return `<div class="c">${head(t("Quellen-Check"), "sources_check", ui)}<div class="empty">${esc(t("Keine Quellen zugeordnet."))}</div></div>`;
  const body = rows
    .map((row) => {
      const [tone, label] = SOURCE_STATUS[row.status] || ["mut", row.status || "–"];
      const last = row.daily_last ? `${dayOf(row.daily_last)} ${timeOf(row.daily_last)}` : "–";
      return `<tr>
        <td><b>${esc(row.entity)}</b><div class="muted">${esc(row.kind || "")}</div></td>
        <td>${pill(tone, t(label))}${row.advice ? `<div class="fd">${esc(t(row.advice))}</div>` : ""}</td>
        <td>${esc(row.unit || row.statistic_unit || "–")}<div class="muted">${esc(row.state_class || "")}</div></td>
        <td>${esc(fmt(row.hourly_rows, 0))} / ${esc(fmt(row.daily_rows, 0))}</td>
        <td>${esc(last)}</td>
      </tr>`;
    })
    .join("");
  return `<div class="c">${head(t("Quellen-Check"), "sources_check", ui)}
    <table class="src"><tr><th>${esc(t("Quelle"))}</th><th>${esc(t("Status"))}</th><th>${esc(t("Einheit"))}</th><th>${esc(t("Zeilen 7/31"))}</th><th>${esc(t("Letzter Wert"))}</th></tr>
    ${body}</table></div>`;
}

function logList(d, ui) {
  const entries = (d.log && d.log.entries) || [];
  const cats = [...new Set(entries.map((e) => e.cat))];
  const chipRow = (items, current, attr) =>
    [`<button class="chip ${current ? "" : "on"}" ${attr}="">${esc(t("Alle"))}</button>`]
      .concat(items.map(([value, label]) => `<button class="chip ${current === value ? "on" : ""}" ${attr}="${esc(value)}">${esc(t(label))}</button>`))
      .join("");
  const catChips = chipRow(CATS_LOG.filter(([value]) => cats.includes(value) || !cats.length), ui.logCat, "data-log-cat");
  const levelChips = LEVELS_LOG.some(([value]) => entries.some((e) => e.level === value))
    ? chipRow(LEVELS_LOG.filter(([value]) => entries.some((e) => e.level === value)), ui.logLevel, "data-log-level")
    : "";
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

export function viewProtokoll(d, ui) {
  const diag = d.diag;
  return `<div class="grid g2">${runtimeCard(d, ui)}${sourcesCard(d, ui)}</div>
    <div class="grid">${logList(d, ui)}</div>
    ${!diag ? `<div class="c empty">${esc(t("Diagnose nicht verfügbar – Protokoll wird trotzdem angezeigt."))}</div>` : ""}`;
}

const CFG_ERRORS = {
  required: "Pflichtfeld",
  not_found: "Entity nicht gefunden",
  unit: "Einheit passt nicht",
  number: "Bitte eine Zahl eintragen",
  range: "Wert außerhalb des Bereichs",
  option: "Bitte aus der Liste wählen",
  reference: "Verweis nicht gefunden",
  duplicate: "Bezeichner ist doppelt",
  format: "Aufbau ist ungültig",
  _: "Wert prüfen",
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
      attrs: `data-cfg="${spec.scope}" data-key="${esc(spec.key)}"`,
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
      attrs: `data-thr="${esc(spec.key)}" min="${spec.min}" max="${spec.max}" step="${spec.step}"`,
    });
  });
  return `<div class="grid g3">${rows.join("")}</div>
    <div class="row start">${button(t("Auf Standard zurücksetzen"), { act: "cfg-thr-reset" })}</div>`;
}

export function viewEinstellungen(d, ui) {
  const cfg = (d && d.config) || {};
  const data = cfg.data || {};
  const options = cfg.options || {};
  const schema = (d && d.settings_schema) || { sources: [], thresholds: [], circuit_types: [], room_types: [] };
  const errors = (ui && ui.cfgErrors) || {};
  const coverage = (d && d.settings_coverage) || {};
  const errorCount = Object.keys(errors).length;
  const intro = `<div class="intro"><span>${esc(t("Pflichtquellen: {a} von {b} verbunden", { a: coverage.required_filled ?? 0, b: coverage.required ?? 0 }))}</span>${cfg.coverage ? "" : ""}</div>`;
  const errBanner = errorCount ? banner("bad", t("{n} Felder brauchen Aufmerksamkeit.", { n: errorCount })) : "";

  const sg = (d && d.suggestion) || {};
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

export function viewSchema(d, ui, live) {
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
    const share = c.decoupled ? c.pump && c.pump.run_share : c.pump && c.pump.idle_share;
    const idle = share != null ? (share * 100).toFixed(0) + " %" : "–";
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


export function renderView(view, d, ui, live) {
  let body;
  switch (view) {
    case "effizienz": body = viewEffizienz(d, ui); break;
    case "raeume": body = viewRaeume(d, ui, live); break;
    case "vergleich": body = viewVergleich(d, ui); break;
    case "inventar": body = viewInventar(d, ui); break;
    case "protokoll": body = viewProtokoll(d, ui); break;
    case "einstellungen": body = viewEinstellungen(d, ui); break;
    case "schema": body = viewSchema(d, ui, live); break;
    default: body = viewAnlage(d, ui); break;
  }
  const withVerdict = ["anlage", "effizienz", "raeume", "protokoll", "schema"];
  return (withVerdict.includes(view) ? tabVerdict(d, view) : "") + body;
}
