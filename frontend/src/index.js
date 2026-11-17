/*
 * Heizungsanalyse - Dashboard. Wird von der Integration automatisch geladen.
 *   strategy: { type: custom:heizungsanalyse }      (ganzes Dashboard)
 *   type: custom:heizungsanalyse-card, view: anlage  (eine Ansicht)
 */
import { HA_VERSION } from "./version.js";
import { HeizungsanalyseCard } from "./card.js";
import { HeizungsanalyseDashboardStrategy } from "./strategy.js";
import { ensureDashboard, findHass } from "./autodash.js";

if (!customElements.get("heizungsanalyse-card")) customElements.define("heizungsanalyse-card", HeizungsanalyseCard);
if (!customElements.get("ll-strategy-dashboard-heizungsanalyse")) {
  customElements.define("ll-strategy-dashboard-heizungsanalyse", HeizungsanalyseDashboardStrategy);
}

window.customCards = window.customCards || [];
if (!window.customCards.find((c) => c.type === "heizungsanalyse-card")) {
  window.customCards.push({ type: "heizungsanalyse-card", name: "Heizungsanalyse", description: "Anlage, Effizienz, Räume, Vorher/Nachher, Inventar", preview: false });
}

// In „Dashboard hinzufügen“ als eigene Vorlage anbieten (wie Raumklima)
window.customStrategies = window.customStrategies || [];
if (!window.customStrategies.find((x) => x.type === "heizungsanalyse")) {
  window.customStrategies.push({
    type: "heizungsanalyse",
    strategyType: "dashboard",
    name: "Heizungsanalyse",
    description: "Wärmepumpe: Kennzahlen, Hinweise, Räume, Vorher/Nachher, Protokoll – baut sich automatisch auf",
    documentationURL: "https://github.com/Goldi5/Heizungsanalyse",
  });
}

// Einmalig das Dashboard anlegen, sobald die Oberfläche bereit ist
(function autoCreate(tries = 0) {
  const hass = findHass();
  if (hass && hass.connection) {
    ensureDashboard(hass);
    return;
  }
  if (tries < 30) setTimeout(() => autoCreate(tries + 1), 2000);
})();

console.info(`%c HEIZUNGSANALYSE %c ${HA_VERSION} `, "background:#ff7a45;color:#fff;font-weight:700", "background:#121826;color:#fff");
