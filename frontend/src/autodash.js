// Legt das Dashboard einmalig selbst an - wie bei Raumklima.
// Nur für Admins, nur wenn die Integration es wünscht und es noch nicht existiert.
let running = false;

export async function ensureDashboard(hass) {
  if (running || !hass || !hass.user || !hass.user.is_admin) return null;
  running = true;
  try {
    const status = await hass.callWS({ type: "heizungsanalyse/dashboard/status" });
    if (!status || !status.wanted) return null;
    const path = status.url_path;
    const list = await hass.callWS({ type: "lovelace/dashboards/list" });
    const exists = (list || []).some((d) => d.url_path === path);
    if (!exists) {
      await hass.callWS({
        type: "lovelace/dashboards/create",
        url_path: path,
        title: status.title || "Heizungsanalyse",
        icon: status.icon || "mdi:heat-pump",
        show_in_sidebar: true,
        require_admin: false,
      });
      await hass.callWS({ type: "lovelace/config/save", url_path: path, config: { strategy: { type: "custom:heizungsanalyse" } } });
    }
    await hass.callWS({ type: "heizungsanalyse/dashboard/mark", url_path: path, created: !exists });
    return exists ? null : path;
  } catch (e) {
    return null; // Dashboard lässt sich jederzeit von Hand anlegen
  } finally {
    running = false;
  }
}

// hass-Objekt der laufenden Oberfläche finden (ohne eigene Karte auf der Seite)
export function findHass() {
  const ha = document.querySelector("home-assistant");
  return ha && ha.hass ? ha.hass : null;
}
