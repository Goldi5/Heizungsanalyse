## 0.7.0 – 2026-11-18

### Neu
- **Inventar ohne JSON**: Felder kommen aus dem Backend-Schema
  (`heizungsanalyse/inventory/schema`), Schlüssel werden aus Heizkreis oder
  Raum abgeleitet. Tabelle mit Bearbeiten/Löschen, Vorbelegung, Grund-Feld,
  Vollständigkeitsanzeige, „Aus Räumen übernehmen“ und Link zum Vergleich.
- **CSV-Austausch** für das Inventar (Export und Import mit Zeilen- und
  Feldfehlern) statt handgeschriebenem JSON.
- **Einstellungen ohne JSON**: Quellen mit Entity-Feldern, Heizkreise und
  Räume als Listen, Schwellen mit Einheit/Grenzen und Zurücksetzen.
  `config/save` liefert feldbezogene Fehler; unveränderte Werte blockieren
  das Speichern nicht.
- **Vorher/Nachher-Formular**: „Was“ und „Einstellung“ als Auswahl aus
  Inventar und Heizkurve, alter Wert vorbelegt.
- **Vorabprüfung im Browser**: Pflichtfelder, unbekannte Entities, Einheiten,
  doppelte Kennungen und Schwellenbereiche werden vor dem Speichern geprüft;
  die Fehler stehen direkt am Feld. „Aus Räumen übernehmen“ fragt vorher nach.
- **Vollständigkeitshinweise**: Jeder unvollständige Inventarbereich erklärt,
  wofür die fehlenden Angaben gebraucht werden.
- **Screenshots** aller acht Tabs in hell/dunkel und Desktop/Mobile unter
  `docs/screenshots/0.7.0/`.
- Neuer Dienst `remove_inventory_item`.
- `docs/design.md` mit Bestandsaufnahme und Gestaltungsregeln.

### Geändert
- Gemeinsame Bausteine (`components.js`): Kacheln, Formularfelder, Tabellen,
  Hinweise und Fortschritt; einheitliche Abstände und Typografie.
- Tabellen werden auf schmalen Bildschirmen zu Karten; Bedienelemente
  mindestens 44 px hoch; Navigation bricht auf Mobil um statt seitlich zu
  scrollen. Akzentfarben an `raumklima-2` angeglichen.
- Umlaute in sichtbaren Texten korrigiert (u. a. „Räume“, „lädt“,
  „Wärmepumpe“).

### Behoben
- `radiators` fehlte im leeren Inventar und wurde beim Laden nicht ergänzt.

## 0.7.0b2 – 2026-11-17 (Beta)

### Behoben
- **Navigation**: `hass.navigate` existiert im Karten-Kontext nicht – Wechsel
  jetzt über `history.pushState` + `location-changed`.
- **Protokoll**: Statusdaten über neuen `heizungsanalyse/status`-WS (kein
  Admin nötig); Diagnose bleibt Admin-Download.
- **Inventar**: Bereich `radiators` ergänzt.

### Neu
- **Inventar-Editor** im Inventar-Tab: Einträge für Pumpen, Thermostate,
  Hydraulik und Heizkörper direkt im Dashboard anlegen (JSON-Werte).

## 0.7.0b0 – 2026-11-17 (Beta)

### Neu
- **Dashboard-Navigation**: In-Card-Navigationsleiste mit Pills für alle
  Ansichten (Anlage, Effizienz, Räume, Vorher/Nachher, Inventar, Protokoll,
  Einstellungen, Schema); Wechsel ohne Umweg über HA-Tabs.
- **Loading-Skeleton** und einheitliche Navigation auf allen Ansichten.
- **Live-Refresh** auf allen Views (bisher nur Räume).

### Geändert
- Navigations-Pills, Skeleton-Animation, Mobile-Overflow-Scroll.

## 0.6.1 – 2026-11-17

### Neu
- **Heizkurvenvorschlag in den Einstellungen**: Median-Abweichung je
  Außentemperatur-Bin, geschätzter COP-Gewinn, Konfidenz, manuelle
  Anpassung von Offset und Steigung.
- **Dashboard-Upgrade (M21)**: Hero-Banner, Alert-Karten, größere KPIs,
  verbesserte Sparklines und Dark-Mode-Polish.

## 0.6.0 – 2026-11-17

### Neu
- **Heizkurvenvorschlag** (Service `suggest_heating_curve`, Finding F16):
  Offset/Steigung aus Vorlauf-Abweichung, geschätzter COP-Gewinn, Konfidenz.
- **Wunschtemperaturen** (Finding F17): Plausibilitätsprüfung pro Raum.
- **Fehleranalyse Live** (Findings F18 COP-Einbruch, F19 Vorlauf-Spitzen).
- **Jahresauswertung**: Heizgradtage, wetterbereinigter Jahres-COP, Kosten
  und CO₂ (Preis/CO₂-Faktor über Optionen), automatische Bewertung von
  Änderungen nach 7 Tagen (Verdict im Speicher + Protokoll).
- **Alerts**: Event `heizungsanalyse_alert` bei neuen Warnungen.
- **Einstellungsseite** und **Anlagenschema** im Dashboard (0.5.0).

## 0.5.0 – 2026-11-17

### Neu
- **Einstellungsseite** im Dashboard (Ansicht „Einstellungen“): Pflicht- und
  optionale Quellen, Heizkreise, Räume und Schwellen direkt im Browser
  ändern; Speichern lädt die Integration neu. Websocket `heizungsanalyse/config`
  (lesen) und `heizungsanalyse/config/save` (Admin).
- **Anlagenschema** (Ansicht „Schema“): Fließbild Wärmepumpe → Puffer →
  Heizkreise → Räume mit Live-Werten (COP, Vorlauf, Pumpenleerlauf,
  Ist/Soll, Abweichung).
- **Anlagenblatt** als Service `heizungsanalyse.export_plant_sheet`: Markdown
  mit Aufbau, Einstellungen, Kennzahlen, Inventar und Hinweisen – druckbar.
- **Hydraulischer Abgleich**: Inventar-Bereich `radiators` (Ventilpreset,
  Soll-/Ist-Durchfluss, Spreizung), Finding F15 (Rücklauftemperatur zu hoch),
  Schwelle `return_temp_max_c`.
- **Warmwasserbetrieb** als optionale Quelle (`dhw_operation_entity`): Stunden
  mit Warmwasser-Ladung werden aus Vorlauf-Abweichung und Puffer-Ladung
  herausgerechnet.
- **Aufheizzeit** korrigiert (keine 0-minütigen Scheinwerte nach Backfill).

### Aufräumen
- Veraltete Tags/Releases `v0.1.0`, `v0.2.0`, `v0.2.1` entfernt.

## 0.4.1 – 2026-11-17

### Neu
- **Warmwasserbetrieb als optionale Quelle** (`dhw_operation_entity`): binärer
  Sensor, der anzeigt, wann die Wärmepumpe Warmwasser lädt. Die Stunden mit
  Warmwasser-Ladung werden aus der Puffer-Ladung (Overshoot) und aus der
  Vorlauf-Abweichung herausgerechnet, damit die 50-°C-Ladung den Puffer nicht
  verfälscht.
- **Aufheizzeit korrigiert**: Scheinbare 0-minütige Aufheizungen aus dem
  nachgetragenen Verlauf werden nicht mehr als Messwert gezählt.

### Behoben
- `heating_up_times` ignoriert Aufheizversuche mit 0 Minuten Dauer (Rechen-
  fehler nach Neustart/Backfill).

## 0.4.0 – 2026-11-17

### Neu
- **Neue optionale Quellen** (Konfigurieren → Optionale Quellen):
  WP-Vorlauf, Volumenstrom, Leistung jetzt (W/kW), Warmwasser-Strom (kWh) und
  ein zweiter Laufzeit-Zähler. „Rücklauftemperatur“ ist jetzt ausdrücklich der
  Rücklauf der Wärmepumpe.
- **Spreizung** (WP-Vorlauf − WP-Rücklauf, nur Stunden mit laufendem
  Verdichter): Median, Tagesverlauf und Hinweis **F14**, wenn sie dauerhaft
  unter 3 K (Volumenstrom hoch, Pumpe prüfen) oder über 8 K liegt. Beide
  Grenzen sind einstellbar.
- **„Jetzt“-Kachel** in der Ansicht Anlage: Wärmeleistung aus Volumenstrom ×
  Spreizung, Stromaufnahme, COP jetzt und Spreizung, dazu „Verdichter läuft/aus“.
- **Puffer-Ladung**: wie weit der WP-Vorlauf über dem Puffer-Soll lädt
  (Tagesverlauf, Median) – getrennt von der Regelgüte des Puffers (F01).
- **COP inklusive Warmwasser** unter dem COP der letzten 7 Tage, sobald
  Warmwasser-Wärme und -Strom zugeordnet sind. Damit vergleicht F13 einen
  Gesamtzähler (z. B. Netzmessung) als Ersatzquelle mit Heiz- plus
  Warmwasser-Strom statt nur mit dem Heizstrom.
- **Zwei Laufzeit-Zähler** (z. B. Heizung und Warmwasser) werden addiert.
- Anlagen-Check: Spreizung als elfte Prüfung.

### Behoben
- Quellen-Check meldete die Stromzähler als „unpassend“ (erwartete W/kW statt
  kWh) und An/Aus-Sensoren als „keine Statistik“. Jetzt: Zähler = Energie,
  An/Aus-Sensoren „aus Verlauf“.

## 0.3.3 – 2026-11-17

### Behoben
- **Vorlauf Ist − Soll blieb leer**, wenn der Verdichter ein An/Aus-Sensor ist:
  Die Auswertung verlangte „Verdichter lief“, fand dafür aber keine Statistik
  und verwarf jede Stunde. Jetzt kommt der Laufanteil je Stunde aus dem
  Zustandsverlauf; ohne jede Verdichterinformation wird über alle Stunden
  gerechnet (wie dokumentiert).
- **Raumwarnung nach einer einzigen Messung:** Räume werden erst ab zwölf
  Stunden Stichproben bewertet.

### Neu
- **An/Aus-Sensoren aus dem Zustandsverlauf:** Abtauung und Heizstab (Stunden
  pro Tag), Verdichterlaufzeit je Zyklus und – ohne Startzähler – Starts pro
  Tag werden aus dem Verlauf berechnet (`analysis/onoff.py`, alle 30 min).
- **Kein leeres Fenster nach dem Neustart:** Raum-, Pumpen- und
  Mischerstichproben der letzten sieben Tage werden aus dem Verlauf
  nachgetragen (Protokoll: „Verlauf nachgetragen“).
- **Ehrlicher Anlagen-Check:** Er zeigt „x von 10 Prüfungen aktiv“ und listet,
  was fehlt (kein Sensor / noch keine Daten). Laufen COP oder Vorlauf-Prüfung
  nicht oder weniger als 70 % der Prüfungen, heißt die Stufe „Eingeschränkt“
  statt „Gut“/„Sehr gut“.

### Geändert
- Schwellen kalibriert: Vorlauf über Soll ab **2 K** (vorher 5 K), Starts ab
  **12 pro Tag** (vorher 20). Eigene Werte im Optionsdialog bleiben erhalten.

## 0.3.2 – 2026-11-17

### Behoben
- **Start nach dem Update von 0.2.x schlug fehl** („Fehler beim Einrichten“,
  alle Sensoren nicht verfügbar): 0.3.0 hat die Speicherversion erhöht, aber
  keine Übernahme der alten Daten mitgeliefert. Home Assistant brach dann mit
  `NotImplementedError` ab. Alte Daten (Inventar, Änderungen, Roll-ups) werden
  jetzt unverändert übernommen, neue Bereiche ergänzt.

## 0.3.1 – 2026-11-17

### Behoben
- **Dashboard wurde nicht angelegt:** Home Assistant verlangt einen Bindestrich
  im Pfad eines Dashboards; `heizungsanalyse` wurde stillschweigend abgelehnt.
  Der Pfad ist jetzt `heizungs-analyse`. Scheitert das Anlegen trotzdem, steht
  der Grund im Protokoll.
- **Fehlte in „Dashboard hinzufügen“:** Die Strategie meldet sich jetzt wie bei
  Raumklima als Vorlage „Heizungsanalyse“ an und lässt sich dort auswählen.
- Das „?“ an „Laufzeit / Zyklus“ zeigte den Hilfetext des Systemstatus
  (doppelter Schlüssel); doppelte Übersetzungen entfernt.

## 0.3.0 – 2026-11-17

### Neu
- **Ereignisprotokoll** (`event_log.py`): höchstens 2000 Einträge oder 30 Tage,
  verzögert im eigenen Speicher (Feld `log`). Kategorien: Start (mit Marker
  „— Neustart —“), Auswertung (Dauer, Statistikzeilen, Tage – gedrosselt auf
  jede Änderung oder jeden 12. Lauf), Quelle, Hinweis, Konfiguration, Inventar,
  Dashboard, Karte und Fehler.
- **Diagnose** (`diagnostics.py`): Versionen, Konfiguration mit Entity-IDs,
  Quellen-Check mit Ampel und Handlungstipp, Kennzahlen und Summary, Tageswerte
  (31), COP-/Kurven-Bins, Vorlauf-Stunden, Hinweise mit Beleg, Raum- und
  Kreisliste mit Stichproben und Verwerfungsgründen, Speicher, Laufzeit,
  Protokoll (48 h) und Debug-Spur (12 h). Als Download und über
  `heizungsanalyse/diagnostics` (nur Admin), geschwärzt.
- **Debug-Spur** (`debug_log.py`): eigener Logging-Handler auf die Integration,
  3000 Zeilen / 12 Stunden, beim Start geladen, beim Stoppen gesichert.
- **Sechster Reiter „Protokoll“** in der Dashboard-Strategie: Systemstatus
  (Backend/Karte, letzter und nächster Lauf, Fehler, Speicherstand),
  Quellen-Check als Tabelle, Protokoll mit Kategorie-/Stufen-Chips, Suche,
  Zeitraum (24 h / 7 / 30 Tage), nach Tag gruppiert, aufklappbaren Details,
  Neustart-Trennlinien, Aktualisierung alle 30 Sekunden. Werkzeuge:
  Diagnose herunterladen, Protokoll kopieren, „Jetzt neu berechnen“.
- **Websocket:** `heizungsanalyse/log` (Filter `since`, `level`, `cat`, `q`,
  `limit`; neueste zuerst), `heizungsanalyse/diagnostics` (Admin),
  `heizungsanalyse/trace` (Kartenfehler, max. 20/min).
- **Dienst `heizungsanalyse.refresh`** – Coordinator neu rechnen, rein lesend.
- Karte meldet Lade- und Darstellungsfehler selbst über `heizungsanalyse/trace`.

### Doku
- Neu: [docs/protokoll.md](docs/protokoll.md) – Inhalt, Aufbewahrung,
  Diagnose, Datenschutz. README, Dashboard- und Dienste-Doku ergänzt.

## 0.2.1 – 2026-11-17

### Behoben
- **Keine Kennzahlen trotz vorhandener Statistik:** Aktuelle Home-Assistant-
  Versionen liefern den Beginn einer Statistikzeile als Zeitstempel statt als
  Datum. Diese Zeilen wurden verworfen – COP, Starts, Vorlauf-Abweichung und
  „Tage mit Daten“ blieben leer, und F12 meldete fälschlich fehlende
  Langzeitstatistik. Beide Formate werden jetzt gelesen.
- **Abgeschaltete Räume lösen keine Hinweise mehr aus:** Ein Soll unter 10 °C
  (Frostschutz, bewusst aus) zählt nicht als Komfortziel. Vorher meldete F05
  z. B. „9,9 K über dem Soll“ für einen Raum auf 6 °C.
- Bezeichner aus Namen mit „ß“ werden mit „ss“ gebildet (Fußboden →
  `fussboden`).

## 0.2.0 – 2026-11-17

### Neu
- **Dashboard, das sich selbst anlegt:** Nach der Einrichtung erscheint
  „Heizungsanalyse“ in der Seitenleiste – einmalig, nur für Admins angelegt,
  ein vorhandenes Dashboard wird nie überschrieben. Die Kartendatei trägt sich
  selbst als Lovelace-Ressource ein (YAML-Modus: Extra-Modul).
- **Fünf Ansichten** aus einer Dashboard-Strategie (`custom:heizungsanalyse`),
  ohne Entity-Namen von Hand:
  - *Anlage*: Anlagen-Check (0–100), COP 7/30 Tage, Starts pro Tag, Laufzeit
    je Zyklus, Vorlauf Ist − Soll – jeweils mit 30-Tage-Verlauf –, Hinweise
    mit Beleg, COP-Kennlinie über der Außentemperatur, Energie, „Was fehlt?“.
  - *Effizienz*: COP-Verlauf mit Außentemperatur und Änderungsmarken,
    Heizkurve (Ist/Soll-Vorlauf), Takten nach Außentemperatur, Laufzeit je
    Zyklus, Abtauen & Heizstab, Warmwasseranteil, Energie (30/90/365 Tage).
  - *Räume & Kreise*: Abweichung zum Soll je Raum mit Toleranzband und p90,
    Zeitanteile zu kalt/zu warm, Aufheizzeit, Live-Ist/Soll; Pumpe ohne
    Verdichter und Mischer-Impulse je Kreis.
  - *Vorher / Nachher*: Änderungen mit 7 Tagen davor/danach, wetterbereinigter
    COP-Effekt über die eigene Kennlinie, Änderung direkt eintragen.
  - *Inventar*: Pumpen, Thermostate, Hydraulik, Datenquellen, Bericht als
    Markdown herunterladen.
- „?“ an jeder Kachel mit Erklärung, Hell/Dunkel, Deutsch/Englisch,
  Handy-Layout; Diagramme zeichnen sich in der echten Breite (Schrift bleibt
  überall gleich groß).
- Websocket `heizungsanalyse/summary`: alle Dashboard-Daten in einem Aufruf
  (rein lesend), dazu `dashboard/status` und `dashboard/mark`.

### Geändert
- Texte durchgehend mit Umlauten (Hinweise, Einrichtung, Dienste, Doku).
- Kommazahlen in deutschen Hinweistexten mit Komma.

### Entfernt
- Versehentlich eingecheckte Datei `.local/state/gh/device-id` (jetzt in
  `.gitignore`).

## 0.1.1 – 2026-11-17

### Neu
- **Zusammenspiel mit raumklima-2** (`docs/raumklima-2.md`): Schnittstelle,
  Regeln gegen Doppelungen, was raumklima-2 lesen kann, empfohlene Aufteilung.
- **Isolationstest** (`tests/test_isolation.py`): keine raumklima-Importe, keine
  fest verdrahteten Entity-IDs, eigene Domain.
- README um das Zusammenspiel und die Dokumentationsliste ergänzt.
- Brand-Icon (`brand/icon.png`) für HACS und Repo-Themen.

### Behoben
- `CONFIG_SCHEMA` ergänzt (hassfest-Warnung).
- Überzähliger `options.init`-Block in den Übersetzungen entfernt und
  Beschreibung für den Optionsdialog ergänzt (hassfest-Fehler).

### Veröffentlichung
- Erstes öffentliches Repo `Goldi5/Heizungsanalyse`; CI (ruff, pytest,
  hassfest, HACS) grün.

## 0.1.0 – 2026-11-17

Erste Fassung für HACS (benutzerdefiniertes Repository). Die Zwischenstände
0.1.0b0 bis 0.7.0b0 waren Phasenmarker während der Umsetzung.

### Enthalten
- Einrichtung über die UI mit Pflichtquellen, optionalen Quellen, Heizkreisen,
  Räumen und Schwellen.
- Kennzahlen aus der Recorder-Statistik: COP (7/30 Tage), Starts pro Tag,
  Laufzeit je Zyklus, Vorlauf-Abweichung, Tage mit Daten.
- Geräteinventar mit Änderungsverlauf und Roll-ups; Dienste
  `update_inventory`, `log_change`, `compare_periods`, `export_report`.
- Raum- und Kreisanalyse aus Stichproben, inklusive Räumen ohne Ventilposition.
- Findings F01 bis F13 mit konfigurierbaren Schwellen, Sensor und Ereignis.
- Anonymisierte Diagnostics, Dokumentation und Dashboard-Beispiel.

### Bekannte Grenzen
- Raum- und Kreiswerte sind stichprobenbasiert und beginnen nach einem Neustart
  neu.
- Schwellen sind Platzhalter und mit realen Daten zu kalibrieren.
- Livisi-Thermostate liefern keine Ventilposition.

## 0.7.0b0 – 2026-11-17

### Neu
- **Diagnostics** (`diagnostics.py`): Version, Quell-Domänen, Zähler,
  Kennzahlen, Schwellen und Finding-IDs. Ohne Entity-IDs, Raumnamen oder
  Standortdaten.
- **Dokumentation:** `docs/entities.md` mit allen Sensoren, Attributen und
  Datenfenstern; `docs/dashboard-example.yaml` mit Anlagen-, Raum-, Kreis- und
  Inventaransicht.
- **README:** Installation, Einrichtungsschritte, Grenzen und Datenschutz
  ausgebaut.

### Offen
- GitHub-Release `v0.1.0` und HACS-Validierung brauchen ein Remote.

## 0.6.0b0 – 2026-11-17

### Neu
- **Findings-Engine** (`analysis/findings.py`) mit F01 bis F13: Vorlauf,
  Taktung, Pumpen-Leerlauf, Raum-Abweichung, Heizstab, Doppelsensoren,
  verfügbare Pflichtquellen, Abtauung, COP-Kennlinie, Mischer, fehlende
  Statistik und Stromquellen-Vergleich.
- **Konfigurierbare Schwellen** im Optionsdialog (zehn Werte, Standard aus dem
  Arbeitsauftrag), gespeichert unter `options.thresholds`.
- **Sensor `findings`** mit Anzahl, Schwere-Zählern, Details und Schwellen als
  Attribute; Ereignis `heizungsanalyse_findings` bei Änderung.
- **Zweisprachige Hinweistexte** (`findings_text.py`, de/en) mit Beleg und
  Empfehlung, ohne Handlungsanweisung an die Anlage.
- **Tests:** je Regel mindestens ein positiver und ein negativer Fall, Schwellen,
  Sortierung, Ereignis und Sprache.

### Dokumentation
- `docs/findings.md` mit Regeltabelle, Schwellen und Grenzen; `docs/services.md`
  um das Findings-Ereignis ergänzt.

## 0.5.0b0 – 2026-11-17

### Neu
- **Raumkennzahlen** (`analysis/rooms.py`): Median und P90 der Abweichung
  Ist minus Soll, Zeitanteile unter/über 1 K, Aufheizzeit nach
  Sollwert-Anhebung per Flankenerkennung, Rangliste kalt zuerst.
- **Kreiskennzahlen** (`analysis/circuits.py`): Pumpen-Leerlaufanteil
  (Pumpenlaufzeit ohne Verdichter) und Mischer-Impulse je Tag.
- **Stichprobenpuffer** (`tracking.py`): 7-Tage-Fenster je Raum und Kreis,
  getrennt nach Raum; alte Werte werden verworfen.
- **Sensoren je Raum** (nur mit Climate-Entity): Abweichung und Aufheizzeit,
  eigenes Gerät je Raum; Ventilposition ist optional (Livisi-Räume
  funktionieren ohne).
- **Sensoren je Kreis:** Pumpen-Leerlaufanteil und Mischer-Impulse, eigenes
  Gerät je Kreis.
- **Diagnose:** Raum-Rangliste als Sensor mit Räumen und Mittel je Kreis.
- **Tests:** reine Logik für Abweichung, Aufheizzeit, Leerlauf, Impulse und
  Fensterpruning; Integrationstest mit Climate-, Pumpen- und Mischerzuständen
  inklusive Raum ohne Regelung und Raum ohne Messwerte.

### Dokumentation
- `docs/architecture.md` §9 und `docs/assumptions.md` §10 zu Stichproben,
  Neustartverhalten und Livisi-Grenzen.

## 0.4.0b0 – 2026-11-17

### Neu
- **Geräteinventar** (`storage.py`): Pumpen, Thermostate und Hydraulik als
  eigener Speicher je Konfigurationseintrag; Felder je Bereich sind in
  `const.INVENTORY_FIELDS` festgelegt.
- **Änderungsverlauf:** jede echte Änderung wird mit Zeitstempel, altem und
  neuem Wert sowie optionaler Notiz protokolliert; unveränderte Werte nicht.
- **Roll-ups:** Tagesproben werden gespeichert, damit Vergleiche auch nach
  einem Recorder-Purge funktionieren; der laufende Tag wird übersprungen.
- **Dienste:** `update_inventory`, `log_change`, `compare_periods`,
  `export_report` (Markdown/JSON, mit Antwortdaten).
- **Ereignisse** `heizungsanalyse_inventory_changed` und
  `heizungsanalyse_period_comparison` für Automatisierungen.
- **Dokumentation:** `docs/services.md` mit Feldern, Beispielen und
  Rückgabewerten.
- **Tests:** Inventar und Verlauf, Persistenz, Roll-ups, alle Dienste und ein
  Quelltext-Test gegen steuernde Service-Aufrufe.

## 0.3.0b0 – 2026-11-17

### Neu
- **Analyseschicht** `analysis/` ohne Home-Assistant-Import: COP, COP-Kennlinie,
  Taktung (Starts pro Tag, Laufzeit je Zyklus), Zählerdifferenzen mit
  Reset-Erkennung, Heizkurve und Vorlauf-Abweichung (Median/P90).
- **Datenzugriff** `data_access.py` liest Tages- und Stundenstatistik des
  Recorders; ohne Recorder bleiben die Kennzahlen `unknown`.
- **Coordinator** im 5-Minuten-Takt: baut Tagesproben, wählt die Stromquelle
  (primär oder Ersatz) und weist sie an jedem COP aus.
- **Sensoren:** COP (7 Tage), COP (30 Tage), Verdichterstarts pro Tag,
  Laufzeit je Zyklus, Vorlauf-Abweichung, Tage mit Daten (diagnostisch).
- **Tests:** 14-Tage-Referenzfixture aus dem Plan (COP ca. 3,8, Starts 7 bis 13
  pro Tag), Zeitreihenaufbau, Zählerresets, Sensorzustände, fehlende Daten.

### Dokumentation
- Grenzen der Vorlauf-Abweichung und der Quellenwahl in
  `docs/assumptions.md` und `docs/architecture.md` ergänzt.

## 0.2.0b0 – 2026-11-17

### Neu
- **Pflichtquellen im Einrichtungsdialog:** Strom, Heizwärme, Außentemperatur
  und Verdichter-Status über Entity-Selectoren. Einheit, Geräteklasse und
  Verfügbarkeit werden geprüft; unpassende Entities werden abgelehnt.
- **Optionsdialog:** optionale Quellen (Ersatzstrom, Warmwasserwärme, Vor-/
  Rücklauf, Puffer, Abtauung, Heizstab, Verdichterstarts), Heizkreise und
  Räume anlegen und entfernen.
- **Regeln statt Raten:** doppelte Namen, unbekannte Kreise und das Entfernen
  eines noch belegten Kreises werden abgelehnt.
- **Rekonfiguration** der Pflichtquellen über *Neu konfigurieren*.
- **Datenmodell** `models.py` (reines Python, ohne HA-Import) für Heizkreise
  und Räume, inklusive stabiler Bezeichner aus Namen.
- **Tests:** Einheiten- und Verfügbarkeitsprüfung, Kreis- und Raumverwaltung,
  Räume ohne Thermostat, Modell-Roundtrip.

### Dokumentation
- `docs/assumptions.md` und `docs/architecture.md` um die M1-Entscheidung
  ergänzt: Kreise und Räume liegen als Listen in `entry.options`, nicht als
  Config-Subentries.

## 0.1.0b0 – 2026-11-17

### Neu
- **Repo-Gerüst (M0):** Integrationsordner `custom_components/heizungsanalyse`
  mit Manifest, Konstanten, minimalem Config-Flow und Auf-/Abbau des
  Konfigurationseintrags.
- **CI:** `hassfest`, HACS-Validierung, `ruff` und `pytest`.
- **Dokumentation:** `docs/assumptions.md` mit allen offenen Fragen und
  Annahmen, `docs/architecture.md` mit dem Abgleich zu raumklima-2.
