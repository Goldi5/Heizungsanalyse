// Die eine Karte, die je Ansicht ein ganzes Dashboard-Blatt füllt.
import { setLang, t } from "./i18n.js";
import { esc } from "./logic.js";
import { STYLES } from "./styles.js";
import { invalidate, loadSummary } from "./data.js";
import { VIEWS, header, renderView } from "./views.js";

export class HeizungsanalyseCard extends HTMLElement {
  setConfig(config) {
    this._config = { view: "anlage", ...(config || {}) };
    if (!VIEWS.includes(this._config.view)) this._config.view = "anlage";
    this._ui = { help: null, range: 90, form: false, widths: {} };
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", (e) => this._click(e));
      this.shadowRoot.addEventListener("submit", (e) => this._submit(e));
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
    if (!this._data) this._paint(`<div class="c">${esc(t("Lade …"))}</div>`);
    try {
      this._data = await loadSummary(this._hass, { force });
      this._error = null;
    } catch (e) {
      this._error = e && (e.message || e.code) ? e.message || e.code : String(e);
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
    this._paint(`${header(d, view)}${renderView(view, d, this._ui, this._live())}`);
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

  _click(e) {
    const el = e.target.closest("[data-help],[data-range],[data-act]");
    if (!el) return;
    if (el.dataset.help) this._ui.help = this._ui.help === el.dataset.help ? null : el.dataset.help;
    else if (el.dataset.range) this._ui.range = Number(el.dataset.range);
    else if (el.dataset.act === "form-open") this._ui.form = true;
    else if (el.dataset.act === "form-close") this._ui.form = false;
    else if (el.dataset.act === "report") return void this._report();
    this._render();
  }

  async _submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
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
}
