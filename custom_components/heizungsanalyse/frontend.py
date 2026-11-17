"""Kartendatei ausliefern und als Lovelace-Ressource eintragen.

Die Datei liegt in ``www/`` und wird mit ``no-store`` ausgeliefert, damit nach
einem Update keine alte Fassung im Browser-Cache hängt. Die URL trägt Version
und Inhalts-Hash. Ist Lovelace im YAML-Modus, wird die Datei als Extra-Modul
geladen.
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path

from aiohttp import web
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import CARD_URL, DASHBOARD_PATH, VERSION

_LOGGER = logging.getLogger(__name__)
CARD_FILE = Path(__file__).parent / "www" / "heizungsanalyse-card.js"


def _read_card() -> str:
    try:
        return CARD_FILE.read_text(encoding="utf-8")
    except OSError:
        return ""


def card_hash(body: str) -> str:
    return hashlib.sha256(body.encode("utf-8")).hexdigest()[:10]


class CardView(HomeAssistantView):
    """Liefert die Kartendatei (enthält keine Daten, deshalb ohne Anmeldung)."""

    url = CARD_URL
    name = "api:heizungsanalyse:card"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        body = await hass.async_add_executor_job(_read_card)
        if not body:
            return web.Response(status=404, text="heizungsanalyse-card.js fehlt")
        return web.Response(
            text=body,
            content_type="text/javascript",
            headers={"Cache-Control": "no-store, must-revalidate"},
        )


async def async_register_frontend(hass: HomeAssistant) -> None:
    """View registrieren und Ressource eintragen bzw. aktualisieren."""
    hass.http.register_view(CardView())
    body = await hass.async_add_executor_job(_read_card)
    url = f"{CARD_URL}?v={VERSION}-{card_hash(body)}"
    data = hass.data.get("lovelace")
    resources = getattr(data, "resources", None)
    if resources is None or getattr(data, "resource_mode", "storage") != "storage" or not hasattr(resources, "async_create_item"):
        add_extra_js_url(hass, url)
        return
    try:
        await resources.async_get_info()
        items = [item for item in resources.async_items() if str(item.get("url", "")).split("?")[0] == CARD_URL]
        if items:
            for item in items:
                if item.get("url") != url:
                    await resources.async_update_item(item["id"], {"res_type": "module", "url": url})
            return
        await resources.async_create_item({"res_type": "module", "url": url})
    except Exception as err:  # noqa: BLE001 - interne API, lieber Rückfall als Absturz
        _LOGGER.warning("Ressource konnte nicht eingetragen werden (%s) - nutze Extra-Modul", err)
        add_extra_js_url(hass, url)


async def log_dashboard_state(hass: HomeAssistant, log, entry) -> None:
    """Ressource und Dashboard-Stand einmalig protokollieren."""
    data = hass.data.get("lovelace")
    resources = getattr(data, "resources", None)
    storage_mode = resources is not None and getattr(data, "resource_mode", "storage") == "storage"
    items: list[dict] = []
    if storage_mode:
        try:
            await resources.async_get_info()
            items = list(resources.async_items())
        except Exception:  # noqa: BLE001 - interne API, dann eben ohne URL
            items = []
    matching = [item for item in items if str(item.get("url", "")).split("?")[0] == CARD_URL]
    body = await hass.async_add_executor_job(_read_card)
    url = matching[0].get("url") if matching else f"{CARD_URL}?v={VERSION}-{card_hash(body)}"
    mode = "storage" if storage_mode else "yaml"
    await log.async_add(
        "info",
        "dashboard",
        f"Karte als Ressource eingetragen ({mode}-Modus, {url})",
        key="dashboard.resource",
        params={"mode": mode, "url": url},
        details={"mode": mode, "url": url, "count": len(matching)},
    )

    runtime = getattr(entry, "runtime_data", None)
    if runtime is None:
        return
    state = await runtime.store.async_dashboard()
    if state.get("handled"):
        key = "dashboard.created" if state.get("created") else "dashboard.exists"
        message = (
            f"Dashboard {DASHBOARD_PATH} angelegt" if state.get("created") else f"Dashboard {DASHBOARD_PATH} bereits vorhanden"
        )
        await log.async_add(
            "info",
            "dashboard",
            message,
            key=key,
            params={"path": DASHBOARD_PATH},
            details=dict(state),
        )
