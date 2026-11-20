// Reine Rechen- und Formatfunktionen (ohne DOM) - in test/logic.test.mjs geprüft.
import { getLang } from "./i18n.js";

export function fmt(value, digits = 1) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return Number(value).toLocaleString(getLang() === "de" ? "de-DE" : "en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function signed(value, digits = 1) {
  if (value == null) return "–";
  return (value > 0 ? "+" : value < 0 ? "−" : "±") + fmt(Math.abs(value), digits);
}

export function esc(v) {
  return String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export function dayLabel(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.`;
}

// Stufe des Anlagen-Checks -> Text und Ton
export const SCORE_LEVEL = {
  very_good: { label: "Sehr gut", tone: "ok" },
  good: { label: "Gut", tone: "ok" },
  watch: { label: "Beobachten", tone: "warn" },
  action: { label: "Handlungsbedarf", tone: "bad" },
  learning: { label: "Lernt noch", tone: "mut" },
  limited: { label: "Eingeschränkt", tone: "warn" },
};

export const CHECK_NAMES = {
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
  spread: "Spreizung",
};

// Lineare Regression y = a + b*x (für die COP-Kennlinie)
export function linearFit(points) {
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

// Mittel der letzten n gegen die n davor -> Richtung
export function trend(values, n = 7, tolerance = 0.03) {
  const v = values.filter((x) => x != null);
  if (v.length < n * 2) return null;
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const recent = mean(v.slice(-n));
  const before = mean(v.slice(-2 * n, -n));
  if (!before) return null;
  const rel = (recent - before) / Math.abs(before);
  return { rel, dir: rel > tolerance ? "up" : rel < -tolerance ? "down" : "flat" };
}

// Tageswerte nach Außentemperatur bündeln (2-K-Schritte)
export function binByOutdoor(rows, key, width = 2) {
  const groups = new Map();
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

// Wirkung einer Änderung, um das Wetter bereinigt: COP-Differenz minus das,
// was die eigene Kennlinie allein durch die andere Außentemperatur erwarten lässt.
export function weatherAdjusted(before, after, fit) {
  if (!before || !after || before.cop == null || after.cop == null) return null;
  const raw = after.cop - before.cop;
  if (!fit || before.outdoor == null || after.outdoor == null) return { raw, adjusted: null };
  const expected = fit.b * (after.outdoor - before.outdoor);
  return { raw, adjusted: raw - expected };
}

export function rangeRows(series, days) {
  return days ? series.slice(-days) : series;
}

// Skala mit "schönen" Teilstrichen
export function niceScale(min, max, ticks = 4) {
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

// Ton einer Kennzahl gegen ihre Schwelle
export function kpiTone(value, threshold, higherIsBad = true) {
  if (value == null || threshold == null) return "mut";
  const bad = higherIsBad ? value > threshold : value < threshold;
  if (bad) return "bad";
  const near = higherIsBad ? value > threshold * 0.8 : value < threshold * 1.2;
  return near ? "warn" : "ok";
}
