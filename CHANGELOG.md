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
