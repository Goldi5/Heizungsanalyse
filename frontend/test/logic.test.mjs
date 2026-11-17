import { test } from "node:test";
import assert from "node:assert/strict";
import { setLang } from "../src/i18n.js";
import { binByOutdoor, fmt, kpiTone, linearFit, niceScale, signed, trend, weatherAdjusted } from "../src/logic.js";
import { binChart, ring, scatterChart, sparkline, timeChart, withWidth } from "../src/charts.js";

test("Zahlen im deutschen Format", () => {
  setLang({ language: "de" });
  assert.equal(fmt(3.456, 1), "3,5");
  assert.equal(fmt(null), "–");
  assert.equal(signed(1.4), "+1,4");
  assert.equal(signed(-0.9), "−0,9");
});

test("Kennlinie und wetterbereinigte Wirkung", () => {
  const fit = linearFit([{ x: 0, y: 3 }, { x: 10, y: 4 }, { x: 5, y: 3.5 }]);
  assert.ok(Math.abs(fit.b - 0.1) < 1e-9);
  // kaelter danach: Rohwert sinkt, bereinigt bleibt die Verbesserung sichtbar
  const w = weatherAdjusted({ cop: 4.0, outdoor: 6 }, { cop: 3.9, outdoor: 3 }, fit);
  assert.ok(Math.abs(w.raw + 0.1) < 1e-9);
  assert.ok(Math.abs(w.adjusted - 0.2) < 1e-9);
  assert.equal(linearFit([{ x: 1, y: 1 }]), null);
});

test("Trend, Baender, Skala, Ton", () => {
  assert.equal(trend([1, 1, 1, 1, 2, 2, 2, 2], 4).dir, "up");
  assert.equal(trend([1, 2], 4), null);
  const bins = binByOutdoor([{ outdoor: 1, starts: 10 }, { outdoor: 1.5, starts: 20 }, { outdoor: 5, starts: 4 }], "starts");
  assert.deepEqual(bins.map((b) => [b.lower, b.mean]), [[0, 15], [4, 4]]);
  const s = niceScale(3.1, 4.9);
  assert.ok(s.min <= 3.1 && s.max >= 4.9);
  assert.equal(kpiTone(25, 20), "bad");
  assert.equal(kpiTone(10, 20), "ok");
  assert.equal(kpiTone(15, 20, false), "bad");
});

test("Diagramme liefern SVG und passen sich der Breite an", () => {
  const rows = Array.from({ length: 30 }, (_, i) => ({ day: `2026-11-${String(i + 1).padStart(2, "0")}`, cop: 3 + i / 30, outdoor: 5 - i / 10 }));
  const a = withWidth(320, () => timeChart(rows, [{ key: "cop", kind: "line", color: "red", axis: "l" }]));
  const b = withWidth(900, () => timeChart(rows, [{ key: "cop", kind: "line", color: "red", axis: "l" }]));
  assert.match(a, /viewBox="0 0 320 /);
  assert.match(b, /viewBox="0 0 900 /);
  assert.equal(timeChart([], []), "");
  assert.match(scatterChart([{ x: 0, y: 3 }, { x: 5, y: 4 }]), /<circle/);
  assert.match(binChart([{ lower: 0, upper: 2, mean: 5, n: 3 }], { ref: 4 }), /class="ref"/);
  assert.match(ring(80, "ok"), />80</);
  assert.match(sparkline([1, 2, null, 3], "red"), /<path/);
});
