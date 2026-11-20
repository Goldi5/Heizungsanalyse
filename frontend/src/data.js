// Ein gemeinsamer Abruf für alle Karten einer Seite; nach 5 Minuten neu.
import { getLang } from "./i18n.js";

const TTL = 5 * 60 * 1000;
let cache = null; // { at, promise, lang }
const listeners = new Set();

export function loadSummary(hass, { force = false } = {}) {
  const lang = getLang();
  const fresh = cache && Date.now() - cache.at < TTL && cache.lang === lang;
  if (!force && fresh) return cache.promise;
  const promise = hass.callWS({ type: "heizungsanalyse/summary", language: lang });
  cache = { at: Date.now(), promise, lang };
  promise
    .then((data) => {
      // Während die Integration nach dem Speichern neu lädt, kommt kurz „nicht eingerichtet“ –
      // das nicht fünf Minuten lang zwischenspeichern.
      if (!data || data.configured === false) cache = null;
      listeners.forEach((fn) => fn(data));
    })
    .catch(() => {
      cache = null;
    });
  return promise;
}

export function onSummary(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function invalidate() {
  cache = null;
}
