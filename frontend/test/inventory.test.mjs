// Inventar und Einstellungen: abgeleitete Schlüssel, Formulare und Vorbelegung.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setLang } from "../src/i18n.js";
import { renderView } from "../src/views.js";
import {
  comparisonFields,
  currentValue,
  objectKey,
  objectName,
  targetChoices,
} from "../src/inventory.js";

const d = JSON.parse(readFileSync(new URL("./fixtures/summary.json", import.meta.url)));

test("Schlüssel werden aus der Auswahl abgeleitet, nie getippt", () => {
  setLang({ language: "de" });
  assert.equal(objectKey("pumps", "HK 2"), "pumps.hk_2");
  assert.equal(objectKey("thermostats", "Wohnzimmer"), "thermostats.wohnzimmer");
  assert.equal(objectKey("hydraulics", ""), "hydraulics");
});

test("Objektnamen nutzen Kreis- und Raumnamen", () => {
  setLang({ language: "de" });
  assert.match(objectName(d, "pumps.hk2"), /Pumpe/);
  assert.match(objectName(d, "radiators.wohnen"), /Heizkörper/);
});

test("Vergleichsziele enthalten Heizkurve und Inventar", () => {
  const targets = targetChoices(d).map((item) => item.value);
  assert.equal(targets[0], "heizkurve");
  assert.ok(targets.includes("pumps.hk1"));
  const fields = comparisonFields(d, "pumps.hk1").map((item) => item.key);
  assert.ok(fields.includes("model"));
  assert.ok(fields.includes("valve_preset") === false);
});

test("alter Wert wird aus dem Inventar vorbelegt", () => {
  assert.equal(currentValue(d, "radiators.wohnen", "valve_preset"), 4);
});

test("Inventar-Formular kommt aus dem Schema statt aus JSON", () => {
  setLang({ language: "de" });
  const ui = {
    help: null,
    range: 90,
    form: false,
    widths: {},
    invForm: { section: "pumps", object: null, selection: "", values: {}, note: "", errors: {} },
  };
  const html = renderView("inventar", d, ui, {});
  assert.ok(!html.includes("Werte (JSON)"), "kein JSON-Feld");
  assert.ok(html.includes('name="f_model"'), "Modellfeld fehlt");
  assert.ok(html.includes('name="selection"'), "Auswahlfeld fehlt");
  assert.ok(html.includes('data-form="inventory"'));
});

test("Bearbeiten legt vorhandene Werte in die Felder", () => {
  setLang({ language: "de" });
  const record = d.inventory.radiators.wohnen;
  const ui = {
    help: null,
    range: 90,
    form: false,
    widths: {},
    invForm: { section: "radiators", object: "radiators.wohnen", selection: "wohnen", values: { ...record }, note: "", errors: {} },
  };
  const html = renderView("inventar", d, ui, {});
  assert.ok(html.includes('value="wohnen"'));
  assert.ok(!html.includes('name="selection"'), "Objekt ist beim Bearbeiten fix");
});

test("Einstellungen nutzen Formularfelder, kein JSON", () => {
  setLang({ language: "de" });
  const cfg = { data: {}, options: {}, circuits: [], rooms: [], thresholds: {} };
  const ui = { help: null, range: 90, form: false, widths: {}, cfgErrors: {} };
  const html = renderView("einstellungen", { ...d, config: cfg }, ui, {});
  assert.ok(!html.includes("cfgjson"));
  assert.ok(!html.includes("data-cfgjson"));
  assert.ok(html.includes('data-cfg="data"'));
  assert.ok(html.includes('data-thr="starts_per_day"'), "Schwelle als Feld");
  assert.ok(html.includes('data-act="cfg-circ-add"'));
});

test("Einstellungen zeigen Feldfehler", () => {
  setLang({ language: "de" });
  const cfg = { data: {}, options: {}, circuits: [], rooms: [], thresholds: {} };
  const ui = { help: null, range: 90, form: false, widths: {}, cfgErrors: { power_entity: "not_found" } };
  const html = renderView("einstellungen", { ...d, config: cfg }, ui, {});
  assert.ok(html.includes("Entity nicht gefunden"));
});

test("Vergleichsformular bietet Was und Einstellung als Auswahl", () => {
  setLang({ language: "de" });
  const ui = { help: null, range: 90, form: true, widths: {}, chgObject: "radiators.wohnen", chgField: "valve_preset" };
  const html = renderView("vergleich", { ...d, config: { data: {}, options: {} } }, ui, {});
  assert.ok(html.includes('data-chg="object"'));
  assert.ok(html.includes('data-chg="field"'));
  assert.ok(html.includes('value="4"'), "alter Wert vorbelegt");
});

test("alle Formularzustände rendern ohne undefined und NaN", () => {
  const cfg = {
    data: { power_entity: "sensor.wp_strom" },
    options: {
      circuits: [{ id: "hk1", name: "Heizkörper OG", type: "radiators", temperature_entity: "sensor.vl" }],
      rooms: [{ id: "wohnen", name: "Wohnzimmer", room_type: "living", circuit: "hk1", climate_entity: "climate.wohnen" }],
      thresholds: { starts_per_day: 7 },
    },
  };
  for (const language of ["de", "en"]) {
    setLang({ language });
    const base = { help: null, range: 90, form: true, widths: {}, cfgMsg: null, cfgErrors: { circuits: "format" }, hass: null };
    const states = [
      ["inventar", { invForm: { section: "radiators", object: null, selection: "wohnen", values: {}, note: "", errors: { power_w: "range" } }, invSaved: true }],
      ["einstellungen", base],
      ["vergleich", { ...base, chgObject: "heizkurve", chgField: "steigung" }],
    ];
    for (const [view, extra] of states) {
      const html = renderView(view, { ...d, config: cfg }, { ...base, ...extra }, {});
      assert.ok(html.length > 500, `${language}/${view}`);
      assert.ok(!html.includes("undefined"), `${language}/${view}: undefined`);
      assert.ok(!html.includes("NaN"), `${language}/${view}: NaN`);
      assert.ok(!html.includes("[object Object]"), `${language}/${view}: Objekt`);
    }
  }
  setLang({ language: "de" });
});
