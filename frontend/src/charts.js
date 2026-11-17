// Kleine SVG-Diagramme ohne Bibliothek. Liefern Strings, damit sie testbar bleiben.
import { dayLabel, esc, fmt, niceScale } from "./logic.js";

let W = 640;
// Breite je Diagramm: die Karte misst den Platz und zeichnet passend neu (Schrift bleibt gleich groß)
export function withWidth(w, fn) {
  const prev = W;
  W = Math.max(260, Math.round(w || 640));
  try {
    return fn();
  } finally {
    W = prev;
  }
}
const PAD = { l: 42, r: 42, t: 24, b: 26 };

function axisY(scale, h, unit, side = "l", color = "var(--hz-mut)") {
  const x = side === "l" ? PAD.l - 6 : W - PAD.r + 6;
  const anchor = side === "l" ? "end" : "start";
  const y = (v) => PAD.t + (1 - (v - scale.min) / (scale.max - scale.min)) * (h - PAD.t - PAD.b);
  return scale.ticks
    .map((v) => {
      const lines = side === "l" ? `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/>` : "";
      const digits = scale.step < 1 ? 1 : 0;
      return `${lines}<text x="${x}" y="${y(v) + 4}" text-anchor="${anchor}" style="fill:${color}">${fmt(v, digits)}</text>`;
    })
    .join("") + (unit ? `<text x="${side === "l" ? 4 : W - 4}" y="10" text-anchor="${side === "l" ? "start" : "end"}" class="unit" style="fill:${color}">${esc(unit)}</text>` : "");
}

/**
 * Zeitreihe über Tage: Balken und Linien, optional zweite Achse.
 * series: [{ key, kind: "bar"|"line"|"area", color, axis: "l"|"r", stack }]
 */
export function timeChart(rows, series, { h = 220, unitL = "", unitR = "", refL = null, markers = [] } = {}) {
  if (!rows.length) return "";
  const inner = W - PAD.l - PAD.r;
  const step = inner / rows.length;
  const xs = (i) => PAD.l + step * (i + 0.5);
  const vals = (axis) => {
    const out = [];
    const stacked = series.filter((s) => s.axis === axis && s.stack);
    rows.forEach((r) => {
      let sum = 0;
      for (const s of stacked) sum += r[s.key] || 0;
      if (stacked.length) out.push(sum);
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

  // gestapelte Balken
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
    // Linie mit Lücken
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
  // Markierungen (Änderungen)
  for (const m of markers) {
    const i = rows.findIndex((r) => r.day === m.day);
    if (i < 0) continue;
    body += `<line x1="${xs(i)}" x2="${xs(i)}" y1="${PAD.t}" y2="${h - PAD.b}" class="mark"/><circle cx="${xs(i)}" cy="${PAD.t + 2}" r="4" class="markdot"><title>${esc(m.label)}</title></circle>`;
  }
  // X-Beschriftung: höchstens 7 Daten
  const every = Math.max(1, Math.ceil(rows.length / Math.max(3, Math.min(8, Math.floor(W / 85)))));
  rows.forEach((r, i) => {
    if (i % every === 0 || i === rows.length - 1) {
      if (i !== rows.length - 1 && rows.length - 1 - i < every / 2) return;
      body += `<text x="${xs(i)}" y="${h - 6}" text-anchor="middle">${dayLabel(r.day)}</text>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${h}" class="chart" role="img">${body}</svg>`;
}

/** Streudiagramm (z. B. COP gegen Außentemperatur) mit optionaler Linie. */
export function scatterChart(points, { h = 240, unitX = "°C", unitY = "", lines = [], highlight = null, color = "var(--hz-ok)" } = {}) {
  const pts = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length < 2) return "";
  const allY = pts.map((p) => p.y).concat(lines.flatMap((l) => l.points.map((p) => p.y)));
  const sx = niceScale(Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x)), 5);
  const sy = niceScale(Math.min(...allY), Math.max(...allY));
  const x = (v) => PAD.l + ((v - sx.min) / (sx.max - sx.min)) * (W - PAD.l - PAD.r);
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

/** Kategorien-Balken (z. B. Starts je Außentemperatur-Band). */
export function binChart(bins, { h = 200, color = "var(--hz-warn)", unit = "", ref = null, digits = 1 } = {}) {
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

/** Ring für den Anlagen-Check. */
export function ring(value, tone) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const share = value == null ? 0 : Math.max(0, Math.min(100, value)) / 100;
  return `<svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="${r}" class="ringbg"/><circle cx="60" cy="60" r="${r}" class="ringfg tone-${tone}" stroke-dasharray="${(c * share).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)"/><text x="60" y="70" text-anchor="middle" class="ringv">${value == null ? "…" : value}</text></svg>`;
}

/** Mini-Verlauf für Kennzahl-Kacheln. */
export function sparkline(values, color, { h = 36, kind = "line", ref = null } = {}) {
  const v = values.map((x) => (x == null ? null : Number(x)));
  const nums = v.filter((x) => x != null);
  if (nums.length < 2) return `<svg viewBox="0 0 220 ${h}" class="spark"></svg>`;
  const lo = Math.min(...nums, ref ?? Infinity);
  const hi = Math.max(...nums, ref ?? -Infinity);
  const span = hi - lo || 1;
  const y = (x) => h - 3 - ((x - lo) / span) * (h - 6);
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
