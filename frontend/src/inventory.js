// Inventar-Hilfen: Objektnamen, abgeleitete Schlüssel und Vergleichsziele.
// Reine Funktionen ohne DOM, damit die Node-Tests sie direkt prüfen können.
import { getLang } from "./i18n.js";

export const SECTIONS = ["pumps", "thermostats", "hydraulics", "radiators"];

const SECTION_LABEL = {
  pumps: { de: "Pumpen", en: "Pumps" },
  thermostats: { de: "Thermostate", en: "Thermostats" },
  hydraulics: { de: "Hydraulik", en: "Hydraulics" },
  radiators: { de: "Heizkörper", en: "Radiators" },
};

export const HEIZKURVE_FIELDS = ["heizkurve", "steigung", "offset"];

export function schemaOf(d) {
  return (d && d.inventory_schema && d.inventory_schema.sections) || {};
}

export function sectionFields(d, section) {
  const entry = schemaOf(d)[section];
  return (entry && entry.fields) || [];
}

export function fieldSpec(d, section, field) {
  return sectionFields(d, section).find((item) => item.key === field) || { key: field, type: "text", label: { de: field, en: field } };
}

export function localized(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  const lang = getLang() === "en" ? "en" : "de";
  return value[lang] || value.de || value.en || "";
}

export function slug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function objectKey(section, selection) {
  return section === "hydraulics" ? "hydraulics" : `${section}.${slug(selection)}`;
}

function findName(list, id) {
  const hit = (list || []).find((item) => String(item.id) === String(id));
  return hit ? hit.name || hit.id : id;
}

export function objectName(d, object) {
  const [section, key] = String(object || "").split(".");
  const base = localized((schemaOf(d)[section] || {}).title) || section;
  if (!key) return base;
  if (section === "pumps") return `${base} ${findName(d.circuits, key)}`;
  if (section === "thermostats" || section === "radiators") return `${base} ${findName(d.rooms, key)}`;
  return `${base} ${key}`;
}

export function objectSection(object) {
  return String(object || "").split(".")[0];
}

export function objectEntries(d, section) {
  const inventory = (d && d.inventory) || {};
  const data = inventory[section] || {};
  if (section === "hydraulics") return Object.keys(data).length ? [{ key: "", object: "hydraulics", record: data }] : [];
  return Object.keys(data).map((key) => ({ key, object: `${section}.${key}`, record: data[key] || {} }));
}

export function targetChoices(d) {
  const out = [{ value: "heizkurve", label: localized({ de: "Heizkurve", en: "Heating curve" }) }];
  for (const section of SECTIONS) {
    for (const entry of objectEntries(d, section)) {
      out.push({ value: entry.object, label: objectName(d, entry.object) });
    }
  }
  return out;
}

export function comparisonFields(d, object) {
  if (!object || object === "heizkurve") {
    return [
      { key: "heizkurve", label: localized({ de: "Heizkurve", en: "Heating curve" }) },
      { key: "steigung", label: localized({ de: "Steigung", en: "Slope" }) },
      { key: "offset", label: localized({ de: "Offset", en: "Offset" }) },
    ];
  }
  const section = objectSection(object);
  const fields = sectionFields(d, section)
    .filter((item) => item.key !== "notes")
    .map((item) => ({ key: item.key, label: localized(item.label), unit: item.unit || "" }));
  return fields.length ? fields : HEIZKURVE_FIELDS.map((key) => ({ key, label: key }));
}

export function currentValue(d, object, field) {
  if (!object || object === "heizkurve") {
    const options = (d && d.config && d.config.options) || {};
    if (field === "steigung") return options.heating_curve_slope ?? "";
    if (field === "offset") return options.heating_curve_offset ?? "";
    return "";
  }
  const section = objectSection(object);
  const key = object.includes(".") ? object.split(".").slice(1).join(".") : "";
  const data = ((d && d.inventory) || {})[section] || {};
  const record = section === "hydraulics" ? data : data[key] || {};
  const value = record[field];
  return value == null ? "" : value;
}

export function completenessText(d) {
  const info = d && d.inventory_completeness;
  if (!info) return "";
  const lang = getLang() === "en";
  return lang ? `${info.percent}% complete` : `${info.percent} % vollständig`;
}

export function missingSections(d) {
  const info = (d && d.inventory_completeness && d.inventory_completeness.sections) || {};
  return SECTIONS.filter((section) => (info[section] || {}).percent === 0);
}

export function sectionTitle(d, section) {
  return localized((schemaOf(d)[section] || {}).title) || localized(SECTION_LABEL[section]) || section;
}

export function sectionSelectionHint(section) {
  if (section === "pumps") return { de: "Heizkreis", en: "Heating circuit" };
  if (section === "thermostats" || section === "radiators") return { de: "Raum", en: "Room" };
  return null;
}
