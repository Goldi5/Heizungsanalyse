// Die eine Karte, die je Ansicht ein ganzes Dashboard-Blatt füllt.
import { HA_VERSION } from "./version.js";
import { setLang, t } from "./i18n.js";
import { esc } from "./logic.js";
import { STYLES } from "./styles.js";
import { invalidate, loadSummary } from "./data.js";
import { objectKey, sectionFields } from "./inventory.js";
import { VIEWS, header, renderView } from "./views.js";
import { liveValues } from "./views8.js";

export class HeizungsanalyseCard extends HTMLElement {
  setConfig(config) {
    this._config = { view: "anlage", ...(config || {}) };
    if (this._config.view === "einstellungen") this._config.view = "protokoll"; // Einstellungen: nur noch unter Konfigurieren
    if (!VIEWS.includes(this._config.view)) this._config.view = "anlage";
    this._ui = {
      help: null,
      range: 90,
      form: false,
      widths: {},
      logCat: "",
      logLevel: "",
      logQ: "",
      logHours: 168,
      logOpen: null,
      cfgMsg: null,
      cfgErrors: {},
      invForm: null,
      invSaved: false,
      chgObject: "heizkurve",
      chgField: "",
      hass: null,
    };
    this._log = [];
    this._cfgData = null;
    this._cfgSuggestion = null;
    this._diag = null;
    this._logError = null;
    this._diagError = null;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", (e) => this._click(e));
      this.shadowRoot.addEventListener("submit", (e) => this._submit(e));
      this.shadowRoot.addEventListener("input", (e) => this._input(e));
      this.shadowRoot.addEventListener("change", (e) => this._change(e));
    }
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    setLang(hass);
    if (first) this._load();
    else if (this._data && ["raeume", "schema", "anlage"].includes(this._config.view)) this._liveChanged() && this._render();
  }

  getCardSize() { return 12; }
  static getStubConfig() { return { view: "anlage" }; }

  connectedCallback() {
    this._timer = setInterval(() => this._load(), 5 * 60 * 1000 + 5000);
    this._logTimer = setInterval(() => {
      if (this._config.view === "protokoll" && document.visibilityState !== "hidden") this._loadLog(true);
    }, 30 * 1000);
    this._onError = (event) => this._reportTrace("Darstellungsfehler: " + ((event && event.message) || "unbekannt"));
    this._onReject = (event) => {
      const reason = event && event.reason;
      this._reportTrace("Promise-Fehler: " + ((reason && (reason.message || reason.code)) || String(reason || "unbekannt")));
    };
    window.addEventListener("error", this._onError);
    window.addEventListener("unhandledrejection", this._onReject);
    if (!this._ro && window.ResizeObserver) {
      this._ro = new ResizeObserver(() => {
        clearTimeout(this._roT);
        this._roT = setTimeout(() => this._measure(), 120);
      });
      this._ro.observe(this);
    }
  }
  disconnectedCallback() {
    clearInterval(this._timer);
    clearInterval(this._logTimer);
    if (this._onError) window.removeEventListener("error", this._onError);
    if (this._onReject) window.removeEventListener("unhandledrejection", this._onReject);
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }

  // Diagramme in echter Breite zeichnen, damit die Schrift überall gleich groß bleibt
  _measure() {
    if (!this.shadowRoot || !this._data) return;
    let changed = false;
    this.shadowRoot.querySelectorAll(".cbox[data-cid]").forEach((el) => {
      const w = Math.round(el.clientWidth);
      if (w > 0 && Math.abs((this._ui.widths[el.dataset.cid] || 0) - w) > 6) {
        this._ui.widths[el.dataset.cid] = w;
        changed = true;
      }
    });
    if (changed) this._render(true);
  }

  async _load(force = false) {
    if (!this._hass) return;
    if (!this._data) this._paint(`<div class="c skeleton"><div class="sk sk-title"></div><div class="sk sk-line"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div>`);
    try {
      this._data = await loadSummary(this._hass, { force });
      this._error = null;
    } catch (e) {
      this._error = e && (e.message || e.code) ? e.message || e.code : String(e);
      this._reportTrace("summary failed: " + this._error);
    }
    if (this._config.view === "einstellungen") {
      await this._loadConfig();
      await this._loadSuggestion();
      return;
    }
    if (this._config.view === "protokoll") {
      await this._loadDiag();
      await this._loadLog(force);
      return;
    }
    this._render();
  }

  async _loadDiag() {
    if (!this._hass) return;
    try {
      this._diag = await this._hass.callWS({ type: "heizungsanalyse/status" });
      this._diagError = null;
    } catch (e) {
      this._diagError = e && (e.message || e.code) ? e.message || e.code : String(e);
      this._diag = null;
      this._reportTrace("status failed: " + this._diagError);
    }
  }

  async _loadLog(force = false) {
    if (!this._hass) return;
    const since = new Date(Date.now() - (this._ui.logHours || 168) * 3600 * 1000).toISOString();
    const payload = { type: "heizungsanalyse/log", limit: 500, since };
    if (this._ui.logCat) payload.cat = this._ui.logCat;
    if (this._ui.logLevel) payload.level = this._ui.logLevel;
    if (this._ui.logQ) payload.q = this._ui.logQ;
    try {
      const result = await this._hass.callWS(payload);
      this._log = (result && result.entries) || [];
      this._logError = null;
    } catch (e) {
      this._logError = e && (e.message || e.code) ? e.message || e.code : String(e);
      this._log = [];
      this._reportTrace("log failed: " + this._logError);
    }
    if (!force || this._config.view === "protokoll") this._render();
  }

  async _loadSuggestion() {
    if (!this._hass) return;
    try {
      const res = await this._hass.callWS({ type: "heizungsanalyse/suggest_curve" });
      this._cfgSuggestion = res && res.suggestion ? res.suggestion : null;
    } catch (e) {
      this._cfgSuggestion = null;
    }
    this._render();
  }

  async _loadConfig() {
    if (!this._hass) return;
    try {
      const res = await this._hass.callWS({ type: "heizungsanalyse/config" });
      res.options = res.options || {};
      res.options.circuits = res.circuits || res.options.circuits || [];
      res.options.rooms = res.rooms || res.options.rooms || [];
      res.options.thresholds = res.thresholds || res.options.thresholds || {};
      this._cfgData = res;
      this._cfgOriginal = JSON.parse(JSON.stringify({ data: res.data || {}, options: res.options || {} }));
      this._cfgError = null;
    } catch (e) {
      this._cfgError = e && (e.message || e.code) ? e.message || e.code : String(e);
      this._cfgData = null;
      this._reportTrace("config failed: " + this._cfgError);
    }
    this._render();
  }

  _collectConfig() {
    const cfg = this._cfgData;
    if (!cfg || !this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelectorAll("[data-cfg]").forEach((el) => {
      const target = el.dataset.cfg === "data" ? cfg.data : cfg.options;
      const value = el.value.trim();
      if (value !== "") target[el.dataset.key] = value;
      else delete target[el.dataset.key];
    });
    root.querySelectorAll("[data-thr]").forEach((el) => {
      cfg.options.thresholds = { ...(cfg.options.thresholds || {}) };
      if (el.value !== "") cfg.options.thresholds[el.dataset.thr] = el.value;
      else delete cfg.options.thresholds[el.dataset.thr];
    });
    root.querySelectorAll("[data-arr]").forEach((el) => {
      const list = cfg.options[el.dataset.arr] || [];
      const item = list[Number(el.dataset.idx)];
      if (item) item[el.dataset.key] = el.value.trim();
    });
  }

  _nextId(prefix, list) {
    const used = new Set((list || []).map((item) => item.id));
    let index = 1;
    while (used.has(`${prefix}${index}`)) index += 1;
    return `${prefix}${index}`;
  }

  _validateConfigDraft() {
    const cfg = this._cfgData;
    const errors = {};
    if (!cfg) return errors;
    const states = (this._hass && this._hass.states) || {};
    const previous = this._cfgOriginal || {};
    const previousData = previous.data || {};
    const previousOptions = previous.options || {};
    for (const spec of (cfg.schema && cfg.schema.sources) || []) {
      const target = spec.scope === "data" ? cfg.data : cfg.options;
      const value = String((target || {})[spec.key] || "").trim();
      const was = String((spec.scope === "data" ? previousData : previousOptions)[spec.key] || "").trim();
      if (!value) {
        if (spec.required && !was) errors[spec.key] = "required";
        continue;
      }
      if (value === was) continue;
      const state = states[value];
      if (!state) {
        errors[spec.key] = "not_found";
        continue;
      }
      const unit = state.attributes && state.attributes.unit_of_measurement;
      if (spec.units && spec.units.length && unit && !spec.units.includes(unit)) errors[spec.key] = "unit";
    }
    const circuits = (cfg.options && cfg.options.circuits) || [];
    const circuitIds = new Set();
    circuits.forEach((circuit, index) => {
      const id = String(circuit.id || "").trim();
      if (!id) errors[`circuits.${index}.id`] = "required";
      else if (circuitIds.has(id)) errors[`circuits.${index}.id`] = "duplicate";
      else circuitIds.add(id);
      if (!String(circuit.name || "").trim()) errors[`circuits.${index}.name`] = "required";
      if (!String(circuit.type || "").trim()) errors[`circuits.${index}.type`] = "required";
    });
    const rooms = (cfg.options && cfg.options.rooms) || [];
    const roomIds = new Set();
    rooms.forEach((room, index) => {
      const id = String(room.id || "").trim();
      if (!id) errors[`rooms.${index}.id`] = "required";
      else if (roomIds.has(id)) errors[`rooms.${index}.id`] = "duplicate";
      else roomIds.add(id);
      if (!String(room.name || "").trim()) errors[`rooms.${index}.name`] = "required";
      if (!String(room.circuit || "").trim()) errors[`rooms.${index}.circuit`] = "required";
    });
    const thresholds = (cfg.options && cfg.options.thresholds) || {};
    for (const spec of (cfg.schema && cfg.schema.thresholds) || []) {
      const raw = thresholds[spec.key];
      if (raw == null || raw === "") continue;
      const number = Number(String(raw).replace(",", "."));
      if (!Number.isFinite(number)) errors[`thresholds.${spec.key}`] = "number";
      else if (number < spec.min || number > spec.max) errors[`thresholds.${spec.key}`] = "range";
    }
    return errors;
  }

  async _saveConfig() {
    if (!this._hass || !this._cfgData) return;
    this._collectConfig();
    const draftErrors = this._validateConfigDraft();
    if (Object.keys(draftErrors).length) {
      this._ui.cfgErrors = draftErrors;
      this._ui.cfgMsg = t("{n} Felder prüfen.", { n: Object.keys(draftErrors).length });
      this._render();
      return;
    }
    this._ui.cfgErrors = {};
    try {
      const result = await this._hass.callWS({
        type: "heizungsanalyse/config/save",
        data: this._cfgData.data,
        options: this._cfgData.options,
      });
      if (result && result.ok === false) {
        this._ui.cfgErrors = result.errors || {};
        this._ui.cfgMsg = t("{n} Felder prüfen.", { n: Object.keys(this._ui.cfgErrors).length });
        this._render();
        return;
      }
      this._ui.cfgMsg = t("Gespeichert");
      invalidate();
      setTimeout(() => this._load(true), 1500);
    } catch (e) {
      this._ui.cfgMsg = t("Fehler: {e}", { e: e.message || e });
      this._reportTrace("config save failed: " + (e.message || e));
    }
    this._render();
  }

  _live() {
    const out = {};
    for (const r of (this._data && this._data.rooms) || []) {
      const st = r.climate_entity && this._hass.states[r.climate_entity];
      if (!st) continue;
      const a = st.attributes;
      // Raumklima: echter Raumfühler, wirksames Soll (im Beobachtungsmodus die Komforttemperatur), Ventil
      const target = a.temperature ?? a.effective_target ?? (a.monitor ? a.comfort_temperature : undefined);
      out[r.climate_entity] = { current: a.current_temperature, target, valve: a.valve_position ?? null };
    }
    return out;
  }
  _liveChanged() {
    // Fließbild und Übersicht höchstens alle 10 Sekunden neu zeichnen
    const now = Date.now();
    if (this._liveAt && now - this._liveAt < 10000) return false;
    this._liveAt = now;
    const key = JSON.stringify([this._live(), liveValues(this._data, this._hass.states)]);
    if (key === this._liveKey) return false;
    this._liveKey = key;
    return true;
  }

  _render(fromMeasure = false) {
    if (this._error) return this._paint(`<div class="c">${esc(t("Fehler: {e}", { e: this._error }))}</div>`);
    const d = this._data;
    if (!d) return;
    if (!d.configured) {
      // Nach einem Neuladen der Integration nach kurzer Zeit erneut fragen
      if (!this._retry) this._retry = setTimeout(() => ((this._retry = null), this._load(true)), 15000);
      return this._paint(`<div class="c empty">${esc(t("Die Heizungsanalyse ist noch nicht eingerichtet."))}</div>`);
    }
    const view = this._config.view;
    this._ui.hass = this._hass;
    let data = d;
    if (view === "protokoll") data = { ...d, diag: this._diag, log: { entries: this._log }, logError: this._logError };
    if (view === "einstellungen") data = { ...d, config: this._cfgData, configError: this._cfgError, suggestion: this._cfgSuggestion };
    this._paint(`${header(d, view)}${renderView(view, data, this._ui, this._live(), this._hass ? this._hass.states : {})}`);
    if (!fromMeasure) requestAnimationFrame(() => this._measure());
  }

  _paint(html) {
    const y = window.scrollY;
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="wrap">${html}</div>${this._flashText ? `<div class="flash">${esc(this._flashText)}</div>` : ""}`;
    if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
  }

  _flash(text) {
    this._flashText = text;
    this._render();
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => { this._flashText = null; this._render(); }, 2500);
  }

  _reportTrace(message) {
    if (!this._hass || !message) return;
    const now = Date.now();
    if (now - (this._traceAt || 0) < 60 * 1000) return;
    this._traceAt = now;
    this._hass.callWS({ type: "heizungsanalyse/trace", message: String(message).slice(0, 500), version: HA_VERSION, ua: navigator.userAgent }).catch(() => {});
  }

  _click(e) {
    const el = e.target.closest("[data-help],[data-range],[data-act],[data-log-cat],[data-log-level],[data-log-range],[data-log-open],[data-nav]");
    if (!el) return;
    if (el.dataset.nav) { window.history.pushState(null, "", `/heizungs-analyse/${el.dataset.nav}`); window.dispatchEvent(new CustomEvent("location-changed")); return; }
    if (el.dataset.help) this._ui.help = this._ui.help === el.dataset.help ? null : el.dataset.help;
    else if (el.dataset.range) this._ui.range = Number(el.dataset.range);
    else if (el.dataset.logCat !== undefined) { this._ui.logCat = this._ui.logCat === el.dataset.logCat && el.dataset.logCat ? "" : el.dataset.logCat; this._loadLog(true); return; }
    else if (el.dataset.logLevel !== undefined) { this._ui.logLevel = this._ui.logLevel === el.dataset.logLevel && el.dataset.logLevel ? "" : el.dataset.logLevel; this._loadLog(true); return; }
    else if (el.dataset.logRange) { this._ui.logHours = Number(el.dataset.logRange); this._loadLog(true); return; }
    else if (el.dataset.logOpen) { const id = el.dataset.logOpen; this._ui.logOpen = this._ui.logOpen === id ? null : id; }
    else if (el.dataset.act === "form-open") this._ui.form = true;
    else if (el.dataset.act === "form-close") this._ui.form = false;
    else if (el.dataset.act === "report") return void this._report();
    else if (el.dataset.act === "log-download") return void this._download();
    else if (el.dataset.act === "log-copy") return void this._copy();
    else if (el.dataset.act === "log-refresh") return void this._refresh();
    else if (el.dataset.act === "cfg-save") return void this._saveConfig();
    else if (el.dataset.act === "cfg-circ-add") {
      this._collectConfig();
      const list = this._cfgData.options.circuits;
      list.push({ id: this._nextId("hk", list), name: "", type: "radiators" });
      this._render();
      return;
    } else if (el.dataset.act === "cfg-circ-del") {
      this._collectConfig();
      this._cfgData.options.circuits.splice(Number(el.dataset.idx), 1);
      this._render();
      return;
    } else if (el.dataset.act === "cfg-room-add") {
      this._collectConfig();
      const list = this._cfgData.options.rooms;
      const circuits = this._cfgData.options.circuits || [];
      list.push({ id: this._nextId("raum", list), name: "", room_type: "", circuit: circuits[0] ? circuits[0].id : "" });
      this._render();
      return;
    } else if (el.dataset.act === "cfg-room-del") {
      this._collectConfig();
      this._cfgData.options.rooms.splice(Number(el.dataset.idx), 1);
      this._render();
      return;
    } else if (el.dataset.act === "cfg-thr-reset") {
      this._collectConfig();
      this._cfgData.options.thresholds = {};
      this._render();
      return;
    } else if (el.dataset.act === "inv-add") {
      this._ui.invForm = this._inventoryForm(el.dataset.section);
      this._ui.invSaved = false;
    } else if (el.dataset.act === "inv-edit") {
      const section = el.dataset.section;
      this._ui.invForm = this._inventoryForm(section, el.dataset.object);
      this._ui.invSaved = false;
    } else if (el.dataset.act === "inv-del") {
      if (!window.confirm(t("Objekt wirklich löschen?"))) return;
      this._hass.callWS({ type: "heizungsanalyse/inventory/remove", object: el.dataset.object })
        .then(async () => { invalidate(); await this._load(true); this._flash(t("Gelöscht")); })
        .catch((err) => this._flash(t("Fehler: {e}", { e: err.message || err })));
      return;
    } else if (el.dataset.act === "inv-prefill") return void this._inventoryPrefill();
    else if (el.dataset.act === "inv-export") return void this._inventoryExport();
    else if (el.dataset.act === "inv-import") return void this._inventoryImport();
    else if (el.dataset.act === "inv-close") { this._ui.invForm = null; this._ui.invSaved = false; }
    else if (el.dataset.act && el.dataset.act.startsWith("ctrl-")) return void this._ctrl(el);
    else if (el.dataset.act === "goto-vergleich") {
      window.history.pushState(null, "", "/heizungs-analyse/vergleich");
      window.dispatchEvent(new CustomEvent("location-changed"));
      return;
    }
    this._render();
  }

  _input(e) {
    const el = e.target;
    if (!el || !el.matches || !el.matches("[data-log-search]")) return;
    this._ui.logQ = el.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this._loadLog(true), 250);
  }

  _ctrlItem(key) {
    return ((this._data && this._data.controls && this._data.controls.items) || []).find((c) => c.key === key);
  }

  async _ctrl(el) {
    const ui = (this._ui.ctrl = this._ui.ctrl || { pending: {} });
    const act = el.dataset.act;
    const key = el.dataset.key;
    ui.msg = null;
    ui.err = false;
    if (act === "ctrl-step") {
      const c = this._ctrlItem(key);
      if (!c) return;
      const cur = ui.pending[key] !== undefined ? ui.pending[key] : c.value;
      const next = Math.round((Number(cur) + Number(el.dataset.dir) * c.step) / c.step) * c.step;
      const v = Math.min(c.max, Math.max(c.min, Number(next.toFixed(2))));
      if (v === c.value) delete ui.pending[key];
      else ui.pending[key] = v;
      if (ui.confirm === key) ui.confirm = null;
    } else if (act === "ctrl-reset") {
      delete ui.pending[key];
      if (ui.confirm === key) ui.confirm = null;
    } else if (act === "ctrl-ask") ui.confirm = key;
    else if (act === "ctrl-cancel") {
      ui.confirm = null;
      ui.undoConfirm = null;
    } else if (act === "ctrl-undo-ask") ui.undoConfirm = el.dataset.id;
    else if (act === "ctrl-apply" || act === "ctrl-undo") {
      ui.busy = true;
      this._render();
      try {
        if (act === "ctrl-apply") {
          const res = await this._hass.callWS({ type: "heizungsanalyse/control/set", key, value: ui.pending[key], confirm: true });
          delete ui.pending[key];
          ui.msg = res && res.unchanged ? t("Der Regler hatte diesen Wert schon.") : t("Gespeichert – der Regler übernimmt den Wert in den nächsten Minuten.");
        } else {
          await this._hass.callWS({ type: "heizungsanalyse/control/undo", change: el.dataset.id });
          ui.msg = t("Zurückgesetzt.");
        }
      } catch (e) {
        ui.err = true;
        ui.msg = t("Fehler: {e}", { e: e.message || e.code || e });
      }
      ui.busy = false;
      ui.confirm = null;
      ui.undoConfirm = null;
      invalidate();
      setTimeout(() => this._load(true), 2500);
    }
    this._render();
  }

  _change(e) {
    const el = e.target;
    if (!el || !el.dataset) return;
    if (el.dataset.ctrlSelect) {
      const ui = (this._ui.ctrl = this._ui.ctrl || { pending: {} });
      const c = this._ctrlItem(el.dataset.ctrlSelect);
      if (!c) return;
      if (el.value === c.value) delete ui.pending[c.key];
      else ui.pending[c.key] = el.value;
      this._render();
      return;
    }
    if (el.dataset.catalog) {
      const selected = el.selectedOptions && el.selectedOptions[0];
      if (!selected) return;
      const form = el.closest("form");
      let fields = {};
      try {
        fields = JSON.parse(selected.dataset.fields || "{}");
      } catch (err) {
        fields = {};
      }
      for (const [key, value] of Object.entries(fields)) {
        const input = form && form.querySelector(`[name="f_${key}"]`);
        if (input) input.value = value == null ? "" : String(value);
      }
      const note = form && form.querySelector("[data-cat-note]");
      if (note) note.textContent = selected.dataset.note || "";
      return;
    }
    if (!el.dataset.chg) return;
    if (el.dataset.chg === "object") {
      this._ui.chgObject = el.value;
      this._ui.chgField = "";
      this._render();
    } else if (el.dataset.chg === "field") {
      this._ui.chgField = el.value;
      this._render();
    }
  }

  _inventoryForm(section, object = null) {
    const data = (this._data.inventory || {})[section] || {};
    const key = object && object.includes(".") ? object.split(".").slice(1).join(".") : "";
    const record = object ? (section === "hydraulics" ? data : data[key] || {}) : {};
    return {
      section,
      object,
      selection: object && object.includes(".") ? object.split(".").slice(1).join(".") : "",
      values: { ...record },
      note: "",
      errors: {},
    };
  }

  async _inventorySave(form, values, note) {
    const section = form.section;
    const object = form.object || objectKey(section, form.selection);
    if (!form.object && section !== "hydraulics" && !form.selection) {
      form.errors = { selection: "required" };
      this._render();
      return;
    }
    try {
      const result = await this._hass.callWS({ type: "heizungsanalyse/inventory/save", object, values, note: note || undefined });
      if (result && result.ok === false) {
        form.errors = result.errors || {};
        form.message = t("Bitte die markierten Felder prüfen.");
        this._render();
        return;
      }
      this._ui.invForm = null;
      this._ui.invSaved = true;
      invalidate();
      await this._load(true);
      this._flash(t("Gespeichert"));
    } catch (err) {
      form.message = t("Fehler: {e}", { e: err.message || err });
      this._render();
    }
  }

  async _inventoryPrefill() {
    if (typeof window !== "undefined" && typeof window.confirm === "function" && !window.confirm(t("Für alle Räume Thermostat und Heizkörper anlegen?"))) return;
    const rooms = (this._data && this._data.rooms) || [];
    let created = 0;
    for (const room of rooms) {
      if (!room.id) continue;
      for (const [section, values] of [
        ["thermostats", { room: room.id }],
        ["radiators", { room: room.id, circuit: room.circuit || "" }],
      ]) {
        const object = `${section}.${room.id}`;
        const existing = ((this._data.inventory || {})[section] || {})[room.id];
        if (existing) continue;
        const clean = Object.fromEntries(Object.entries(values).filter(([, value]) => value));
        try {
          await this._hass.callWS({ type: "heizungsanalyse/inventory/save", object, values: clean, note: t("Aus Räumen übernommen") });
          created += 1;
        } catch (err) {
          // Einzelne Räume dürfen übersprungen werden.
        }
      }
    }
    invalidate();
    await this._load(true);
    this._flash(t("{n} Einträge aus Räumen angelegt", { n: created }));
  }

  async _inventoryExport() {
    try {
      const result = await this._hass.callWS({ type: "heizungsanalyse/inventory/export" });
      const blob = new Blob([result.csv || ""], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = result.filename || "inventar.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      this._flash(t("CSV heruntergeladen"));
    } catch (err) {
      this._flash(t("Fehler: {e}", { e: err.message || err }));
    }
  }

  async _inventoryImport() {
    const area = this.shadowRoot.querySelector("[data-inv-csv]");
    const csv = area ? area.value.trim() : "";
    if (!csv) {
      this._flash(t("Bitte CSV einfügen."));
      return;
    }
    try {
      const result = await this._hass.callWS({ type: "heizungsanalyse/inventory/import", csv });
      invalidate();
      this._ui.invSaved = true;
      await this._load(true);
      const problems = Object.keys(result.errors || {}).length + (result.rows || []).length;
      this._flash(problems ? t("{n} übernommen, {e} Zeilen übersprungen", { n: result.imported || 0, e: problems }) : t("{n} übernommen", { n: result.imported || 0 }));
    } catch (err) {
      this._flash(t("Fehler: {e}", { e: err.message || err }));
    }
  }

  async _submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (e.target.dataset.form === "inventory") {
      const form = this._ui.invForm || { section: data.section, object: null };
      let values = form.values || {};
      for (const spec of sectionFields(this._data, form.section)) {
        const key = `f_${spec.key}`;
        if (data[key] !== undefined) values[spec.key] = data[key];
      }
      if (!form.object) values = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
      form.values = values;
      form.note = data.note || "";
      await this._inventorySave(form, values, form.note);
      return;
    }
    const payload = { object: data.object.trim(), field: data.field.trim() };
    for (const k of ["old_value", "new_value", "note"]) if (data[k] && data[k].trim()) payload[k] = data[k].trim();
    try {
      await this._hass.callService("heizungsanalyse", "log_change", payload);
      this._ui.form = false;
      invalidate();
      await this._load(true);
      this._flash(t("Gespeichert"));
    } catch (err) {
      this._flash(t("Fehler: {e}", { e: err.message || err }));
    }
  }

  async _report() {
    try {
      const res = await this._hass.callWS({
        type: "execute_script",
        sequence: [{ action: "heizungsanalyse.export_report", data: { format: "markdown" }, response_variable: "r" }, { stop: "done", response_variable: "r" }],
      });
      const body = res?.response?.report || "";
      const blob = new Blob([body], { type: "text/markdown" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `heizungsanalyse-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (err) {
      this._flash(t("Fehler: {e}", { e: err.message || err }));
    }
  }

  _download() {
    const body = JSON.stringify(this._diag || { error: this._diagError || "Diagnose nicht verfügbar" }, null, 2);
    const blob = new Blob([body], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `heizungsanalyse-diagnose-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    this._flash(t("Diagnose heruntergeladen"));
  }

  async _copy() {
    const text = (this._log || []).map((e) => `${e.ts} ${e.level.toUpperCase()} [${e.cat}] ${e.msg}`).join("\n");
    try {
      await navigator.clipboard.writeText(text || t("Keine Einträge"));
      this._flash(t("Kopiert"));
    } catch (err) {
      this._flash(t("Fehler: {e}", { e: err.message || err }));
    }
  }

  async _refresh() {
    try {
      await this._hass.callService("heizungsanalyse", "refresh");
      this._flash(t("Neu berechnet"));
      invalidate();
      setTimeout(() => this._load(true), 1500);
    } catch (err) {
      this._flash(t("Fehler: {e}", { e: err.message || err }));
    }
  }
}