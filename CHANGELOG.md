## 0.1.1b0 – 2026-11-17

### Neu
- **Zusammenspiel mit raumklima-2** (`docs/raumklima-2.md`): Schnittstelle,
  Regeln gegen Doppelungen, was raumklima-2 lesen kann, empfohlene Aufteilung.
- **Isolationstest** (`tests/test_isolation.py`): keine raumklima-Importe, keine
  fest verdrahteten Entity-IDs, eigene Domain.
- README um das Zusammenspiel und die Dokumentationsliste ergaenzt.

## 0.1.0 – 2026-11-17

Erste Fassung fuer HACS (benutzerdefiniertes Repository). Die Zwischenstaende
0.1.0b0 bis 0.7.0b0 waren Phasenmarker waehrend der Umsetzung.

### Enthalten
- Einrichtung ueber die UI mit Pflichtquellen, optionalen Quellen, Heizkreisen,
  Raeumen und Schwellen.
- Kennzahlen aus der Recorder-Statistik: COP (7/30 Tage), Starts pro Tag,
  Laufzeit je Zyklus, Vorlauf-Abweichung, Tage mit Daten.
- Geraeteinventar mit Aenderungsverlauf und Roll-ups; Dienste
  `update_inventory`, `log_change`, `compare_periods`, `export_report`.
- Raum- und Kreisanalyse aus Stichproben, inklusive Raeumen ohne Ventilposition.
- Findings F01 bis F13 mit konfigurierbaren Schwellen, Sensor und Ereignis.
- Anonymisierte Diagnostics, Dokumentation und Dashboard-Beispiel.

### Bekannte Grenzen
- Raum- und Kreiswerte sind stichprobenbasiert und beginnen nach einem Neustart
  neu.
- Schwellen sind Platzhalter und mit realen Daten zu kalibrieren.
- Livisi-Thermostate liefern keine Ventilposition.

## 0.7.0b0 – 2026-11-17

### Neu
- **Diagnostics** (`diagnostics.py`): Version, Quell-Domaenen, Zaehler,
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
  verfuegbare Pflichtquellen, Abtauung, COP-Kennlinie, Mischer, fehlende
  Statistik und Stromquellen-Vergleich.
- **Konfigurierbare Schwellen** im Optionsdialog (zehn Werte, Standard aus dem
  Arbeitsauftrag), gespeichert unter `options.thresholds`.
- **Sensor `findings`** mit Anzahl, Schwere-Zaehlern, Details und Schwellen als
  Attribute; Ereignis `heizungsanalyse_findings` bei Aenderung.
- **Zweisprachige Hinweistexte** (`findings_text.py`, de/en) mit Beleg und
  Empfehlung, ohne Handlungsanweisung an die Anlage.
- **Tests:** je Regel mindestens ein positiver und ein negativer Fall, Schwellen,
  Sortierung, Ereignis und Sprache.

### Dokumentation
- `docs/findings.md` mit Regeltabelle, Schwellen und Grenzen; `docs/services.md`
  um das Findings-Ereignis ergaenzt.

## 0.5.0b0 – 2026-11-17

### Neu
- **Raumkennzahlen** (`analysis/rooms.py`): Median und P90 der Abweichung
  Ist minus Soll, Zeitanteile unter/ueber 1 K, Aufheizzeit nach
  Sollwert-Anhebung per Flankenerkennung, Rangliste kalt zuerst.
- **Kreiskennzahlen** (`analysis/circuits.py`): Pumpen-Leerlaufanteil
  (Pumpenlaufzeit ohne Verdichter) und Mischer-Impulse je Tag.
- **Stichprobenpuffer** (`tracking.py`): 7-Tage-Fenster je Raum und Kreis,
  getrennt nach Raum; alte Werte werden verworfen.
- **Sensoren je Raum** (nur mit Climate-Entity): Abweichung und Aufheizzeit,
  eigenes Geraet je Raum; Ventilposition ist optional (Livisi-Raeume
  funktionieren ohne).
- **Sensoren je Kreis:** Pumpen-Leerlaufanteil und Mischer-Impulse, eigenes
  Geraet je Kreis.
- **Diagnose:** Raum-Rangliste als Sensor mit Raeumen und Mittel je Kreis.
- **Tests:** reine Logik fuer Abweichung, Aufheizzeit, Leerlauf, Impulse und
  Fensterpruning; Integrationstest mit Climate-, Pumpen- und Mischerzustaenden
  inklusive Raum ohne Regelung und Raum ohne Messwerte.

### Dokumentation
- `docs/architecture.md` §9 und `docs/assumptions.md` §10 zu Stichproben,
  Neustartverhalten und Livisi-Grenzen.

## 0.4.0b0 – 2026-11-17

### Neu
- **Geraeteinventar** (`storage.py`): Pumpen, Thermostate und Hydraulik als
  eigener Speicher je Konfigurationseintrag; Felder je Bereich sind in
  `const.INVENTORY_FIELDS` festgelegt.
- **Aenderungsverlauf:** jede echte Aenderung wird mit Zeitstempel, altem und
  neuem Wert sowie optionaler Notiz protokolliert; unveraenderte Werte nicht.
- **Roll-ups:** Tagesproben werden gespeichert, damit Vergleiche auch nach
  einem Recorder-Purge funktionieren; der laufende Tag wird uebersprungen.
- **Dienste:** `update_inventory`, `log_change`, `compare_periods`,
  `export_report` (Markdown/JSON, mit Antwortdaten).
- **Ereignisse** `heizungsanalyse_inventory_changed` und
  `heizungsanalyse_period_comparison` fuer Automatisierungen.
- **Dokumentation:** `docs/services.md` mit Feldern, Beispielen und
  Rueckgabewerten.
- **Tests:** Inventar und Verlauf, Persistenz, Roll-ups, alle Dienste und ein
  Quelltext-Test gegen steuernde Service-Aufrufe.

## 0.3.0b0 – 2026-11-17

### Neu
- **Analyseschicht** `analysis/` ohne Home-Assistant-Import: COP, COP-Kennlinie,
  Taktung (Starts pro Tag, Laufzeit je Zyklus), Zaehlerdifferenzen mit
  Reset-Erkennung, Heizkurve und Vorlauf-Abweichung (Median/P90).
- **Datenzugriff** `data_access.py` liest Tages- und Stundenstatistik des
  Recorders; ohne Recorder bleiben die Kennzahlen `unknown`.
- **Coordinator** im 5-Minuten-Takt: baut Tagesproben, waehlt die Stromquelle
  (primaer oder Ersatz) und weist sie an jedem COP aus.
- **Sensoren:** COP (7 Tage), COP (30 Tage), Verdichterstarts pro Tag,
  Laufzeit je Zyklus, Vorlauf-Abweichung, Tage mit Daten (diagnostisch).
- **Tests:** 14-Tage-Referenzfixture aus dem Plan (COP ca. 3,8, Starts 7 bis 13
  pro Tag), Zeitreihenaufbau, Zaehlerresets, Sensorzustaende, fehlende Daten.

### Dokumentation
- Grenzen der Vorlauf-Abweichung und der Quellenwahl in
  `docs/assumptions.md` und `docs/architecture.md` ergaenzt.

## 0.2.0b0 – 2026-11-17

### Neu
- **Pflichtquellen im Einrichtungsdialog:** Strom, Heizwaerme, Aussentemperatur
  und Verdichter-Status ueber Entity-Selectoren. Einheit, Geraeteklasse und
  Verfuegbarkeit werden geprueft; unpassende Entities werden abgelehnt.
- **Optionsdialog:** optionale Quellen (Ersatzstrom, Warmwasserwaerme, Vor-/
  Ruecklauf, Puffer, Abtauung, Heizstab, Verdichterstarts), Heizkreise und
  Raeume anlegen und entfernen.
- **Regeln statt Raten:** doppelte Namen, unbekannte Kreise und das Entfernen
  eines noch belegten Kreises werden abgelehnt.
- **Rekonfiguration** der Pflichtquellen ueber *Neu konfigurieren*.
- **Datenmodell** `models.py` (reines Python, ohne HA-Import) fuer Heizkreise
  und Raeume, inklusive stabiler Bezeichner aus Namen.
- **Tests:** Einheiten- und Verfuegbarkeitspruefung, Kreis- und Raumverwaltung,
  Raeume ohne Thermostat, Modell-Roundtrip.

### Dokumentation
- `docs/assumptions.md` und `docs/architecture.md` um die M1-Entscheidung
  ergaenzt: Kreise und Raeume liegen als Listen in `entry.options`, nicht als
  Config-Subentries.

## 0.1.0b0 – 2026-11-17

### Neu
- **Repo-Geruest (M0):** Integrationsordner `custom_components/heizungsanalyse`
  mit Manifest, Konstanten, minimalem Config-Flow und Auf-/Abbau des
  Konfigurationseintrags.
- **CI:** `hassfest`, HACS-Validierung, `ruff` und `pytest`.
- **Dokumentation:** `docs/assumptions.md` mit allen offenen Fragen und
  Annahmen, `docs/architecture.md` mit dem Abgleich zu raumklima-2.
