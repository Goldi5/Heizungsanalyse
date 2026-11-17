# Protokoll, Diagnose und Debug-Spur

Die Heizungsanalyse bleibt rein lesend. Einzige Schreibpfade im Betrieb sind
das eigene Ereignisprotokoll, die Debug-Spur und das Dashboard-Merkzeichen.
Kein Protokolleintrag schaltet ein Gerät.

## Ereignisprotokoll

Gespeichert im eigenen Speicher `.storage/heizungsanalyse.<entry_id>` im Feld
`log`. Höchstens **2000 Einträge** und **30 Tage**; ältere Einträge fallen
automatisch heraus. Gespeichert wird verzögert (zehn Sekunden nach dem letzten
Eintrag), nicht bei jeder Zeile.

Ein Eintrag enthält:

| Feld | Bedeutung |
|---|---|
| `ts` | Zeitpunkt in UTC |
| `level` | `info`, `warn` oder `error` |
| `cat` | Kategorie (siehe unten) |
| `msg` | fertiger deutscher Text |
| `key`, `params` | Schlüssel und Werte für die englische Darstellung |
| `details` | kleines Dictionary mit Belegen |

### Kategorien und Auslöser

| Kategorie | Wann |
|---|---|
| `start` | Integration geladen; als Trennlinie „— Neustart —“ |
| `update` | Coordinator-Lauf mit Dauer, Statistikzeilen je Quelle und Tagen mit Daten – nur bei Änderung oder jeder 12. Lauf |
| `source` | Quelle nicht verfügbar/„unbekannt“ oder zurück; keine Langzeitstatistik; Einheit oder `state_class` unpassend |
| `finding` | Hinweis neu, geändert oder erledigt – mit Beleg |
| `config` | Option geändert (Feld, alt → neu), Kreis oder Raum hinzugefügt/entfernt, Schwellen geändert |
| `inventory` | `update_inventory` und `log_change` |
| `dashboard` | Karte als Ressource eingetragen (URL mit Hash, Speicher-/YAML-Modus), Dashboard angelegt oder vorhanden |
| `frontend` | Fehler, die die Karte meldet |
| `error` | Ausnahme im Coordinator (Typ und Kurztext, kein Stacktrace) |

### Lesen

Websocket `heizungsanalyse/log` mit `since`, `level`, `cat`, `q` und `limit`.
Die Antwort ist neueste zuerst. Der Reiter „Protokoll“ nutzt genau diesen
Befehl, gruppiert nach Tagen und aktualisiert sich alle 30 Sekunden, solange
er sichtbar ist.

## Debug-Spur

Ein eigener Logging-Handler auf `custom_components.heizungsanalyse` sammelt
höchstens **3000 Zeilen** der letzten **12 Stunden**. Beim Start wird die Spur
aus dem Speicher geladen, beim Stoppen von Home Assistant gesichert. Sie ist
kein Ersatz für das HA-Log, sondern die kompakte Spur für die Fehlersuche im
Dashboard.

## Diagnose

Der Download unter *Einstellungen → Geräte & Dienste → Heizungsanalyse →
Diagnose* und der Websocket-Befehl `heizungsanalyse/diagnostics` liefern
denselben Inhalt:

- **Versionen:** Integration, Home Assistant und Karte (aus der
  Ressourcen-URL); eine Abweichung wird gekennzeichnet.
- **Konfiguration:** Pflicht- und Optionsquellen mit Entity-IDs, Kreise, Räume,
  Schwellen.
- **Quellen-Check je Entity:** Zustand, Einheit, `device_class`,
  `state_class`, `last_updated`, Tages- und Stundenzeilen (31 bzw. 7 Tage),
  erstes und letztes Datum, Format von `start` und vorhandene Statistiktypen
  (`change`, `state`, `mean`). Ergebnis: `ok`, `keine Statistik`,
  `unpassend` oder `nicht verfügbar` – mit einem Satz Handlungstipp.
- **Kennzahlen:** vollständige Zusammenfassung wie `heizungsanalyse/summary`,
  Tageswerte für 31 Tage, COP- und Kurven-Bins, Vorlauf-Stunden mit
  Filterangabe, Hinweise mit Beleg und Schwellen.
- **Räume und Kreise:** Stichprobenzahl, letzte Lesung (Ist/Soll/Zeit),
  Verwerfungsgründe (`no_climate`, `off`, `target_low`, `unknown`,
  `no_values`), Pumpen- und Mischer-Statistik.
- **Speicher:** Anzahl Roll-ups mit erstem und letztem Tag, Änderungsverlauf
  (letzte 50), Inventar, Dashboard-Merkzeichen.
- **Laufzeit:** letzter Lauf, Dauer, nächster Lauf, `last_update_success`,
  letzte Ausnahme.
- **Protokoll und Debug-Spur:** die letzten 48 Stunden bzw. 12 Stunden.

## Datenschutz

`async_redact_data` schwärzt alles, was nach Token, Passwort, Koordinate,
E-Mail oder Person aussieht. Raumnamen aus Freitext werden nicht in die Diagnose
übernommen; nur IDs, Entity-IDs und Messwerte. Ein Test prüft, dass
keine `latitude`, `longitude`, `email`, `token` und keine `person.`-IDs
enthalten sind.

## Grenzen

- Das Protokoll ist ein Verlauf, keine Datenbank: 2000 Einträge sind bei
 bei dauerhaft fehlender Quelle nach wenigen Tagen erreicht.
- Die Debug-Spur enthält nur die eigenen Ausgaben, keine fremden Logger.
- Die Diagnose kann bei vielen Quellen einige hundert Kilobyte groß werden;
  begrenzt wird sie durch die 48-Stunden-Fenster und 1000 Trace-Zeilen.