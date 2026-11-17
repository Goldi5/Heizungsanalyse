// Die eine Karte, die je Ansicht ein ganzes Dashboard-Blatt füllt.
import { HA_VERSION } from "./version.js";
import { setLang, t } from "./i18n.js";
import { esc } from "./logic.js";
import { STYLES } from "./styles.js";
import { invalidate, loadSummary } from "./data.js";
import { VIEWS, header, renderView } from "./views.js";

export class HeizungsanalyseCard extends HTMLElement {
  setConfig(config) {
    this._config = { view: "anlage", ...(config || {}) };
    if (!VIEWS.includes(this._config.view)) this._config.view = "anlage";
    this._ui = { help: null, range: 90, form: false, widths: {}, logCat: "", logLevel: "", logQ: "", logHours: 168, logOpen: null, cfgMsg: null, invForm: false };
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
    }
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    setLang(hass);
    if (first) this._load();
    else if (this._data && this._config.view === "raeume") this._liveChanged() && this._render();
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
      this._cfgData = await this._hass.callWS({ type: "heizungsanalyse/config" });
      this._cfgError = null;
    } catch (e) {
      this._cfgError = e && (e.message || e.code) ? e.message || e.code : String(e);
      this._cfgData = null;
      this._reportTrace("config failed: " + this._cfgError);
    }
    this._render();
  }

  async _saveConfig() {
    if (!this._hass || !this._cfgData) return;
    const root = this.shadowRoot;
    const data = { ...this._cfgData.data };
    const options = { ...this._cfgData.options };
    root.querySelectorAll("[data-cfg]").forEach((el) => {
      const group = el.dataset.cfg;
      const key = el.dataset.key;
      const val = el.value.trim();
      if (group === "data") { if (val) data[key] = val; else delete data[key]; }
      else { if (val) options[key] = val; else delete options[key]; }
    });
    root.querySelectorAll("[data-cfgjson]").forEach((el) => {
      const key = el.dataset.cfgjson;
      const raw = el.value.trim();
      try {
        const parsed = raw ? JSON.parse(raw) : (key === "thresholds" ? {} : []);
        options[key] = parsed;
      } catch (e) {
        this._ui.cfgMsg = t("JSON-Fehler: {e}", { e: e.message || e });
        this._render();
        throw e;
      }
    });
    try {
      await this._hass.callWS({ type: "heizungsanalyse/config/save", data, options });
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
      if (st) out[r.climate_entity] = { current: st.attributes.current_temperature, target: st.attributes.temperature };
    }
    return out;
  }
  _liveChanged() {
    const key = JSON.stringify(this._live());
    if (key === this._liveKey) return false;
    this._liveKey = key;
    return true;
  }

  _render(fromMeasure = false) {
    if (this._error) return this._paint(`<div class="c">${esc(t("Fehler: {e}", { e: this._error }))}</div>`);
    const d = this._data;
    if (!d) return;
    if (!d.configured) return this._paint(`<div class="c empty">${esc(t("Die Heizungsanalyse ist noch nicht eingerichtet."))}</div>`);
    const view = this._config.view;
    let data = d;
    if (view === "protokoll") data = { ...d, diag: this._diag, log: { entries: this._log }, logError: this._logError };
    if (view === "einstellungen") data = { ...d, config: this._cfgData, configError: this._cfgError, suggestion: this._cfgSuggestion };
    this._paint(`${header(d, view)}${renderView(view, data, this._ui, this._live())}`);
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
    else if (el.dataset.act === "inv-open") this._ui.invForm = true;
    else if (el.dataset.act === "inv-close") this._ui.invForm = false;
    this._render();
  }

  _input(e) {
    const el = e.target;
    if (!el || !el.matches || !el.matches("[data-log-search]")) return;
    this._ui.logQ = el.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this._loadLog(true), 250);
  }

  async _submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (e.target.dataset.form === "inventory") {
      const section = data.section;
      const object = (data.object || "").trim();
      if (!object) { this._flash(t("Objekt fehlt")); return; }
      const full = object.includes(".") ? object : `${section}.${object}`;
      let values = {};
      try { values = data.values ? JSON.parse(data.values) : {}; } catch (err) { this._flash(t("JSON-Fehler: {e}", { e: err.message || err })); return; }
      try {
        await this._hass.callService("heizungsanalyse", "update_inventory", { object: full, values, note: data.note || undefined });
        this._ui.invForm = false;
        invalidate();
        await this._load(true);
        this._flash(t("Gespeichert"));
      } catch (err) {
        this._flash(t("Fehler: {e}", { e: err.message || err }));
      }
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