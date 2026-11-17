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
