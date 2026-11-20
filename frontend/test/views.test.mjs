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

test("jeder Tab beginnt mit einer Einordnung", () => {
  setLang({ language: "de" });
  for (const v of VIEWS) {
    const html = renderView(v, de, { help: null, range: 90, form: v === "vergleich", widths: {}, cfgErrors: {} }, {});
    assert.ok(html.includes('class="say"'), `${v}: Kernsatz fehlt`);
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
  const src = readFileSync(new URL("../src/views.js", import.meta.url), "utf8") + readFileSync(new URL("../src/views8.js", import.meta.url), "utf8");
  const used = [...src.matchAll(/head\([^,]+,\s*"(\w+)"/g), ...src.matchAll(/\bq\("(\w+)"/g)].map((m) => m[1]);
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
  const files = ["views.js", "views8.js", "card.js", "strategy.js", "logic.js"];
  const missing = [];
  for (const f of files) {
    const src = readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8");
    for (const m of src.matchAll(/\bt\("((?:[^"\\]|\\.)+)"/g)) if (!(m[1] in EN)) missing.push(m[1]);
  }
  assert.deepEqual([...new Set(missing)], []);
});

test("kein Einstellungs-Tab mehr – Einstellungen nur unter Konfigurieren", () => {
  assert.ok(!VIEWS.includes("einstellungen"));
});

test("Strategie baut acht Ansichten mit der Karte", () => {
  setLang({ language: "de" });
  const d = buildDashboard({});
  assert.equal(d.views.length, 8);
  assert.deepEqual(d.views.map((v) => v.path), VIEWS);
  for (const v of d.views) assert.equal(v.cards[0].type, "custom:heizungsanalyse-card");
});

test("Objektnamen lesbar", () => {
  setLang({ language: "de" });
  assert.equal(objectLabel("pumps.hk1"), "Pumpe hk1");
  assert.equal(objectLabel("hydraulics"), "Hydraulik");
});


test("Ansicht Protokoll rendert in beiden Sprachen", () => {
  const log = JSON.parse(readFileSync(new URL("./fixtures/log.json", import.meta.url)));
  for (const language of ["de", "en"]) {
    setLang({ language });
    const html = renderView("protokoll", log, { help: null, range: 90, form: false, widths: {}, logCat: "", logLevel: "", logQ: "", logHours: 168, logOpen: null }, {});
    assert.ok(html.length > 500, language);
    assert.ok(!html.includes("undefined"), `${language}: undefined`);
    assert.ok(!html.includes("NaN"), `${language}: NaN`);
    assert.ok(html.includes("Systemstatus") || html.includes("System status"), language);
  }
  setLang({ language: "de" });
});

test("Protokoll zeigt Neustart-Marker und Details", () => {
  setLang({ language: "de" });
  const log = JSON.parse(readFileSync(new URL("./fixtures/log.json", import.meta.url)));
  const closed = renderView("protokoll", log, { help: null, widths: {}, logCat: "", logLevel: "", logQ: "", logHours: 168, logOpen: null }, {});
  assert.ok(closed.includes("Neustart"));
  assert.ok(!closed.includes("<pre>"));
  const opened = renderView("protokoll", log, { help: null, widths: {}, logCat: "", logLevel: "", logQ: "", logHours: 168, logOpen: "2026-11-17T11:58:07+00:00Neuer Hinweis F01: Vorlauf liegt über Soll" }, {});
  assert.ok(opened.includes("<pre>"));
  assert.ok(opened.includes("median_k"));
});

test("Strategie steht in „Dashboard hinzufügen“", async () => {
  const src = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  assert.match(src, /customStrategies\.push\(\{[\s\S]*type: "heizungsanalyse"[\s\S]*strategyType: "dashboard"/);
});
