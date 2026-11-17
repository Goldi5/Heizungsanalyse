// Ansichten als reine HTML-Funktionen (ohne DOM) - die Karte verdrahtet nur Klicks.
import { getLang, t } from "./i18n.js";
import { helpText } from "./help.js";
import { binChart, ring, scatterChart, sparkline, timeChart, withWidth } from "./charts.js";
import { CHECK_NAMES, SCORE_LEVEL, binByOutdoor, dayLabel, esc, fmt, kpiTone, linearFit, rangeRows, signed, trend, weatherAdjusted } from "./logic.js";

export const VIEWS = ["anlage", "effizienz", "raeume", "vergleich", "inventar", "protokoll", "einstellungen"];

// Kopf einer Kachel mit „?“
function head(title, key, ui, sub = "") {
  const open = ui.help === key;
  return `<div class="h">${esc(title)}${sub ? ` <span class="sub">${sub}</span>` : ""}<button class="q ${open ? "on" : ""}" data-help="${key}" aria-label="?">?</button></div>${open ? `<div class="help">${esc(helpText(key))}</div>` : ""}`;
}

// Diagramm in einem Messkasten: die Karte trägt die echte Breite in ui.widths ein
function box(ui, id, fn) {
  const w = (ui.widths && ui.widths[id]) || 640;
  return `<div class="cbox" data-cid="${id}">${withWidth(w, fn)}</div>`;
}

const pill = (tone, text) => `<span class="pill tone-${tone}">${esc(text)}</span>`;

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

export function header(d, view) {
  const names = { anlage: "Anlage", effizienz: "Effizienz", raeume: "Räume & Kreise", vergleich: "Vorher / Nachher", inventar: "Inventar", protokoll: "Protokoll" };
  const at = d.generated ? new Date(d.generated) : null;
  const time = at ? at.toLocaleTimeString(getLang() === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
  return `<div class="head"><h1>${esc(t(names[view] || "Anlage"))}</h1><span class="muted">${esc(d.title || t("Heizungsanalyse"))}</span>
    <span class="meta"><span class="dot ${d.last_update_success === false ? "off" : ""}"></span>${esc(t("Aktualisiert {t}", { t: time }))} · ${esc(t("Version {v}", { v: d.version }))}</span></div>`;
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
      ${k.power_source === "fallback" ? `<div style="margin-top:8px">${pill("warn", t("Quelle {s}", { s: t("Ersatzquelle") }))}</div>` : ""}</div></div>
    ${(d.score.checks || []).some((c) => !c.active) ? `<div class="fs" style="margin-top:10px">${esc(t("Ohne Bewertung:"))}</div><div class="ev">${(d.score.checks || []).filter((c) => !c.active).map((c) => `<span title="${esc(c.reason === "no_source" ? t("kein Sensor zugeordnet") : t("noch keine Daten"))}">${esc(t(CHECK_NAMES[c.key] || c.key))} · ${esc(c.reason === "no_source" ? t("kein Sensor") : t("keine Daten"))}</span>`).join("")}</div>` : ""}</div>`;

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

  const kpi = (key, title, value, unit, spark, p) =>
    `<div class="c">${head(title, key, ui)}<div class="big">${value}${unit ? `<small>${unit}</small>` : ""}</div>${spark}${p}</div>`;

  const kpis = `<div class="kpis">
    ${kpi("cop", t("COP 7 Tage"), fmt(cop, 1), cop != null && k.cop_long.value != null ? esc(t("30 T: {v}", { v: fmt(k.cop_long.value, 1) })) : "", sparkline(last30.map((r) => r.cop), "var(--hz-ok)"), copPill + (k.cop_total_short && k.cop_total_short.value != null ? `<div class="muted" style="margin-top:6px">${esc(t("inkl. Warmwasser {v}", { v: fmt(k.cop_total_short.value, 1) }))}</div>` : ""))}
    ${kpi("starts", t("Starts / Tag"), fmt(k.starts_per_day, 0), th.starts_per_day ? esc(t("Schwelle {v}", { v: fmt(th.starts_per_day, 0) })) : "", sparkline(last30.map((r) => r.starts), "var(--hz-warn)", { kind: "bar", ref: th.starts_per_day }), k.starts_per_day == null ? pill("mut", t("keine Daten")) : pill(startsTone, startsTone === "bad" ? t("über der Schwelle") : t("im grünen Bereich")))}
    ${kpi("runtime", t("Laufzeit / Zyklus"), fmt(k.runtime_per_cycle, 0), t("min"), sparkline(last30.map((r) => r.cycle_min), "var(--hz-cool)"), k.runtime_per_cycle == null ? pill("mut", t("keine Daten")) : pill(runTone, runTone === "bad" ? t("unter der Schwelle") : t("im grünen Bereich")))}
    ${kpi("flow", t("Vorlauf Ist − Soll"), signed(flow), "K", sparkline(last30.map((r) => (r.flow != null && r.target_flow != null ? r.flow - r.target_flow : null)), "var(--hz-bad)", { ref: 0 }), flow == null ? pill("mut", t("keine Daten")) : pill(flowTone, flow > 1 ? t("Vorlauf zu warm → Kurve prüfen") : flow < -1 ? t("Vorlauf zu kalt") : t("passt")))}
  </div>`;

  const findings = d.findings.length
    ? d.findings
        .map((f) => `<div class="find"><div class="sev ${f.severity}"></div><div><div class="ft"><span class="id">${esc(f.id)}</span>${esc(f.title)}</div>
          <div class="fd">${esc(f.text)}</div>${f.suggestion ? `<div class="fs"><b>${esc(t("Empfehlung"))}:</b> ${esc(f.suggestion)}</div>` : ""}
          ${evidence(f.evidence) ? `<div class="ev">${evidence(f.evidence)}</div>` : ""}</div></div>`)
        .join("")
    : `<div class="empty">${esc(t("Keine Hinweise – keine Regel hat angeschlagen. Das heißt nicht, dass alles optimal ist."))}</div>`;

  const curve = copCurveCard(d, ui, fit);
  const energy = energyCard(d, ui, 30);
  const missing = missingCard(d);
  const liveCard = liveNow(d, ui);

  return `<div class="grid hero">${scoreCard}${kpis}</div>
    <div class="grid g2"><div class="c">${head(t("Hinweise mit Beleg"), "findings", ui)}${findings}</div>${curve}</div>
    <div class="grid g2">${energy}${liveCard || missing || ""}</div>
    ${liveCard && missing ? `<div class="grid g2">${missing}</div>` : ""}`;
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
  return `<div class="c">${head(t("Jetzt"), "live", ui)}<div class="row" style="margin-top:6px">${state}</div>
    <div class="lvgrid">
      ${tile("Wärmeleistung", fmt(lv.heat_kw, 1), "kW")}
      ${tile("Strom", fmt(lv.power_kw, 2), "kW")}
      ${tile("COP jetzt", fmt(lv.cop, 1), "")}
      ${tile("Spreizung", fmt(lv.spread, 1), "K")}
    </div>
    ${sp.median != null ? `<div class="fd" style="margin-top:8px">${esc(t("Spreizung im Lauf (7 Tage): Median {m} K, {n} Stunden", { m: fmt(sp.median, 1), n: sp.hours }))}</div>` : ""}</div>`;
}

function copCurveCard(d, ui, fit) {
  const rows = d.series.filter((r) => r.cop != null && r.outdoor != null && r.cop < 12);
  const today = rows[rows.length - 1];
  const pts = rows.map((r, i) => ({ x: r.outdoor, y: r.cop, title: `${dayLabel(r.day)}: COP ${fmt(r.cop)} · ${fmt(r.outdoor)} °C`, opacity: 0.25 + 0.55 * (i / Math.max(1, rows.length - 1)) }));
  const xs = rows.map((r) => r.outdoor);
  const lines = fit && xs.length ? [{ color: "var(--hz-ok)", points: [{ x: Math.min(...xs), y: fit.at(Math.min(...xs)) }, { x: Math.max(...xs), y: fit.at(Math.max(...xs)) }] }] : [];
  const svg = box(ui, "copcurve", () => scatterChart(pts, { unitY: "COP", lines, highlight: today ? { x: today.outdoor, y: today.cop, label: `${t("heute")} ${fmt(today.cop)}` } : null }));
  return `<div class="c">${head(t("COP-Kennlinie"), "copcurve", ui, esc(t("Tages-COP gegen Außentemperatur")))}${svg || `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i style="background:var(--hz-ok)"></i>${esc(t("eigene Anlage"))} (${rows.length} ${esc(t("Tage"))})</span>${fit ? `<span>${esc(t("Kennlinie"))}: COP ≈ ${fmt(fit.a, 2)} ${fit.b >= 0 ? "+" : "−"} ${fmt(Math.abs(fit.b), 3)} × T</span>` : ""}</div></div>`;
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
    <div class="legend"><span><i style="background:var(--hz-heat)"></i>${esc(t("Wärme"))} ${fmt(sumHeat, 0)} kWh</span>${hasDhw ? `<span><i style="background:var(--hz-vio)"></i>${esc(t("Warmwasser"))}</span>` : ""}<span><i style="background:var(--hz-cool)"></i>${esc(t("Strom"))} ${fmt(sumPower, 0)} kWh</span></div></div>`;
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
    <div class="ev">${items.map((x) => `<span>${esc(t(x))}</span>`).join("")}</div><div class="fd" style="margin-top:10px">${esc(t("Ein Sensor lässt sich unter Einstellungen → Geräte & Dienste → Heizungsanalyse → Konfigurieren ergänzen."))}</div></div>`;
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
    <div class="legend"><span><i style="background:var(--hz-ok)"></i>COP</span><span><i style="background:var(--hz-cool)"></i>${esc(t("Außentemperatur"))}</span>${markers.length ? `<span><i style="background:var(--hz-vio)"></i>${esc(t("Änderung"))}</span>` : ""}</div></div>`;

  const curveRows = rows.filter((r) => r.outdoor != null && (r.flow != null || r.target_flow != null));
  const flowPts = curveRows.filter((r) => r.flow != null).map((r) => ({ x: r.outdoor, y: r.flow, color: "var(--hz-heat)", opacity: 0.7, title: `${dayLabel(r.day)} ${t("Vorlauf")} ${fmt(r.flow)} °C` }));
  const tgtPts = curveRows.filter((r) => r.target_flow != null).map((r) => ({ x: r.outdoor, y: r.target_flow, color: "var(--hz-cool)", opacity: 0.55, r: 3.4, title: `${dayLabel(r.day)} ${t("Soll-Vorlauf")} ${fmt(r.target_flow)} °C` }));
  const fitF = linearFit(flowPts.map((p) => ({ x: p.x, y: p.y })));
  const fitT = linearFit(tgtPts.map((p) => ({ x: p.x, y: p.y })));
  const xs = curveRows.map((r) => r.outdoor);
  const lineOf = (fit, color, dash) => (fit && xs.length ? [{ color, dash, points: [{ x: Math.min(...xs), y: fit.at(Math.min(...xs)) }, { x: Math.max(...xs), y: fit.at(Math.max(...xs)) }] }] : []);
  const curve = `<div class="c">${head(t("Heizkurve"), "curve", ui)}${box(ui, "curve", () => scatterChart(flowPts.concat(tgtPts), { unitY: "°C", lines: lineOf(fitF, "var(--hz-heat)").concat(lineOf(fitT, "var(--hz-cool)", "6 4")) })) || `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i style="background:var(--hz-heat)"></i>${esc(t("Vorlauf"))}</span><span><i style="background:var(--hz-cool)"></i>${esc(t("Soll-Vorlauf"))}</span></div></div>`;

  const th = d.thresholds || {};
  const startBins = binByOutdoor(rows, "starts");
  const cycling = `<div class="c">${head(t("Takten"), "cycling", ui, esc(t("Starts pro Tag nach Außentemperatur")))}${startBins.length ? box(ui, "cycling", () => binChart(startBins, { ref: th.starts_per_day, unit: t("Starts/Tag"), digits: 0 })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
  const cycle = `<div class="c">${head(t("Laufzeit je Zyklus"), "cycle", ui)}${rows.some((r) => r.cycle_min != null) ? box(ui, "cycle", () => timeChart(rows, [{ key: "cycle_min", kind: "line", color: "var(--hz-cool)", axis: "l", digits: 0 }], { unitL: "min", refL: th.runtime_minutes })) : ""}${rows.some((r) => r.cycle_min != null) ? "" : `<div class="empty">${esc(t("keine Daten"))}</div>`}</div>`;
  const hasDef = rows.some((r) => r.defrost_h != null || r.aux_h != null);
  const defrost = `<div class="c">${head(t("Abtauen & Heizstab"), "defrost", ui)}${hasDef ? box(ui, "defrost", () => timeChart(rows, [
    { key: "defrost_h", kind: "bar", color: "var(--hz-cool)", axis: "l", stack: true, label: t("Abtauen") },
    { key: "aux_h", kind: "bar", color: "var(--hz-bad)", axis: "l", stack: true, label: t("Heizstab") },
  ], { unitL: t("h/Tag") })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}
    <div class="legend"><span><i style="background:var(--hz-cool)"></i>${esc(t("Abtauen"))}</span><span><i style="background:var(--hz-bad)"></i>${esc(t("Heizstab"))}</span></div></div>`;
  const heat = rows.reduce((s, r) => s + (r.heat || 0), 0);
  const dhw = rows.reduce((s, r) => s + (r.dhw || 0), 0);
  const dhwCard = rows.some((r) => r.dhw != null)
    ? `<div class="c">${head(t("Warmwasseranteil"), "dhw", ui)}<div class="big">${fmt(heat ? (dhw / heat) * 100 : null, 0)}<small>%</small></div><div class="meter"><i style="width:${heat ? Math.min(100, (dhw / heat) * 100) : 0}%;background:var(--hz-vio)"></i></div><div class="muted" style="margin-top:8px">${fmt(dhw, 0)} / ${fmt(heat, 0)} kWh</div></div>`
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
            !r.valve_available ? pill("mut", t("ohne Ventilwert")) : "",
            dv && !dv.samples ? pill("mut", t("noch keine Stichproben")) : "",
          ].filter(Boolean).join("");
          return `<div class="room"><div class="nm">${esc(r.name)}<small>${esc(r.circuit_name || "")}${now ? ` · ${now}` : ""}</small></div>
            <div class="dev"><span class="tol" style="left:${pos(-tol)}%;width:${pos(tol) - pos(-tol)}%"></span><span class="mid"></span>${bar}${p90}</div>
            <b>${m == null ? "–" : signed(m)} K</b>${extras ? `<div class="extra">${extras}</div>` : ""}</div>`;
        })
        .join("")
    : `<div class="empty">${esc(t("noch keine Stichproben"))}</div>`;
  const roomsCard = `<div class="c">${head(t("Räume"), "rooms", ui, esc(t("Abweichung zum Soll")))}
    <div class="legend" style="justify-content:space-between;margin:6px 0 2px"><span>← ${esc(t("zu kalt"))}</span><span>${esc(t("zu warm"))} →</span></div>${roomRows}</div>`;

  const th = d.thresholds || {};
  const circuits = (d.circuits || [])
    .map((c) => {
      const idle = c.pump?.idle_share;
      const idleTone = idle == null ? "mut" : kpiTone(idle, th.pump_idle_share);
      const pulses = c.mixer?.pulses_per_day;
      return `<div class="cblock"><div class="ct">${esc(c.name)} <span class="muted">${esc(c.rooms.join(", "))}</span></div>
        <div class="circ"><div><div class="muted">${esc(t("Pumpe ohne Verdichter"))}</div>
        ${c.has_pump ? `<div class="big">${fmt(idle == null ? null : idle * 100, 0)}<small>%</small></div><div class="meter"><i style="width:${idle == null ? 0 : Math.min(100, idle * 100)}%;background:var(--hz-${idleTone === "mut" ? "cool" : idleTone})"></i></div>` : `<div class="fd">${esc(t("keine Pumpe zugeordnet"))}</div>`}</div>
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
  const list = changes.length
    ? changes
        .map((c) => {
          const b = c.before;
          const a = c.after;
          const adj = weatherAdjusted(b, a, fit);
          const what = `${objectLabel(c.object)}${c.field ? ` · ${c.field}` : ""}`;
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
    : `<div class="empty">${esc(t("Noch keine Änderung eingetragen. Trag z. B. „Heizkurve 0,6 → 0,5“ ein – nach ein paar Tagen siehst du hier, was es gebracht hat."))}</div>`;
  const form = ui.form
    ? `<form class="log" data-form="log">
        <label>${esc(t("Was"))}<input name="object" required placeholder="hydraulics"></label>
        <label>${esc(t("Einstellung"))}<input name="field" required placeholder="heizkurve"></label>
        <label>${esc(t("Alt"))}<input name="old_value" placeholder="0,6"></label>
        <label>${esc(t("Neu"))}<input name="new_value" placeholder="0,5"></label>
        <label style="grid-column:1/-1">${esc(t("Notiz"))}<input name="note"></label>
        <div class="row"><button class="btn primary" type="submit">${esc(t("Speichern"))}</button><button class="btn ghost" type="button" data-act="form-close">${esc(t("Abbrechen"))}</button></div>
      </form>`
    : `<div class="row" style="margin-top:12px"><button class="btn" data-act="form-open">+ ${esc(t("Änderung eintragen"))}</button></div>`;
  return `<div class="grid g2"><div class="c">${head(t("Änderungen und ihre Wirkung"), "changes", ui)}${list}${form}</div>${viewEffizienzCopOnly(d, ui)}</div>`;
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
export function viewInventar(d, ui) {
  const inv = d.inventory || {};
  const section = (key, title) => {
    const data = inv[key] || {};
    const entries = key === "hydraulics" ? (Object.keys(data).length ? [["", data]] : []) : Object.entries(data);
    if (!entries.length) return `<div class="c"><div class="h">${esc(t(title))}</div><div class="empty">${esc(t("Noch nichts eingetragen."))}</div></div>`;
    const cols = [...new Set(entries.flatMap(([, v]) => Object.keys(v || {})))];
    return `<div class="c"><div class="h">${esc(t(title))}</div><table><tr>${key === "hydraulics" ? "" : "<th></th>"}${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>
      ${entries.map(([id, v]) => `<tr>${key === "hydraulics" ? "" : `<td><b>${esc(id)}</b></td>`}${cols.map((c) => `<td>${esc(v?.[c] ?? "")}</td>`).join("")}</tr>`).join("")}</table></div>`;
  };
  const labels = {
    power_entity: "Strom", heat_entity: "Wärme", outdoor_entity: "Außentemperatur", compressor_entity: "Verdichter",
    power_fallback_entity: "Strom (Ersatz)", dhw_heat_entity: "Warmwasser", flow_entity: "Vorlauf", target_flow_entity: "Soll-Vorlauf",
    return_entity: "WP-Rücklauf", buffer_entity: "Puffer", defrost_entity: "Abtauen", aux_heater_entity: "Heizstab",
    compressor_starts_entity: "Starts", compressor_runtime_entity: "Laufzeit",
    compressor_runtime_extra_entity: "Laufzeit (2. Zähler)", hp_flow_entity: "WP-Vorlauf", volume_flow_entity: "Volumenstrom",
    power_now_entity: "Leistung jetzt", dhw_power_entity: "Warmwasser-Strom",
  };
  const src = Object.entries(d.sources || {})
    .map(([k, ok]) => `<div class="src"><span>${esc(labels[k] ? t(labels[k]) : k)}</span>${pill(ok ? "ok" : "mut", ok ? t("verbunden") : t("fehlt"))}</div>`)
    .join("");
  return `<div class="grid g2">
    <div class="grid">${section("pumps", "Pumpen")}${section("thermostats", "Thermostate")}${section("hydraulics", "Hydraulik")}
      <div class="c">${head(t("Inventar"), "inventory", ui)}<div class="row" style="margin-top:10px"><button class="btn" data-act="report">${esc(t("Bericht herunterladen"))}</button></div></div></div>
    <div class="c">${head(t("Datenquellen"), "sources", ui)}${src}</div></div>`;
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
    <div class="row" style="margin-top:10px">
      <button class="btn" data-act="log-download">${esc(t("Diagnose herunterladen"))}</button>
      <button class="btn ghost" data-act="log-copy">${esc(t("Protokoll kopieren"))}</button>
      <button class="btn primary" data-act="log-refresh">${esc(t("Jetzt neu berechnen"))}</button>
    </div>
    ${rt.last_error ? `<div class="fd" style="margin-top:8px">${esc(t("Letzter Fehler"))}: ${esc(rt.last_error)}</div>` : ""}
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

export function viewEinstellungen(d, ui) {
  const cfg = (d && d.config) || {};
  const data = cfg.data || {};
  const options = cfg.options || {};
  const mandatory = ["power_entity", "heat_entity", "outdoor_entity", "compressor_entity"];
  const optional = Object.keys(options).filter((k) => k !== "circuits" && k !== "rooms" && k !== "thresholds");
  const srcRow = (key, value, group) => `<div class="srcrow"><label>${esc(key)}</label><input data-cfg="${group}" data-key="${esc(key)}" type="text" value="${esc(value || "")}" placeholder="entity.id"></div>`;
  const mand = mandatory.map((k) => srcRow(k, data[k], "data")).join("");
  const opt = optional.map((k) => srcRow(k, options[k], "options")).join("");
  const circ = JSON.stringify(cfg.circuits || [], null, 2);
  const rooms = JSON.stringify(cfg.rooms || [], null, 2);
  const thr = JSON.stringify(cfg.thresholds || {}, null, 2);
  return `<div class="grid">
    <div class="c">${head(t("Quellen"), "cfg_sources", ui)}
      <div class="cfggroup"><div class="h">${esc(t("Pflicht"))}</div>${mand}</div>
      <div class="cfggroup"><div class="h">${esc(t("Optional"))}</div>${opt || `<div class="muted">${esc(t("keine"))}</div>`}</div>
    </div>
    <div class="c">${head(t("Heizkreise"), "cfg_circuits", ui)}
      <textarea class="cfgjson" data-cfgjson="circuits">${esc(circ)}</textarea>
    </div>
    <div class="c">${head(t("Raeume"), "cfg_rooms", ui)}
      <textarea class="cfgjson" data-cfgjson="rooms">${esc(rooms)}</textarea>
    </div>
    <div class="c">${head(t("Schwellen"), "cfg_thresholds", ui)}
      <textarea class="cfgjson" data-cfgjson="thresholds">${esc(thr)}</textarea>
    </div>
    <div class="c"><div class="row">
      <button class="btn primary" data-act="cfg-save">${esc(t("Speichern"))}</button>
      <span class="muted">${esc(t("Speichern laedt die Integration neu."))}</span>
    </div>
    ${ui.cfgMsg ? `<div class="fd" style="margin-top:8px">${esc(ui.cfgMsg)}</div>` : ""}
    </div>
  </div>`;
}


export function renderView(view, d, ui, live) {
  switch (view) {
    case "effizienz": return viewEffizienz(d, ui);
    case "raeume": return viewRaeume(d, ui, live);
    case "vergleich": return viewVergleich(d, ui);
    case "inventar": return viewInventar(d, ui);
    case "protokoll": return viewProtokoll(d, ui);
    case "einstellungen": return viewEinstellungen(d, ui);
    default: return viewAnlage(d, ui);
  }
}
