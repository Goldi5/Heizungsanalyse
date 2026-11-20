// Dashboard-Strategie: baut alle Ansichten selbst - keine Entity-Namen von Hand.
import { setLang, t } from "./i18n.js";

const VIEW_DEFS = [
  { view: "anlage", title: "Übersicht", icon: "mdi:view-dashboard-outline" },
  { view: "effizienz", title: "Effizienz", icon: "mdi:chart-bell-curve-cumulative" },
  { view: "betrieb", title: "Betrieb", icon: "mdi:chart-timeline" },
  { view: "raeume", title: "Räume", icon: "mdi:home-thermometer" },
  { view: "schema", title: "Hydraulik", icon: "mdi:pipe" },
  { view: "vergleich", title: "Änderungen", icon: "mdi:compare-horizontal" },
  { view: "inventar", title: "Geräte", icon: "mdi:devices" },
  { view: "protokoll", title: "System", icon: "mdi:heart-pulse" },
];

export function buildDashboard(config = {}) {
  return {
    title: config.title || t("Heizungsanalyse"),
    views: VIEW_DEFS.map((v) => ({
      title: t(v.title),
      path: v.view,
      icon: v.icon,
      type: "panel",
      cards: [{ type: "custom:heizungsanalyse-card", view: v.view }],
    })),
  };
}

const Base = typeof HTMLElement === "undefined" ? class {} : HTMLElement;

export class HeizungsanalyseDashboardStrategy extends Base {
  static async generate(config, hass) {
    setLang(hass);
    return buildDashboard(config);
  }
}
