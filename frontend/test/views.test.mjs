// Ansichten rendern ohne DOM - jede Ansicht, beide Sprachen, ohne Ausnahme.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setLang, EN } from "../src/i18n.js";
import { VIEWS, renderView, header, objectLabel } from "../src/views.js";
import { buildDashboard } from "../src/strategy.js";
import { HELP_KEYS, helpText } from "../src/help.js";

const de = JSON.parse(readFileSync(new URL("./fixtures/summary.json", import.meta.url)));
const en = JSON.parse(readFileSync(new URL("./fixtures/summary-en.json", import.meta.url)));

test("alle Ansichten rendern (de)", () => {
  setLang({ language: "de" });
  for (const v of VIEWS) {
    const html = header(de, v) + renderView(v, de, { help: null, range: 90, form: v === "vergleich", widths: {} }, {});
    assert.ok(html.length > 500, v);
    assert.ok(!html.includes("undefined"), `${v}: undefined im HTML`);
    assert.ok(!html.includes("NaN"), `${v}: NaN im HTML`);
  }
});

test("englische Oberflaeche ohne deutsche Reste", () => {
  setLang({ language: "en" });
  const names = /Heizkörper OG|Fußboden EG|Wärmepumpe|Kinderzimmer|Bad|Wohnzimmer|Schlafzimmer|Arbeitszimmer|Steigung gesenkt|heizkurve|Stufe \d/g;
  for (const v of VIEWS) {
    const html = renderView(v, en, { help: null, range: 90, form: true, widths: {} }, {}).replace(names, "");
    const text = html.replace(/<[^>]+>/g, " ");
    const hit = text.match(/[^\s]*[äöüÄÖÜß][^\s]*/);
    assert.equal(hit, null, `${v}: deutscher Rest „${hit && hit[0]}“`);
  }
  setLang({ language: "de" });
});

test("jede Hilfe hat beide Sprachen und jeder ?-Schlüssel existiert", () => {
  const src = readFileSync(new URL("../src/views.js", import.meta.url), "utf8");
  const used = [...src.matchAll(/head\([^,]+,\s*"(\w+)"/g)].map((m) => m[1]);
  for (const k of used) assert.ok(HELP_KEYS.includes(k), `Hilfe fehlt: ${k}`);
  for (const k of HELP_KEYS) {
    setLang({ language: "de" });
    const d = helpText(k);
    setLang({ language: "en" });
    assert.ok(d && helpText(k) && d !== helpText(k), k);
  }
  setLang({ language: "de" });
});

test("jeder t()-Text hat eine englische Übersetzung", () => {
  const files = ["views.js", "card.js", "strategy.js", "logic.js"];
  const missing = [];
  for (const f of files) {
    const src = readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/\bt\("((?:[^"\\]|\\.)+)"/g)) if (!(m[1] in EN)) missing.push(m[1]);
  }
  assert.deepEqual([...new Set(missing)], []);
});

test("Strategie baut fünf Ansichten mit der Karte", () => {
  setLang({ language: "de" });
  const d = buildDashboard({});
  assert.equal(d.views.length, 5);
  assert.deepEqual(d.views.map((v) => v.path), VIEWS);
  for (const v of d.views) assert.equal(v.cards[0].type, "custom:heizungsanalyse-card");
});

test("Objektnamen lesbar", () => {
  setLang({ language: "de" });
  assert.equal(objectLabel("pumps.hk1"), "Pumpe hk1");
  assert.equal(objectLabel("hydraulics"), "Hydraulik");
});
