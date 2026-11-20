// Ansichten ab 0.8: Übersicht, Betrieb, Räume, Hydraulik, Geräte.
// Jede Ansicht beginnt mit einem Satz, der ihre Frage beantwortet; darunter die Belege.
import { getLang, t } from "./i18n.js";
import { binChart, scatterChart, sparkline, timeChart, withWidth } from "./charts.js";
import { statusPill as pill } from "./components.js";
import { helpText } from "./help.js";
import { binByOutdoor, dayLabel, esc, fmt, linearFit, signed } from "./logic.js";

// ---------------------------------------------------------------- Bausteine
function box(ui, id, fn) {
  const w = (ui.widths && ui.widths[id]) || 640;
  return `<div class="cbox" data-cid="${id}">${withWidth(w, fn)}</div>`;
}

const ICONS = {
  anlage: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  effizienz: "M3 20h18M6 16l4-5 3 3 5-7",
  betrieb: "M4 6h12M4 12h8M4 18h14",
  raeume: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  schema: "M4 7h9a4 4 0 0 1 4 4v8M4 17h6M17 19h3",
  vergleich: "M7 4v16M17 4v16M4 9h6M14 15h6",
  inventar: "M5 5h14v14H5zM9 9h6v6H9z",
  protokoll: "M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};

export const NAV8 = [
  ["anlage", "Übersicht"],
  ["effizienz", "Effizienz"],
  ["betrieb", "Betrieb"],
  ["raeume", "Räume"],
  ["schema", "Hydraulik"],
  ["vergleich", "Änderungen"],
  ["inventar", "Geräte"],
  ["protokoll", "System"],
];

export function header8(d, view) {
  const at = d.generated ? new Date(d.generated) : null;
  const time = at ? at.toLocaleTimeString(getLang() === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
  const nav = NAV8.map(
    ([v, label]) =>
      `<button class="tab ${v === view ? "on" : ""}" data-nav="${v}" aria-current="${v === view ? "page" : "false"}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[v]}"/></svg><span>${esc(t(label))}</span></button>`,
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

// Temperaturabweichung → Farbe der Thermoskala (−2 K blau … 0 grün … +2 K rot)
const STOPS = [
  [-2, [58, 123, 255]],
  [-1, [66, 198, 232]],
  [0, [46, 196, 166]],
  [0.7, [255, 207, 74]],
  [1.4, [255, 138, 61]],
  [2, [255, 77, 109]],
];
export function thermal(v) {
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
// Absolute Temperatur (°C) → Rohrfarbe: kalt blau, lauwarm cyan, Heizvorlauf orange, heiß rot
const PIPE = [
  [10, [58, 123, 255]],
  [25, [66, 198, 232]],
  [32, [255, 207, 74]],
  [40, [255, 138, 61]],
  [55, [255, 77, 109]],
];
export function pipeColor(c) {
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

// Live-Werte aus hass.states für das Fließbild
export function liveValues(d, states) {
  const e = d.entities || {};
  const s = (id) => (id ? states[id] : null);
  const circuits = {};
  for (const [id, c] of Object.entries(e.circuits || {})) {
    circuits[id] = {
      temp: num(s(c.temp)),
      target: num(s(c.target)),
      pump: onOff(s(c.pump)),
      opening: onOff(s(c.mixer_open)),
      closing: onOff(s(c.mixer_close)),
    };
  }
  const flow = num(s(e.hp_flow));
  const ret = num(s(e.hp_return));
  const volume = num(s(e.volume));
  const pStateRaw = s(e.power_now);
  let power = num(pStateRaw);
  if (power != null && pStateRaw && pStateRaw.attributes && pStateRaw.attributes.unit_of_measurement === "W") power /= 1000;
  const running = onOff(s(e.compressor));
  const spread = flow != null && ret != null ? flow - ret : null;
  const heat = running === false ? 0 : volume != null && spread != null && volume > 0 ? (volume / 60) * 4.186 * spread : null;
  const cop = running !== false && heat != null && power != null && power >= 0.1 && heat > 0 ? heat / power : null;
  return {
    running,
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
    circuits,
  };
}

function copFit(d) {
  return linearFit((d.series || []).filter((r) => r.cop != null && r.outdoor != null && r.cop < 12 && r.power > 1).map((r) => ({ x: r.outdoor, y: r.cop })));
}

// Erwarteter COP der letzten 7 Tage nach eigener Kennlinie
export function expectation(d) {
  const fit = copFit(d);
  const recent = (d.series || []).slice(-7).filter((r) => r.outdoor != null);
  if (!fit || fit.n < 10 || !recent.length) return null;
  const outdoor = recent.reduce((a, r) => a + r.outdoor, 0) / recent.length;
  const expected = recent.reduce((a, r) => a + fit.at(r.outdoor), 0) / recent.length;
  const cop = d.kpis && d.kpis.cop_short && d.kpis.cop_short.value;
  return { fit, outdoor, expected, cop, rel: cop != null ? cop / expected - 1 : null };
}

// Datenblatt-Kennlinie: COP laut Hersteller bei Außentemperatur und Vorlauf des Tages
function datasheetLine(d, lo, hi) {
  const ref = (d.series || []).filter((r) => r.cop_ref != null && r.outdoor != null).map((r) => ({ x: r.outdoor, y: r.cop_ref }));
  const fit = ref.length >= 3 ? linearFit(ref) : null;
  return fit ? [{ x: lo, y: fit.at(lo) }, { x: hi, y: fit.at(hi) }] : null;
}

function datasheetSay(hp) {
  const w = hp && hp.week;
  if (!w || w.share == null) return "";
  const p = w.share * 100;
  const tone = p >= 80 ? "ok" : p >= 70 ? "warn" : "bad";
  return `<div class="dsline"><span>${esc(t("Datenblatt bei deinem Wetter und Vorlauf"))}</span><b>${fmt(w.cop_ref, 1)}</b><span>${esc(t("gemessen"))}</span><b>${fmt(w.cop, 1)}</b>${pill(tone, `${fmt(p, 0)} %`)}</div><div class="fd">${esc(t("Prüfstandswerte (EN 14511) enthalten kein Abtauen und keine Pumpen – 80–95 % davon sind im Betrieb gut."))}</div>`;
}

function startsSub(d) {
  const w = d.datasheet && d.datasheet.heat_pump && d.datasheet.heat_pump.week;
  if (!w || w.demand_kw == null || w.min_kw == null) return t("Schwelle aus den Einstellungen");
  return t("Bedarf {b} kW · kleinste Stufe {m} kW", { b: fmt(w.demand_kw, 1), m: fmt(w.min_kw, 1) });
}

// ---------------------------------------------------------------- Übersicht
export function viewUebersicht(d, ui, live) {
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

  const dsHp = d.datasheet && d.datasheet.heat_pump;
  // Kennlinie mit Erwartungsband
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
    const refLine = datasheetLine(d, lo, hi);
    chart = box(ui, "ov-curve", () =>
      scatterChart(pts, {
        h: 200,
        unitY: "COP",
        lines: [{ color: "var(--hz-ok)", dash: "5 4", width: 1.8, points: line }].concat(refLine ? [{ color: "var(--hz-cool)", dash: "2 4", width: 1.8, points: refLine }] : []),
        band,
        highlight: today ? { x: today.outdoor, y: today.cop, label: t("heute {c} · erwartet {e}", { c: fmt(today.cop), e: fmt(fit.at(today.outdoor)) }) } : null,
      }),
    );
  }

  const score = d.score || {};
  const scoreTone = { very_good: "ok", good: "ok", watch: "warn", action: "bad" }[score.level] || "mut";
  const scoreLabel = { very_good: "Sehr gut", good: "Gut", watch: "Beobachten", action: "Handlungsbedarf", learning: "Lernt noch", limited: "Eingeschränkt" }[score.level] || "Lernt noch";
  const verdict = `<section class="c verdict">
      <div class="h"><span>${esc(t("Diese Woche"))}</span><span class="grow"></span>${pill(scoreTone, `${t(scoreLabel)} · ${score.value ?? "–"}`)}</div>
      <p class="big-say">${sentence} ${esc(tail)}</p>
      ${chart}
      <div class="fd">${esc(dsHp ? t("Punkte: Tages-COP · Band: deine eigene Kennlinie ± Streuung · blau gepunktet: Datenblatt {m} bei deinem Vorlauf", { m: dsHp.model }) : t("Punkte: Tages-COP · Band: deine eigene Kennlinie ± Streuung"))}</div>
      ${datasheetSay(dsHp)}
    </section>`;

  // Was ist zu tun
  const items = findings.slice(0, 3).map(
    (f) => `<div class="todo-i"><i class="tone-${f.severity === "warning" ? "bad" : "warn"}"></i><span><b>${esc(f.title)}</b><small>${esc(f.text)}</small></span><small>${esc(f.id)}</small></div>`,
  );
  const flow = k.flow_deviation && k.flow_deviation.median;
  if (items.length < 3 && flow != null && Math.abs(flow) <= 1) items.push(`<div class="todo-i"><i class="tone-ok"></i><span>${esc(t("Vorlauf passt zur Heizkurve ({v} K)", { v: signed(flow) }))}</span><small>ok</small></div>`);
  if (items.length < 3 && k.starts_per_day != null && th.starts_per_day && k.starts_per_day <= th.starts_per_day)
    items.push(`<div class="todo-i"><i class="tone-ok"></i><span>${esc(t("Takten im Rahmen: {s} Starts, {m} min je Zyklus", { s: fmt(k.starts_per_day, 1), m: fmt(k.runtime_per_cycle, 0) }))}</span><small>ok</small></div>`);

  const lv = live;
  const nowBlock = `<div class="h mt14"><span>${esc(t("Jetzt"))}</span><span class="grow"></span>${lv.running === true ? pill("ok", lv.dhwCharging ? t("lädt Warmwasser") : lv.defrost ? t("taut ab") : t("heizt")) : lv.running === false ? pill("mut", t("Verdichter aus")) : ""}</div>
    <div class="trio">
      <div><small>${esc(t("Wärme"))}</small><b>${fmt(lv.heat, 1)}<i>kW</i></b></div>
      <div><small>${esc(t("Strom"))}</small><b>${fmt(lv.power, 2)}<i>kW</i></b></div>
      <div><small>${esc(t("COP jetzt"))}</small><b>${fmt(lv.cop, 1)}</b></div>
    </div>`;
  const todo = `<section class="c"><div class="h"><span>${esc(t("Was ist zu tun"))}</span><span class="grow"></span><span>${findings.length ? esc(t("{n} Punkte", { n: findings.length })) : esc(t("nichts"))}</span></div>
    <div class="todo">${items.join("")}</div>${nowBlock}</section>`;

  // Vier Kennzahlen mit gleicher Logik: Zahl, Pill und Linie in derselben Farbe
  const last30 = (d.series || []).slice(-30);
  const copTone = !ex || ex.rel == null ? "mut" : ex.rel < -0.08 ? "warn" : "ok";
  const startsTone = k.starts_per_day == null ? "mut" : th.starts_per_day && k.starts_per_day > th.starts_per_day ? "bad" : th.starts_per_day && k.starts_per_day > th.starts_per_day * 0.9 ? "warn" : "ok";
  const runTone = k.runtime_per_cycle == null ? "mut" : k.runtime_per_cycle < (th.runtime_minutes || 20) ? "bad" : "ok";
  const flowTone = flow == null ? "mut" : Math.abs(flow) <= 1 ? "ok" : Math.abs(flow) <= (th.flow_deviation_k || 2) ? "warn" : "bad";
  const col = (tone) => `var(--hz-${tone === "mut" ? "mut" : tone})`;
  const tile = (title, value, unit, sub, tone, tag, spark) =>
    `<div class="c kpi"><div class="h"><span>${esc(title)}</span><span class="grow"></span>${pill(tone, tag)}</div><div class="num" style="color:${tone === "mut" ? "inherit" : "inherit"}">${value}<i>${esc(unit)}</i></div><div class="fd">${esc(sub)}</div>${spark}</div>`;
  const kpis = `<div class="k4">
    ${tile(t("COP 7 Tage"), fmt(k.cop_short && k.cop_short.value, 1), "", ex ? t("erwartet bei {o} °C: {e} · 30 Tage {l}", { o: fmt(ex.outdoor, 1), e: fmt(ex.expected, 1), l: fmt(k.cop_long && k.cop_long.value, 1) }) : t("30 Tage {l}", { l: fmt(k.cop_long && k.cop_long.value, 1) }), copTone, copTone === "warn" ? t("unter Erwartung") : t("wie erwartet"), sparkline(last30.map((r) => r.cop), col(copTone)))}
    ${tile(t("Starts / Tag"), fmt(k.starts_per_day, 1), th.starts_per_day ? t("von {v}", { v: fmt(th.starts_per_day, 0) }) : "", startsSub(d), startsTone, startsTone === "ok" ? t("im Rahmen") : startsTone === "warn" ? t("an der Grenze") : t("zu viele"), sparkline(last30.map((r) => r.starts), col(startsTone), { kind: "bar" }))}
    ${tile(t("Zyklus"), fmt(k.runtime_per_cycle, 0), "min", t("Ziel über {v} min", { v: fmt(th.runtime_minutes || 20, 0) }), runTone, runTone === "ok" ? t("lang") : t("zu kurz"), sparkline(last30.map((r) => r.cycle_min), col(runTone)))}
    ${tile(t("Vorlauf Ist − Soll"), signed(flow), "K", t("Zielband ±1 K"), flowTone, flowTone === "ok" ? t("passt") : flow > 0 ? t("zu warm") : t("zu kalt"), sparkline(last30.map((r) => (r.flow != null && r.target_flow != null ? r.flow - r.target_flow : null)), col(flowTone), { ref: 0 }))}
  </div>`;

  return `${say(t("Läuft die Anlage so gut, wie sie bei diesem Wetter kann?"))}
    <div class="grid ov">${verdict}${todo}</div>${kpis}${costStrip(d, ui)}`;
}

export function costStrip(d, ui) {
  const c = (d.kpis && d.kpis.costs) || {};
  const m = c.month;
  const w = c.water;
  if (!m && !w) return "";
  const eur = (v) => (v == null ? "–" : fmt(v, v >= 100 ? 0 : 2));
  const cell = (label, value, unit, sub) => `<div><small>${esc(t(label))}</small><b>${value}<i>${esc(unit)}</i></b><span>${esc(sub || "")}</span></div>`;
  const cells = [];
  if (m) {
    cells.push(cell("Strom Heizen", eur(m.heating && m.heating.eur), "€", `${fmt(m.heating && m.heating.kwh, 0)} kWh`));
    if (m.dhw) cells.push(cell("Strom Warmwasser", eur(m.dhw.eur), "€", `${fmt(m.dhw.kwh, 0)} kWh`));
  }
  if (w) cells.push(cell("Wasser", eur(w.month_eur), "€", t("{m} m³ · heute {d} m³", { m: fmt(w.month_m3, 2), d: fmt(w.today_m3, 2) })));
  if (m && m.heat_price_ct != null) cells.push(cell("Wärme kostet", fmt(m.heat_price_ct, 1), "ct/kWh", t("Strompreis ÷ COP")));
  const month = new Date().toLocaleDateString(getLang() === "de" ? "de-DE" : "en-GB", { month: "long" });
  return `<section class="c"><div class="h"><span>${esc(t("Kosten {m}", { m: month }))}</span><span class="grow"></span><span>${esc(c.price_now != null ? t("Preis jetzt {p} €/kWh", { p: fmt(c.price_now, 3) }) : "")}</span>${q("costs", ui)}</div>${hb("costs", ui)}
    <div class="strip">${cells.join("")}</div>
    <div class="fd">${esc(t("Stunde für Stunde mit dem Preis aus deinem Energie-Dashboard gerechnet."))}</div></section>`;
}

// ---------------------------------------------------------------- Betrieb
const LANE_COLORS = { compressor: "var(--hz-heat)", dhw: "var(--hz-vio)", defrost: "var(--hz-cool)", aux: "var(--hz-bad)" };

function lanes(op) {
  const tl = (op && op.timeline) || {};
  if (!tl.compressor && !tl.dhw) return "";
  const now = new Date((op.now || Date.now() / 1000) * 1000);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    days.push(start);
  }
  const fmtDay = (dt) => dt.toLocaleDateString(getLang() === "de" ? "de-DE" : "en-GB", { weekday: "short" });
  const order = ["compressor", "dhw", "defrost", "aux"];
  const rows = days
    .map((dayStart) => {
      const a = dayStart.getTime() / 1000;
      const b = a + 86400;
      let bars = "";
      for (const kind of order) {
        for (const [s, e] of tl[kind] || []) {
          if (e <= a || s >= b) continue;
          const left = ((Math.max(s, a) - a) / 86400) * 100;
          const width = Math.max(0.35, ((Math.min(e, b) - Math.max(s, a)) / 86400) * 100);
          const top = kind === "compressor" ? "" : " thin";
          bars += `<i class="${kind}${top}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%;background:${LANE_COLORS[kind]}"></i>`;
        }
      }
      return `<div class="lane"><span>${esc(fmtDay(dayStart))}</span><div class="bar">${bars}</div></div>`;
    })
    .join("");
  const legend = order
    .filter((kind) => tl[kind])
    .map((kind) => `<span><i style="background:${LANE_COLORS[kind]}"></i>${esc(t({ compressor: "Verdichter", dhw: "Warmwasser", defrost: "Abtauen", aux: "Heizstab" }[kind]))}</span>`)
    .join("");
  return `<div class="lanes">${rows}<div class="lane ax"><span></span><div><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div></div></div><div class="legend">${legend}</div>`;
}

function cycleBars(op, ui) {
  const c = op && op.cycles;
  if (!c || !c.cycles) return `<div class="empty">${esc(t("noch keine Zyklen"))}</div>`;
  const labels = c.bins.map((b, i) => (i < c.bins.length - 1 ? `${b}–${c.bins[i + 1]}` : `${b}+`));
  const bins = c.counts.map((n, i) => ({ lower: i, upper: i + 1, mean: n, n, label: labels[i] }));
  const svg = box(ui, "cycles", () => binChart(bins, { h: 180, unit: t("Starts"), digits: 0, color: "var(--hz-cool)" }).replace(/>(\d+)°</g, (m, i) => `>${labels[Number(i)] || ""}<`));
  return `${svg}<div class="fd">${esc(t("{n} Zyklen in 7 Tagen · Median {m} min · {s} % kürzer als 20 min", { n: c.cycles, m: fmt(c.median_min, 0), s: fmt((c.short_share || 0) * 100, 0) }))}</div>`;
}

export function viewBetrieb(d, ui) {
  const op = d.operation || {};
  const th = d.thresholds || {};
  const k = d.kpis || {};
  const hy = k.hydraulics || {};
  const rows = (d.series || []).slice(-30);
  const c = op.cycles || {};
  const sentence =
    c.cycles
      ? t("Der Verdichter startete im Schnitt <b>{s}-mal am Tag</b> und lief <b>{m} Minuten</b> am Stück.", { s: fmt(k.starts_per_day, 1), m: fmt(c.median_min ?? k.runtime_per_cycle, 0) })
      : esc(t("Für den Tagesverlauf fehlt noch der Verlauf des Verdichters."));

  const timelineCard = `<section class="c wide"><div class="h"><span>${esc(t("Verdichter je Tag"))}</span><span class="grow"></span><span>${esc(t("letzte 7 Tage · 0–24 Uhr"))}</span>${q("timeline", ui)}</div>${hb("timeline", ui)}${lanes(op) || `<div class="empty">${esc(t("keine Daten"))}</div>`}</section>`;
  const cycleCard = `<section class="c"><div class="h"><span>${esc(t("Laufzeit je Start"))}</span><span class="grow"></span><span>${esc(t("Minuten"))}</span>${q("cycle", ui)}</div>${hb("cycle", ui)}${cycleBars(op, ui)}</section>`;
  const startBins = binByOutdoor(rows, "starts");
  const startsCard = `<section class="c"><div class="h"><span>${esc(t("Starts nach Außentemperatur"))}</span>${q("cycling", ui)}</div>${hb("cycling", ui)}${startBins.length ? box(ui, "b-starts", () => binChart(startBins, { h: 180, ref: th.starts_per_day, unit: t("Starts/Tag"), digits: 0 })) : `<div class="empty">${esc(t("keine Daten"))}</div>`}</section>`;
  const dailyRows = (map, key) => Object.entries(map || {}).map(([day, v]) => ({ day, [key]: v }));
  const spreadRows = dailyRows(hy.spread_daily, "spread");
  const overRows = dailyRows(hy.overshoot_daily, "over");
  const spreadCard = spreadRows.length
    ? `<section class="c"><div class="h"><span>${esc(t("Spreizung"))}</span><span class="grow"></span><span>${esc(t("Ziel {a}–{b} K", { a: fmt(th.spread_min_k ?? 3, 0), b: fmt(th.spread_max_k ?? 8, 0) }))}</span>${q("spread", ui)}</div>${hb("spread", ui)}${box(ui, "b-spread", () => timeChart(spreadRows, [{ key: "spread", kind: "line", color: "var(--hz-vio)", axis: "l", digits: 1 }], { h: 180, unitL: "K", band: [th.spread_min_k ?? 3, th.spread_max_k ?? 8] }))}<div class="fd">${esc(t("Median {m} K über {n} Laufstunden", { m: fmt(hy.spread && hy.spread.median, 1), n: (hy.spread && hy.spread.hours) || 0 }))}</div></section>`
    : "";
  const overCard = overRows.length
    ? `<section class="c"><div class="h"><span>${esc(t("Puffer-Ladung"))}</span><span class="grow"></span><span>${esc(t("WP-Vorlauf über Puffer-Soll"))}</span>${q("overshoot", ui)}</div>${hb("overshoot", ui)}${box(ui, "b-over", () => timeChart(overRows, [{ key: "over", kind: "line", color: "var(--hz-heat)", axis: "l", digits: 1 }], { h: 180, unitL: "K", band: [0, 5] }))}<div class="fd">${esc(t("Median {m} K · Warmwasser-Ladungen herausgerechnet", { m: fmt(hy.overshoot && hy.overshoot.median, 1) }))}</div></section>`
    : "";
  const hasDef = rows.some((r) => r.defrost_h != null || r.aux_h != null);
  const defrost = hasDef
    ? `<section class="c"><div class="h"><span>${esc(t("Abtauen & Heizstab"))}</span>${q("defrost", ui)}</div>${hb("defrost", ui)}${box(ui, "b-def", () => timeChart(rows, [
        { key: "defrost_h", kind: "bar", color: "var(--hz-cool)", axis: "l", stack: true, label: t("Abtauen") },
        { key: "aux_h", kind: "bar", color: "var(--hz-bad)", axis: "l", stack: true, label: t("Heizstab") },
      ], { h: 180, unitL: t("h/Tag") }))}</section>`
    : "";
  return `${say(sentence)}
    <div class="grid">${timelineCard}</div>
    <div class="grid g2">${cycleCard}${startsCard}</div>
    <div class="grid g2">${spreadCard}${overCard}</div>
    ${defrost ? `<div class="grid g2">${defrost}${dhwTankCard(d, ui)}</div>` : dhwTankCard(d, ui)}`;
}

function tankNote(d) {
  const tank = d.datasheet && d.datasheet.dhw_tank;
  if (!tank || tank.cooling_expected == null) return "";
  const m = tank.cooling_measured;
  const extra = m != null && m > tank.cooling_expected * 1.5;
  return `<div class="fd">${esc(
    t("{s}: ohne Zapfen laut Datenblatt etwa {e} K/h.", { s: tank.model, e: fmt(tank.cooling_expected, 2) }) +
      (extra ? " " + t("Gemessen wird mehr – das sind Zapfungen, eine Zirkulation oder Wärme, die über die Leitungen abwandert.") : ""),
  )}</div>`;
}

export function dhwTankCard(d, ui) {
  const w = (d.kpis && d.kpis.hydraulics && d.kpis.hydraulics.dhw) || null;
  if (!w || w.temperature == null) return "";
  const cell = (label, value, unit) => `<div><small>${esc(t(label))}</small><b>${value}<i>${esc(unit)}</i></b></div>`;
  return `<section class="c"><div class="h"><span>${esc(t("Warmwasserspeicher"))}</span><span class="grow"></span>${w.charging ? pill("warn", t("lädt")) : pill("mut", t("lädt nicht"))}${q("dhw_tank", ui)}</div>${hb("dhw_tank", ui)}
    <div class="strip">${cell("Ist / Soll", fmt(w.temperature, 1), w.target != null ? `/ ${fmt(w.target, 1)} °C` : "°C")}${cell("Ladungen / Tag", fmt(w.charges_per_day, 1), "")}${cell("Ladedauer", fmt(w.charge_minutes, 0), "min")}${cell("Abkühlung", fmt(w.cooling_k_per_h, 2), "K/h")}</div>${tankNote(d)}</section>`;
}

// ---------------------------------------------------------------- Räume
export function viewRaeume8(d, ui, liveRooms) {
  const rooms = d.rooms || [];
  const profiles = (d.operation && d.operation.room_profiles) || {};
  const devices = ((d.devices && d.devices.thermostats) || []).reduce((acc, x) => ((acc[x.room] = x), acc), {});
  const tol = (d.thresholds || {}).room_deviation_k ?? 1;
  const off = rooms.filter((r) => r.deviation && r.deviation.median != null && Math.abs(r.deviation.median) > tol / 2);
  const worst = off.sort((a, b) => Math.abs(b.deviation.median) - Math.abs(a.deviation.median))[0];
  const sentence = worst
    ? t("<b>{r}</b> ist am häufigsten neben dem Soll: im Median {m} K, {p} % der Zeit {w}.", {
        r: esc(worst.name),
        m: signed(worst.deviation.median),
        p: fmt(((worst.deviation.median > 0 ? worst.deviation.over_share : worst.deviation.under_share) || 0) * 100, 0),
        w: worst.deviation.median > 0 ? t("zu warm") : t("zu kalt"),
      })
    : esc(t("Alle Räume halten ihr Soll."));

  const hours = Array.from({ length: 24 }, (_, h) => h);
  const head24 = `<tr><th></th>${hours.map((h) => `<th>${h % 3 === 0 ? h : ""}</th>`).join("")}<th></th></tr>`;
  const body = rooms
    .map((r) => {
      const prof = profiles[r.id] || [];
      const cells = hours.map((h) => `<td class="v" style="background:${thermal(prof[h])}" title="${esc(r.name)} ${h}:00 · ${prof[h] == null ? "–" : signed(prof[h]) + " K"}"></td>`).join("");
      const m = r.deviation && r.deviation.median;
      return `<tr><td class="n">${esc(r.name)}</td>${cells}<td class="m">${m == null ? "–" : signed(m)} K</td></tr>`;
    })
    .join("");
  const heat = `<section class="c wide"><div class="h"><span>${esc(t("Abweichung zum Soll je Uhrzeit"))}</span><span class="grow"></span><span>${esc(t("7 Tage · Median"))}</span>${q("rooms", ui)}</div>${hb("rooms", ui)}
    <div class="heat"><table>${head24}${body}</table></div>
    <div class="scale"><span>−2 K</span><i></i><span>+2 K</span></div></section>`;

  const cards = rooms
    .map((r) => {
      const lv = liveRooms[r.climate_entity] || {};
      const dev = devices[r.id] || {};
      const m = r.deviation && r.deviation.median;
      const tone = m == null ? "mut" : Math.abs(m) <= 0.5 ? "ok" : Math.abs(m) <= tol ? "warn" : "bad";
      const tag = m == null ? (dev.monitor ? t("nur beobachtet") : t("keine Daten")) : tone === "ok" ? t("passt") : m > 0 ? t("zu warm {p} %", { p: fmt((r.deviation.over_share || 0) * 100, 0) }) : t("zu kalt {p} %", { p: fmt((r.deviation.under_share || 0) * 100, 0) });
      const valve = lv.valve ?? dev.valve;
      const heatup = dev.heatup_minutes_2k != null ? t("{m} min für 2 K", { m: fmt(dev.heatup_minutes_2k, 0) }) : r.heating_up_min != null ? t("{m} min", { m: fmt(r.heating_up_min, 0) }) : t("noch zu wenig Fälle");
      const trv = (dev.trvs || []).map((x) => x.device && [x.device.manufacturer, x.device.model].filter(Boolean).join(" ")).filter(Boolean)[0];
      return `<div class="c rcard"><div class="top"><b>${esc(r.name)}</b>${pill(tone, tag)}</div>
        <div class="num">${fmt(lv.current, 1)}<i>/ ${fmt(lv.target, 1)} °C</i></div>
        ${valve != null ? `<div class="row2"><span>${esc(t("Ventil"))}</span><span>${fmt(valve, 0)} %</span></div><div class="meter"><i style="width:${Math.min(100, valve)}%"></i></div>` : `<div class="row2"><span>${esc(t("Ventil"))}</span><span>${esc(dev.monitor ? t("ohne Thermostat") : t("meldet keinen Wert"))}</span></div>`}
        <div class="row2"><span>${esc(t("Aufheizen"))}</span><span>${esc(heatup)}</span></div>
        ${trv || dev.battery != null ? `<div class="row2"><span>${esc(trv || t("Fühler"))}</span><span>${dev.battery != null ? esc(t("Batterie {b} %", { b: fmt(dev.battery, 0) })) : ""}</span></div>` : ""}
        <div class="fd">${esc(r.circuit_name || "")}</div></div>`;
    })
    .join("");
  return `${say(sentence)}<div class="grid">${heat}</div><div class="grid rooms">${cards}</div>`;
}

// ---------------------------------------------------------------- Hydraulik
export function viewHydraulik(d, ui, live) {
  const circuits = (d.circuits || []).filter((c) => c.type !== "buffer");
  const bufferCircuit = (d.circuits || []).find((c) => c.type === "buffer");
  const rooms = d.rooms || [];
  const lv = live;
  const lc = lv.circuits || {};
  const charging = !!lv.dhwCharging;
  const running = lv.running === true;
  const pumpOn = (on) => (on ? "pump-rot" : "");
  const flowCls = (on) => (on ? "pipe-flow" : "");
  const T = (v) => (v == null ? "–" : `${fmt(v, 1)} °C`);

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
  // Wärmepumpe
  svg += `<rect x="20" y="150" width="180" height="230" rx="18" class="node"/>
  <text x="38" y="178" class="lbl">${esc(t("WÄRMEPUMPE"))}</text>
  <text x="38" y="216" class="v1">${fmt(lv.heat, 1)} kW</text>
  <text x="38" y="236" class="v3">${esc(t("Wärme · Strom {p} kW", { p: fmt(lv.power, 2) }))}</text>
  <text x="38" y="268" class="v2">COP ${fmt(lv.cop, 1)}</text>
  <text x="38" y="300" class="v3 ${running ? "ok" : ""}">● ${esc(running ? (charging ? t("lädt Warmwasser") : lv.defrost ? t("taut ab") : t("heizt")) : t("aus"))}</text>
  <text x="38" y="328" class="v3">${esc(t("Spreizung {s} K", { s: fmt(lv.spread, 1) }))}</text>
  <text x="38" y="346" class="v3">${esc(t("Volumenstrom {v} l/min", { v: fmt(lv.volume, 1) }))}</text>
  <text x="38" y="364" class="v3">${esc(t("außen {o} °C", { o: fmt(lv.outdoor, 1) }))}</text>`;
  // Vorlauf → Umschaltung
  const toBuf = running && !charging;
  const toDhw = running && charging;
  svg += `<path d="M200 200 H260" class="pipe" style="stroke:${hpCol}"/><path d="M200 200 H260" class="dash ${flowCls(running)}"/>
  <rect x="203" y="176" width="54" height="18" rx="5" class="tag"/><text x="230" y="189" class="tv">${esc(fmt(lv.flow, 1))} °C</text>
  <path d="M260 200 V110 H330" class="pipe" style="stroke:${toBuf ? hpCol : "var(--hz-line)"}"/><path d="M260 200 V110 H330" class="dash ${flowCls(toBuf)}"/>
  <path d="M260 200 V${dhwY + 60} H330" class="pipe" style="stroke:${toDhw ? hpCol : "var(--hz-line)"}"/><path d="M260 200 V${dhwY + 60} H330" class="dash ${flowCls(toDhw)}"/>
  <circle cx="260" cy="200" r="7" class="valve"/>
  <text x="268" y="150" class="v3 sm">${esc(t("Umschaltung"))}</text><text x="268" y="163" class="v3 sm">→ ${esc(charging ? t("Warmwasser") : t("Heizen"))}</text>`;
  // Rücklauf
  svg += `<path d="M330 250 H230 V340 H200" class="pipe" style="stroke:${toBuf || !running ? retCol : "var(--hz-line)"}"/><path d="M330 250 H230 V340 H200" class="dash ${flowCls(toBuf)}"/>
  <rect x="237" y="260" width="46" height="18" rx="5" class="tag"/><text x="260" y="273" class="tv">${esc(fmt(lv.ret, 1))} °C</text>
  <circle cx="295" cy="250" r="12" class="pumpc"/><path class="${pumpOn(toBuf)}" d="M295 241 L301 255 L289 255 Z" style="fill:${toBuf ? retCol : "var(--hz-mut)"}"/>
  <path d="M330 ${dhwY + 150} H230 V340" class="pipe" style="stroke:${toDhw ? retCol : "var(--hz-line)"}"/>
  <circle cx="295" cy="${dhwY + 150}" r="12" class="pumpc"/><path class="${pumpOn(lv.dhwPump)}" d="M295 ${dhwY + 141} L301 ${dhwY + 155} L289 ${dhwY + 155} Z" style="fill:${lv.dhwPump ? retCol : "var(--hz-mut)"}"/>`;
  // Puffer
  svg += `<rect x="330" y="70" width="110" height="200" rx="55" fill="url(#g-buf)" class="tank"/>
  <text x="385" y="60" class="lbl" text-anchor="middle">${esc(t("PUFFER"))}</text>
  <rect x="348" y="150" width="74" height="40" rx="10" class="glass"/>
  <text x="385" y="168" class="v2s" text-anchor="middle">${esc(T(lv.buffer))}</text>
  <text x="385" y="183" class="v3" text-anchor="middle">${esc(t("Soll {s}", { s: fmt(lv.bufferTarget, 1) }))}</text>`;
  if (bufferCircuit) {
    const bc = lc[bufferCircuit.id] || {};
    svg += `<text x="385" y="290" class="v3" text-anchor="middle">${esc(bufferCircuit.name)} · ${esc(bc.pump ? t("Pumpe an") : t("Pumpe aus"))}</text>`;
  }
  // Warmwasserspeicher
  svg += `<rect x="320" y="${dhwY + 30}" width="130" height="150" rx="26" fill="url(#g-dhw)" class="tank"/>
  <text x="385" y="${dhwY + 22}" class="lbl" text-anchor="middle">${esc(t("WARMWASSER"))}</text>
  <rect x="345" y="${dhwY + 85}" width="80" height="40" rx="10" class="glass"/>
  <text x="385" y="${dhwY + 103}" class="v2s" text-anchor="middle">${esc(T(lv.dhw))}</text>
  <text x="385" y="${dhwY + 118}" class="v3" text-anchor="middle">${esc(t("Soll {s}", { s: fmt(lv.dhwTarget, 1) }))}</text>
  <path d="M450 ${dhwY + 60} H515" class="pipe thin" style="stroke:${pipeColor(lv.dhw)}"/><text x="458" y="${dhwY + 50}" class="v3">${esc(t("Zapfung"))}</text>
  <path d="M515 ${dhwY + 160} H450" class="pipe thin" style="stroke:${pipeColor(12)}"/><text x="458" y="${dhwY + 178}" class="v3">${esc(t("Kaltwasser"))}</text>`;
  // Heizkreise
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
  // Warmwasser-Karte rechts
  const w = (d.kpis && d.kpis.hydraulics && d.kpis.hydraulics.dhw) || {};
  svg += `<rect x="600" y="${dhwY + 30}" width="360" height="150" rx="14" class="node"/>
  <text x="626" y="${dhwY + 58}" class="v2s">${esc(t("Warmwasser"))}</text>
  <text x="626" y="${dhwY + 76}" class="v3">${esc(charging ? t("lädt gerade") : t("lädt nicht"))}${lv.dhw != null && lv.dhwTarget != null ? esc(" · " + t("{k} K unter Soll", { k: fmt(Math.max(0, lv.dhwTarget - lv.dhw), 1) })) : ""}</text>
  <text x="626" y="${dhwY + 108}" class="v3">${esc(t("Ladungen / Tag"))}</text><text x="626" y="${dhwY + 130}" class="v2">${fmt(w.charges_per_day, 1)}</text>
  <text x="736" y="${dhwY + 108}" class="v3">${esc(t("Ladedauer"))}</text><text x="736" y="${dhwY + 130}" class="v2">${fmt(w.charge_minutes, 0)} min</text>
  <text x="846" y="${dhwY + 108}" class="v3">${esc(t("Abkühlung"))}</text><text x="846" y="${dhwY + 130}" class="v2">${fmt(w.cooling_k_per_h, 2)} K/h</text>`;
  const water = d.kpis && d.kpis.costs && d.kpis.costs.water;
  if (water) svg += `<text x="626" y="${dhwY + 162}" class="v3">${esc(t("Wasser heute {d} m³ · Monat {m} m³", { d: fmt(water.today_m3, 2), m: fmt(water.month_m3, 2) }))}</text>`;
  svg += `</svg>`;

  const sentence = running
    ? charging
      ? t("Die Wärmepumpe <b>lädt gerade Warmwasser</b> ({a} von {b} °C).", { a: fmt(lv.dhw, 1), b: fmt(lv.dhwTarget, 1) })
      : t("Die Wärmepumpe <b>heizt den Puffer</b> mit {f} °C, der Puffer hat {p} °C bei {s} °C Soll.", { f: fmt(lv.flow, 1), p: fmt(lv.buffer, 1), s: fmt(lv.bufferTarget, 1) })
    : t("Der Verdichter steht. Der Puffer hält {p} °C bei {s} °C Soll.", { p: fmt(lv.buffer, 1), s: fmt(lv.bufferTarget, 1) });

  const rowsCirc = circuits
    .map((c) => {
      const fl = c.flow || {};
      const dv = fl.deviation && fl.deviation.median;
      const tone = dv == null ? "mut" : Math.abs(dv) <= 1 ? "ok" : Math.abs(dv) <= 2 ? "warn" : "bad";
      const run = c.pump && c.pump.run_share;
      return `<div class="c rcard"><div class="top"><b>${esc(c.name)}</b>${pill(tone, dv == null ? t("kein Soll") : t("Median {m} K", { m: signed(dv) }))}</div>
        <div class="row2"><span>${esc(t("Pumpe läuft"))}</span><span>${run == null ? "–" : fmt(run * 100, 0) + " %"}</span></div>
        <div class="row2"><span>${esc(t("Mischer-Impulse"))}</span><span>${c.mixer && c.mixer.pulses_per_day != null ? fmt(c.mixer.pulses_per_day, 0) + " " + t("/Tag") : "–"}</span></div>
        <div class="row2"><span>${esc(t("Räume"))}</span><span>${esc((c.rooms || []).join(", ") || "–")}</span></div></div>`;
    })
    .join("");
  return `${say(sentence, t("Werte live aus Home Assistant"))}
    <section class="c wide"><div class="h"><span>${esc(t("Fließbild"))}</span>${q("schema", ui)}</div>${hb("schema", ui)}<div class="flowwrap">${svg}</div>
    <div class="fd">${esc(t("Rohrfarbe = Temperatur. Die Strichlinie läuft nur, wenn die Pumpe läuft. Raum-Chips zeigen die Abweichung zum Soll (7 Tage)."))}</div></section>
    <div class="grid g3">${rowsCirc}</div>`;
}

// ---------------------------------------------------------------- Geräte
export function devicesBlock(d) {
  const dv = d.devices || {};
  const hp = dv.heat_pump;
  const label = (x) => (x ? [x.manufacturer, x.model].filter(Boolean).join(" · ") || x.name || "" : "");
  const ds = (d.datasheet && d.datasheet.heat_pump) || null;
  const r2 = (a, b) => `<div class="row2"><span>${esc(t(a))}</span><span>${b}</span></div>`;
  const hpCard = ds
    ? `<div class="c dcard"><div class="top"><b>${esc(t("Wärmepumpe"))}</b>${pill("ok", t("Datenblatt"))}</div>
    <div class="md">${esc(`${ds.manufacturer} ${ds.model}`)}</div>
    ${r2("Regler", esc(label(hp) || "–"))}
    ${r2("SCOP (EN 14825)", fmt(ds.scop, 2))}
    ${r2("COP A7 · A2 · A−7 (W35)", (ds.points || []).filter((p) => p.flow === 35 && [7, 2, -7].includes(p.outdoor)).map((p) => fmt(p.cop, 2)).join(" · "))}
    ${r2("Leistung bei W35", (ds.range || []).map((r) => `A${r.outdoor}: ${fmt(r.min_kw, 1)}–${fmt(r.max_kw, 1)} kW`).join(" · "))}
    ${r2("Einsatzgrenzen", esc(t("{a} bis {b} °C außen · Vorlauf bis {f} °C", { a: fmt(ds.limits.outdoor_min_c, 0), b: fmt(ds.limits.outdoor_max_c, 0), f: fmt(ds.limits.flow_max_c, 0) })))}
    ${r2("Mindest-Volumenstrom", `${fmt(ds.min_flow_lpm, 1)} l/min`)}
    ${r2("Kältemittel", `${esc(ds.refrigerant)} · ${fmt(ds.refrigerant_kg, 1)} kg`)}
    ${r2("Heizstab", `${fmt(ds.aux_heater_kw, 1)} kW`)}
    <div class="fd"><a href="${esc(ds.source)}" target="_blank" rel="noopener">${esc(t("Datenblatt"))}</a> · <a href="${esc(ds.manual)}" target="_blank" rel="noopener">${esc(t("Regler-Anleitung"))}</a></div></div>`
    : `<div class="c dcard"><div class="top"><b>${esc(t("Wärmepumpe"))}</b>${hp ? pill("ok", t("erkannt")) : pill("mut", t("nicht im Register"))}</div>
    <div class="md">${esc(label(hp) || "–")}</div>${hp && hp.sw_version ? `<div class="row2"><span>${esc(t("Firmware"))}</span><span>${esc(hp.sw_version)}</span></div>` : ""}
    <div class="fd">${esc(t("Modell unter Konfigurieren → Wärmepumpe und Speicher wählen – dann vergleicht die Analyse mit dem Datenblatt."))}</div></div>`;
  const tanks = [d.datasheet && d.datasheet.buffer, d.datasheet && d.datasheet.dhw_tank].filter(Boolean);
  const tankCard = tanks.length
    ? `<div class="c dcard"><div class="top"><b>${esc(t("Speicher"))}</b></div>${tanks
        .map((s) => r2(s.kind === "buffer" ? "Puffer" : "Warmwasser", `${esc(s.model)} · ${fmt(s.volume_l, 0)} l · ${fmt(s.kwh_per_k, 2)} kWh/K`))
        .join("")}<div class="fd">${esc(t("kWh/K: so viel Wärme nimmt der Speicher je Kelvin auf."))}</div></div>`
    : "";
  const curves = curveCard(d);
  const pumps = (dv.pumps || [])
    .map((p) => `<div class="row2"><span>${esc(p.name)}</span><span>${p.on == null ? "–" : p.on ? esc(t("läuft")) : esc(t("aus"))}</span></div>`)
    .join("");
  const pumpCard = `<div class="c dcard"><div class="top"><b>${esc(t("Pumpen ({n} erkannt)", { n: (dv.pumps || []).length }))}</b></div>${pumps || `<div class="fd">${esc(t("keine Pumpe zugeordnet"))}</div>`}
    <div class="fd">${esc(t("Modell und Stufe je Pumpe unten im Inventar ergänzen – der Katalog füllt Datenblattwerte vor."))}</div></div>`;
  const ths = (dv.thermostats || [])
    .map((x) => {
      const trv = (x.trvs || []).map((r) => label(r.device)).filter(Boolean).join(", ");
      return `<tr><td>${esc(x.name)}</td><td>${esc(trv || (x.monitor ? t("ohne Thermostat") : "–"))}</td><td>${x.valve == null ? "–" : fmt(x.valve, 0) + " %"}</td><td>${x.battery == null ? "–" : `<span class="${x.battery_low ? "tone-bad" : ""}">${fmt(x.battery, 0)} %</span>`}</td><td>${x.heatup_minutes_2k == null ? "–" : fmt(x.heatup_minutes_2k, 0) + " min"}</td></tr>`;
    })
    .join("");
  const thCard = `<div class="c dcard wide"><div class="top"><b>${esc(t("Thermostate und Räume"))}</b></div>
    <div class="tscroll"><table class="tbl"><tr><th>${esc(t("Raum"))}</th><th>${esc(t("Thermostat"))}</th><th>${esc(t("Ventil"))}</th><th>${esc(t("Batterie"))}</th><th>${esc(t("Aufheizen 2 K"))}</th></tr>${ths}</table></div>
    <div class="fd">${esc(t("Aus dem Geräteregister und aus Raumklima. Nichts davon muss von Hand eingetragen werden."))}</div></div>`;
  const extra = tankCard || curves ? `<div class="grid g2">${curves}${tankCard}</div>` : "";
  return `<div class="grid g2">${hpCard}${pumpCard}</div>${extra}<div class="grid">${thCard}</div>`;
}

// Heizkurve, wie der Stiebel-WPM sie aus Steilheit und Raum-Soll rechnet
export function curveCard(d) {
  const curves = (d.datasheet && d.datasheet.curves) || [];
  if (!curves.length) return "";
  const colors = ["var(--hz-heat)", "var(--hz-cool)", "var(--hz-vio)", "var(--hz-ok)"];
  const color = (i) => colors[i % colors.length];
  const lines = curves.map((c, i) => ({ color: color(i), width: 2, points: c.points }));
  const pts = curves.flatMap((c) => c.points.map((p) => ({ x: p.x, y: p.y, r: 0.01, opacity: 0 })));
  const now = (d.datasheet.heat_pump && d.datasheet.heat_pump.now) || {};
  curves.forEach((c, i) => {
    if (now.outdoor != null && c.target_now != null) pts.push({ x: now.outdoor, y: c.target_now, color: color(i), opacity: 0.95, r: 5, title: `${c.name}: ${t("Regler-Soll")} ${fmt(c.target_now, 1)} °C` });
  });
  const rows = curves
    .map((c, i) => {
      const flat = c.room_night != null && c.room_day != null && c.room_night >= c.room_day;
      return `<div class="row2"><span><i class="dot" style="background:${color(i)}"></i>${esc(c.name)} · HK${c.number}</span><span>${esc(t("Steilheit {s} · Raum {r} °C", { s: fmt(c.slope, 2), r: fmt(c.room, 1) }))}${flat ? ` · ${esc(t("ohne Absenkung"))}` : ""}</span></div>`;
    })
    .join("");
  const diff = curves.filter((c) => c.difference != null);
  const note = diff.length ? t("Regler-Soll jetzt gegen Kurve: {v}", { v: diff.map((c) => `${c.name} ${signed(c.difference)} K`).join(" · ") }) : "";
  return `<div class="c dcard"><div class="top"><b>${esc(t("Heizkurven laut Regler"))}</b></div>${scatterChart(pts, { h: 180, unitY: "°C", lines })}${rows}<div class="fd">${esc(note)}</div><div class="fd">${esc(t("Linie: Raum-Soll + Steilheit × (Raum-Soll − außen). Punkt: was der Regler gerade fordert."))}</div></div>`;
}
