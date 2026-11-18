# Gestaltung und Bedienung

Stand 0.7.0. Diese Datei hält fest, wie die acht Tabs aufgebaut sind und
welche gemeinsamen Bausteine sie verwenden. Ziel ist eine ruhige, gleiche
Struktur auf allen Seiten – ohne dass jede Ansicht ihr eigenes Formular
erfindet.

## Bestandsaufnahme der Tabs

| Tab | Zweck | Aufbau |
|---|---|---|
| Anlage | Gesamturteil und die wichtigsten Kennzahlen | Urteil (Score) → KPI-Kacheln → Hinweise mit Beleg |
| Effizienz | COP, Strom/Wärme, Warmwasser | KPI-Kacheln → Diagramme → Details |
| Räume & Kreise | Raumtemperaturen, Abweichung, Pumpen | KPI-Kacheln → Raumliste und Kreise |
| Vorher / Nachher | Wirkung einer Änderung | Liste der Änderungen → Formular (Was/Einstellung) → COP-Verlauf |
| Inventar | Stammdaten der Anlage | Vollständigkeit → je Bereich eine Tabelle → Formular, CSV, Quellen |
| Protokoll | Ereignisse und Systemstatus | Statuskarten → Filter → Liste |
| Einstellungen | Quellen, Kreise, Räume, Schwellen | Quellen → Heizkreise → Räume → Schwellen → Heizkurve → Speichern |
| Schema | Schematische Übersicht | Wärmepumpe → Puffer → Kreise → Räume |

Jeder Tab beginnt mit demselben Kopf (Titel, Anlagenname, Aktualisierungszeit,
Version) und der Navigationsleiste. Danach folgt eine kurze Einordnung
(`.intro`), erst dann die Details. So ist die wichtigste Aussage immer oben.

## Bausteine

`frontend/src/components.js` liefert die gemeinsamen Teile:

- `head` / `card` – Kachel mit optionaler Hilfe („?“)
- `textField`, `selectField`, `entityField` – beschriftete Felder mit Einheit,
  Pflichtmarke und Feldfehler
- `table` – Tabelle, die auf schmalen Bildschirmen zu Karten wird
  (`data-label` je Zelle)
- `kpiTile` – Kennzahl-Kachel (Titel, Wert, Einheit, Diagramm, Fußzeile)
- `statusPill` – Status-Marke mit Ton (ok/warn/bad/mut)
- `banner`, `empty`, `progress`, `button`, `detailRow`
- `entityDatalists` – Vorschlagslisten aus den vorhandenen Entities

`entityField` ist ein Eingabefeld mit Vorschlagsliste (`<datalist>`, nach
Domain gefiltert); die passende Einheit wird beim Speichern geprüft. `ha-entity-picker` wird bewusst nicht verwendet:
Das Element erwartet seine Daten als Properties im Shadow-DOM der Karte, ein
Attribut allein reicht nicht; der Fallback ist deshalb der stabile Weg.

Formulare tragen `data-form="inventory"` bzw. `data-form="log"`; die Karte
liest die Werte und ruft die Websocket-Befehle auf. Es gibt kein
handgeschriebenes JSON mehr in der Oberfläche. CSV bleibt als Austauschformat
für viele Werte und ist eingeklappt.

## Abstände und Typografie

| Token | Wert | Verwendung |
|---|---|---|
| `--hz-gap` | 18 px | Raster zwischen Kacheln |
| `--hz-space-1` … `--hz-space-7` | 4, 6, 8, 12, 16, 18, 24 px | Abstandsskala |
| `--hz-text-xs` … `--hz-text-xl` | 0,72–1,35 rem | Schriftskala |
| `--hz-radius` | 24 px | Kacheln |
| `--hz-radius-sm` | 14 px | Felder, Hinweise, Listen |
| `.mt6` … `.mt12` | 6–12 px | Abstand über einer Zeile |
| Kacheltitel `.h` | 0,78 rem, Großbuchstaben | Abschnittsüberschrift |
| Fließtext | 0,85–0,9 rem | Beschreibungen |
| Zahlen | `font-variant-numeric: tabular-nums` | Kennzahlen, Tabellen |

Farben kommen aus den HA-Variablen (`--primary-text-color`,
`--card-background-color`, `--divider-color`) und den festen Akzenten
`--hz-ok`, `--hz-warn`, `--hz-bad`, `--hz-cool`, `--hz-heat`, `--hz-vio`.
Die Akzente sind an `raumklima-2` angeglichen (`#2ec4a6`, `#ffb020`,
`#ff4d6d`, `#4f9dff`), damit beide Karten nebeneinander stimmig wirken.
Dadurch funktionieren helles und dunkles Theme ohne Sonderfälle.

## Regeln

1. **Eine Aussage oben.** Urteil oder Vollständigkeit steht vor den Details.
2. **Keine Farbe allein.** Zustände tragen immer Text („im grünen Bereich“,
   „über der Schwelle“); Farbe verstärkt nur.
3. **Lesbare Beschriftungen.** Angezeigt wird der Name aus dem Schema
   („Voreinstellung“), nie der technische Schlüssel (`valve_preset`).
4. **Keine erfundenen Werte.** Leere Felder bleiben leer; Vorschläge sind als
   Vorschlag markiert.
5. **Mobile zuerst prüfen.** Unter 520 px werden Tabellen zu Karten,
   Bedienelemente sind mindestens 44 px hoch, die Navigation bricht um statt
   seitlich zu scrollen.
6. **Deutsch ist der Quelltext, Englisch vollständig.** Jeder neue Satz bekommt
   sofort eine Übersetzung in `i18n.js`; Umlaute sind Pflicht.
7. **Fokus sichtbar.** Eingaben und Schaltflächen haben einen sichtbaren
   Fokusring; Fehler stehen am Feld und zusätzlich als Hinweis oben.
8. **Vor dem Senden prüfen.** Einstellungen werden schon im Browser geprüft
   (Pflichtfeld, unbekannte Entity, Einheit, doppelte Kennung, Wertebereich);
   `config/save` prüft dieselben Regeln noch einmal verbindlich.
9. **Erklären, was fehlt.** Jeder unvollständige Inventarbereich nennt unter
   der Tabelle, wofür die fehlenden Angaben gebraucht werden.

## Prüfen

```bash
cd frontend && npm run check && npm test && npm run build
cd .. && .venv/bin/ruff check custom_components tests && .venv/bin/python -m pytest -q
```

Die Screenshots für den Pull Request entstehen mit Playwright aus den
Fixtures (`frontend/test/fixtures`) in hellem und dunklem Theme sowie Desktop
und Mobile. Sie liegen unter `docs/screenshots/0.7.0/`; lange Seiten sind auf
den ersten Bildschirm gekürzt.
