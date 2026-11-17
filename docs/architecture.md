# Architektur

Stand: M0 (Repo-Geruest). Die Phasen M1-M7 folgen gemaess Arbeitsauftrag.

## 1. Grundsaetze

- **Read-only.** Kein Codepfad ruft einen Dienst auf einer Fremd-Entity auf.
  Die Regel wird durch einen Test abgesichert (`tests/ha/test_read_only.py`,
  ab M1), der `hass.services.async_call` auf fremden Domains verbietet.
- **Reines Python in `analysis/`.** Cop, Taktung, Heizkurve, Raeume und
  Findings kennen weder Recorder noch Home Assistant und sind isoliert
  testbar.
- **Schmaler Adapter.** `data_access.py` liefert Statistik und Zustaende; nur
  diese Datei kennt den Recorder.
- **Kein Raten.** Fehlt eine Quelle, wird die Kennzahl `unknown`.

## 2. Abgleich mit raumklima-2

Gelesen wurden `manifest.json`, `hacs.json`, `pyproject.toml`,
`requirements_test.txt`, `.github/workflows/*`, `const.py`, `config_flow.py`,
`entity.py`, `__init__.py`, `docs/de/entwickeln.md`, `docs/de/referenz.md`,
`CHANGELOG.md` und der Testaufbau.

| Aspekt | raumklima-2 | heizungsanalyse | Begruendung |
|---|---|---|---|
| Domain | `raumklima` | `heizungsanalyse` | eigenes Projekt, keine Kopplung |
| integration_type | `device` | `hub` | eine Analyse je Anlage, kein Einzelgeraet |
| Coordinator | eigener Controller/Hub mit Listenern | noch offen, ab M1 `DataUpdateCoordinator` | Analyse laeuft zeitfensterbasiert, kein Event-Sturm |
| Persistenz | `entry.data` = Verdrahtung, `entry.options` = Stellschrauben | ebenso; zusaetzlich `Store` fuer Inventar und Roll-ups | gleiche Trennung, plus Historie |
| unique_id | `{entry_id}_{key}` | `{entry_id}_{key}` | identisches Schema |
| Entity-Namen | `_attr_translation_key` + `has_entity_name` | ebenso | gleiche Mechanik, uebersetzbar |
| EntityDescription | nicht verwendet | nicht verwendet | Konsistenz |
| Reine Logik | `logic.py`, `stats.py`, ... ohne HA-Import | `analysis/*` ohne HA-Import | gleiches Muster |
| Test-Alias | synthetisches Paket `rk` | synthetisches Paket `hz` | gleiche Technik |
| Ruff | py313, line-length 130, feste Select-Liste | uebernommen | gleiche CI |
| Mypy | nicht verwendet | nicht verwendet | gleiche CI |
| Translations | `strings.json` + `translations/{de,en,fr}.json` | `strings.json` + `translations/{de,en}.json` | Plan fordert de/en |
| Versionierung | `bN`-Suffixe, Changelog-Konvention | uebernommen | Release-Muster bleibt einheitlich |

**Bewusste Unterschiede:** kein Frontend, keine Karte, kein PDF-Bericht in
M0-M6 (Bericht als Markdown/JSON per Service), kein `fpdf2`. Die Heizungsanalyse
ist das beobachtende Gegenstueck und darf raumklima-2 nie steuern.

## 3. Geplante Modulstruktur

```
custom_components/heizungsanalyse/
  __init__.py        Aufbau, Runtime, Plattform-Forwarding
  config_flow.py     Einrichtung + Optionsdialog (M1)
  coordinator.py     Zeitfenster-Aggregation (M2)
  data_access.py     Recorder-Statistik + Zustaende (M2)
  storage.py         Inventar + Aenderungsverlauf + Roll-ups (M3)
  sensor.py          Kennzahlen (M2)
  binary_sensor.py   Problem-/Statusanzeigen (M5)
  diagnostics.py     anonymisierte Diagnose
  services.yaml      Inventar, Vergleich, Bericht (M3)
  analysis/          reines Python, ohne HA-Import
    cop.py  cycling.py  heating_curve.py  rooms.py  findings.py
```

## 4. Datenfluss

1. `data_access` liest Langzeitstatistik (`statistics_during_period`) und
   Zustandsaenderungen in festen Fenstern (5 Minuten, Tag, Monat).
2. `analysis/*` berechnet Kennzahlen aus neutralen Dictionaries.
3. `coordinator` haelt den letzten Stand und schreibt Tages-Roll-ups in den
   `Store`.
4. Sensoren und Findings lesen nur aus dem Coordinator.
5. Der Service `compare_periods` schneidet zwei Fenster um einen Eintrag im
   Aenderungsverlauf und ruft dieselben Analysefunktionen auf.

## 5. Entscheidungen aus M1
- **Heizkreise und Raeume liegen als Listen in `entry.options`**, nicht als
  Config-Subentries. Gruende: beliebig viele Eintraege, keine Notwendigkeit
  fuer eine eigene Entry-Verwaltung je Kreis, gleiche Mechanik fuer beide
  Sammlungen, und die Optionsdaten sind mit `MockConfigEntry` vollstaendig
  testbar. Jeder Eintrag traegt eine stabile `id` (aus dem Namen abgeleitet,
  ohne Umlaute), damit spaetere Roll-ups und der Aenderungsverlauf darauf
  verweisen koennen.
- **Pflichtquellen liegen in `entry.data`**, optionale Quellen in
  `entry.options`. Das entspricht der Trennung von Verdrahtung und
  Stellschrauben in raumklima-2. Aenderungen an den Pflichtquellen laufen ueber
  `async_step_reconfigure`.
- **Validierung im Formular, nicht im Betrieb.** Einheit, Geraeteklasse,
  Domain und Verfuegbarkeit werden beim Speichern geprueft; Fehler erscheinen
  am Feld (`wrong_unit`, `unavailable`, `wrong_domain`, `not_found`).
- **`OptionsFlowWithReload`** wird verwendet: Aenderungen an den Optionen laden
  den Eintrag neu, wie bei den Raum-Optionen in raumklima-2.

## 6. Offene Architekturentscheidungen

- Ob der Coordinator `DataUpdateCoordinator` nutzt oder ein eigener Listener
  (wie raumklima-2) sinnvoller ist, entscheidet sich in M2 anhand der
  Statistik-Abfragekosten.

## 7. Umsetzung M2

```
analysis/
  types.py          DayValue, HourValue, DaySample, HourSample
  counters.py       counter_delta mit Reset-Erkennung
  series.py         Statistikwerte -> Tagesreihen -> DaySample
  cop.py            CopResult, cop_window, cop_per_day, cop_curve
  cycling.py        starts_per_day, mean_runtime_per_cycle
  heating_curve.py  deviation (Median/P90), curve_bins
data_access.py      Recorder-Statistik (Tages-/Stundenperiode)
coordinator.py      HeizungsanalyseCoordinator, AnalysisSnapshot
sensor.py           sechs Sensoren, alle am Coordinator
```

Datenfluss je Lauf:

1. `async_read_daily` holt eine Sammelabfrage fuer alle gemappten Entities
   (31 Tage, `period="day"`).
2. `series` baut daraus `DaySample`-Proben; Energie bevorzugt `change`, sonst
   Zaehlerdelta.
3. `cop`, `cycling` und `heating_curve` berechnen die Kennzahlen fensterweise.
4. `async_read_hourly` (7 Tage) liefert nur die Stundenwerte fuer die
   Vorlauf-Abweichung, gefiltert auf laufenden Verdichter, wenn dessen
   Statistik vorhanden ist.
5. Sensoren lesen ausschliesslich `coordinator.data`; sie fragen selbst nichts
   ab und schreiben nichts.

## 8. Umsetzung M3

```
storage.py          InventoryStore (Store je Eintrag): Inventar, Verlauf, Roll-ups
analysis/periods.py samples_from_rollups, merge_samples, within, summarize,
                    compare_periods
report.py           render_markdown, render_json (ohne HA-Import)
services.py         vier Dienste, nur eigener Speicher, Antwortdaten optional
```

Entscheidungen:

- Dienste werden in `async_setup` einmal registriert, nicht je Eintrag; die
  Handler holen den Laufzeitkontext ueber `runtime_data`. Das vermeidet
  doppelte Registrierung und Lecks beim Neu laden.
- Der Speicher liegt unter `heizungsanalyse.<entry_id>`, also getrennt je
  Eintrag; ein zweiter Eintrag (andere Anlage) ueberschreibt nichts.
- Roll-ups werden nach jedem Coordinator-Lauf geschrieben und beim Start
  geladen. `compare_periods` mischt gespeicherte Roll-ups mit den frischen
  Tagesproben, frische Werte gewinnen.
- Aenderungen werden nur bei echter Wertdifferenz protokolliert; der Verlauf
  ist auf die letzten `CHANGE_LOG_LIMIT` Eintraege begrenzt, der Bericht auf
  `REPORT_CHANGE_LIMIT`.
- Es gibt keinen Pfad zu `hass.services.async_call`; `tests/test_read_only.py`
  prueft den Quelltext auf steuernde Muster und direkte `.storage`-Zugriffe.
