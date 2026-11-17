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
