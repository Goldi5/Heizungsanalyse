// Gemeinsame Bausteine für alle Ansichten: Kachel, Formularfeld, Tabelle, Hinweis.
// Bewusst reine HTML-Funktionen – die Karte verdrahtet Ereignisse über data-Attribute.
import { helpText } from "./help.js";
import { localized } from "./inventory.js";
import { esc } from "./logic.js";

export function head(title, key, ui, sub = "") {
  const open = ui.help === key;
  return `<div class="h">${esc(title)}${sub ? ` <span class="sub">${sub}</span>` : ""}<button class="q ${open ? "on" : ""}" data-help="${key}" aria-label="?">?</button></div>${open ? `<div class="help">${esc(helpText(key))}</div>` : ""}`;
}

export function kpiTile({ title, key, ui, value, unit = "", spark = "", body = "", sub = "" }) {
  return `<div class="c">${head(title, key, ui, sub)}<div class="big">${value}${unit ? `<small>${esc(unit)}</small>` : ""}</div>${spark}${body}</div>`;
}

export function statusPill(tone, text) {
  return `<span class="pill tone-${tone}">${esc(text)}</span>`;
}

export function card(title, key, ui, body, sub = "", cls = "") {
  return `<section class="c ${cls}">${head(title, key, ui, sub)}${body}</section>`;
}

export function empty(text) {
  return `<div class="empty">${esc(text)}</div>`;
}

export function banner(tone, text) {
  return `<div class="banner tone-${tone}">${esc(text)}</div>`;
}

export function button(label, { act, variant = "", attrs = "", type = "button" } = {}) {
  const cls = ["btn", variant].filter(Boolean).join(" ");
  return `<button class="${cls}" type="${type}"${act ? ` data-act="${act}"` : ""}${attrs ? ` ${attrs}` : ""}>${esc(label)}</button>`;
}

export function fieldLabel(name, label, unit = "", required = false) {
  return `<label for="${esc(name)}">${esc(label)}${unit ? ` <span class="unit">${esc(unit)}</span>` : ""}${required ? ` <span class="req" aria-hidden="true">*</span>` : ""}</label>`;
}

export function textField({ name, label, value = "", type = "text", unit = "", placeholder = "", error = "", attrs = "" }) {
  return `<div class="field${error ? " invalid" : ""}">${fieldLabel(name, label, unit)}
    <input id="${esc(name)}" name="${esc(name)}" type="${esc(type)}" value="${esc(value ?? "")}" placeholder="${esc(placeholder)}"${attrs ? ` ${attrs}` : ""} aria-invalid="${error ? "true" : "false"}">
    ${error ? `<div class="ferr" role="alert">${esc(error)}</div>` : ""}</div>`;
}

export function selectField({ name, label, value = "", options = [], groups = [], error = "", attrs = "" }) {
  const option = (item) => {
    const val = typeof item === "object" ? item.value : item;
    const text = typeof item === "object" ? localized(item.label) || item.value : item;
    const extra = typeof item === "object" && item.attrs ? ` ${item.attrs}` : "";
    return `<option value="${esc(val)}"${String(val) === String(value ?? "") ? " selected" : ""}${extra}>${esc(text)}</option>`;
  };
  const opts =
    options.map(option).join("") +
    groups
      .map((group) => `<optgroup label="${esc(localized(group.label))}">${group.options.map(option).join("")}</optgroup>`)
      .join("");
  return `<div class="field${error ? " invalid" : ""}">${fieldLabel(name, label)}
    <select id="${esc(name)}" name="${esc(name)}"${attrs ? ` ${attrs}` : ""} aria-invalid="${error ? "true" : "false"}">${opts}</select>
    ${error ? `<div class="ferr" role="alert">${esc(error)}</div>` : ""}</div>`;
}

export function entityField({ name, label, value = "", domains = ["sensor"], error = "", listId = "", attrs = "" }) {
  const list = listId || `hz-ent-${domains.join("-")}`;
  return `<div class="field${error ? " invalid" : ""}">${fieldLabel(name, label)}
    <input id="${esc(name)}" name="${esc(name)}" type="text" value="${esc(value ?? "")}" placeholder="entity.id" list="${esc(list)}" spellcheck="false" autocomplete="off" aria-invalid="${error ? "true" : "false"}"${attrs ? ` ${attrs}` : ""}>
    ${error ? `<div class="ferr" role="alert">${esc(error)}</div>` : ""}</div>`;
}

export function entityDatalists(ui) {
  const states = (ui && ui.hass && ui.hass.states) || {};
  const domains = [...new Set(Object.keys(states).map((id) => id.split(".")[0]))];
  return domains
    .map((domain) => {
      const ids = Object.keys(states)
        .filter((id) => id.startsWith(`${domain}.`))
        .sort()
        .slice(0, 800);
      return `<datalist id="hz-ent-${esc(domain)}">${ids.map((id) => `<option value="${esc(id)}"></option>`).join("")}</datalist>`;
    })
    .join("");
}

export function table({ cols, rows, emptyText = "", cls = "" }) {
  if (!rows.length) return empty(emptyText);
  const head = cols.map((col) => `<th${col.cls ? ` class="${col.cls}"` : ""}>${esc(typeof col === "string" ? col : col.label)}</th>`).join("");
  const body = rows
    .map((row) => {
      const cells = row.map((cell, index) => `<td data-label="${esc(typeof cols[index] === "string" ? cols[index] : cols[index].label)}">${cell}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<div class="tablewrap${cls ? ` ${cls}` : ""}"><table class="rtable"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function detailRow(label, value) {
  return `<div class="detail"><span class="dl">${esc(label)}</span><span class="dv">${value}</span></div>`;
}

export function progress(percent) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span style="width:${value}%"></span></div>`;
}
