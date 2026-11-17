// Dashboard-Strategie: baut alle Ansichten selbst - keine Entity-Namen von Hand.
import { setLang, t } from "./i18n.js";

const VIEW_DEFS = [
  { view: "anlage", title: "Anlage", icon: "mdi:heat-pump" },
  { view: "effizienz", title: "Effizienz", icon: "mdi:chart-bell-curve-cumulative" },
  { view: "raeume", title: "Räume & Kreise", icon: "mdi:home-thermometer" },
  { view: "vergleich", title: "Vorher / Nachher", icon: "mdi:compare-horizontal" },
  { view: "inventar", title: "Inventar", icon: "mdi:clipboard-list-outline" },
  { view: "protokoll", title: "Protokoll", icon: "mdi:text-box-search-outline" },
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
