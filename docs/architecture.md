# Architektur

Stand: M0 (Repo-Gerüst). Die Phasen M1-M7 folgen gemäß Arbeitsauftrag.

## 1. Grundsätze

- **Read-only.** Kein Codepfad ruft einen Dienst auf einer Fremd-Entity auf.
  Die Regel wird durch einen Test abgesichert (`tests/ha/test_read_only.py`,
  ab M1), der `hass.services.async_call` auf fremden Domains verbietet.
- **Reines Python in `analysis/`.** Cop, Taktung, Heizkurve, Räume und
  Findings kennen weder Recorder noch Home Assistant und sind isoliert
  testbar.
- **Schmaler Adapter.** `data_access.py` liefert Statistik und Zustände; nur
  diese Datei kennt den Recorder.
- **Kein Raten.** Fehlt eine Quelle, wird die Kennzahl `unknown`.

## 2. Abgleich mit raumklima-2

Gelesen wurden `manifest.json`, `hacs.json`, `pyproject.toml`,
`requirements_test.txt`, `.github/workflows/*`, `const.py`, `config_flow.py`,
`entity.py`, `__init__.py`, `docs/de/entwickeln.md`, `docs/de/referenz.md`,
`CHANGELOG.md` und der Testaufbau.

| Aspekt | raumklima-2 | heizungsanalyse | Begründung |
|---|---|---|---|
| Domain | `raumklima` | `heizungsanalyse` | eigenes Projekt, keine Kopplung |
| integration_type | `device` | `hub` | eine Analyse je Anlage, kein Einzelgerät |
| Coordinator | eigener Controller/Hub mit Listenern | noch offen, ab M1 `DataUpdateCoordinator` | Analyse läuft zeitfensterbasiert, kein Event-Sturm |
| Persistenz | `entry.data` = Verdrahtung, `entry.options` = Stellschrauben | ebenso; zusätzlich `Store` für Inventar und Roll-ups | gleiche Trennung, plus Historie |
| unique_id | `{entry_id}_{key}` | `{entry_id}_{key}` | identisches Schema |
| Entity-Namen | `_attr_translation_key` + `has_entity_name` | ebenso | gleiche Mechanik, übersetzbar |
| EntityDescription | nicht verwendet | nicht verwendet | Konsistenz |
| Reine Logik | `logic.py`, `stats.py`, ... ohne HA-Import | `analysis/*` ohne HA-Import | gleiches Muster |
| Test-Alias | synthetisches Paket `rk` | synthetisches Paket `hz` | gleiche Technik |
| Ruff | py313, line-length 130, feste Select-Liste | übernommen | gleiche CI |
| Mypy | nicht verwendet | nicht verwendet | gleiche CI |
| Translations | `strings.json` + `translations/{de,en,fr}.json` | `strings.json` + `translations/{de,en}.json` | Plan fordert de/en |
| Versionierung | `bN`-Suffixe, Changelog-Konvention | übernommen | Release-Muster bleibt einheitlich |

**Bewusste Unterschiede:** kein Frontend, keine Karte, kein PDF-Bericht in
M0-M6 (Bericht als Markdown/JSON per Service), kein `fpdf2`. Die Heizungsanalyse
ist das beobachtende Gegenstück und darf raumklima-2 nie steuern.

## 3. Geplante Modulstruktur

```
custom_components/heizungsanalyse/
  __init__.py        Aufbau, Runtime, Plattform-Forwarding
  config_flow.py     Einrichtung + Optionsdialog (M1)
  coordinator.py     Zeitfenster-Aggregation (M2)
  data_access.py     Recorder-Statistik + Zustände (M2)
  storage.py         Inventar + Änderungsverlauf + Roll-ups (M3)
  sensor.py          Kennzahlen (M2)
  binary_sensor.py   Problem-/Statusanzeigen (M5)
  diagnostics.py     anonymisierte Diagnose
  services.yaml      Inventar, Vergleich, Bericht (M3)
  analysis/          reines Python, ohne HA-Import
    cop.py  cycling.py  heating_curve.py  rooms.py  findings.py
```

## 4. Datenfluss

1. `data_access` liest Langzeitstatistik (`statistics_during_period`) und
   Zustandsänderungen in festen Fenstern (5 Minuten, Tag, Monat).
2. `analysis/*` berechnet Kennzahlen aus neutralen Dictionaries.
3. `coordinator` hält den letzten Stand und schreibt Tages-Roll-ups in den
   `Store`.
4. Sensoren und Findings lesen nur aus dem Coordinator.
5. Der Service `compare_periods` schneidet zwei Fenster um einen Eintrag im
   Änderungsverlauf und ruft dieselben Analysefunktionen auf.

## 5. Entscheidungen aus M1
- **Heizkreise und Räume liegen als Listen in `entry.options`**, nicht als
  Config-Subentries. Gründe: beliebig viele Einträge, keine Notwendigkeit
  für eine eigene Entry-Verwaltung je Kreis, gleiche Mechanik für beide
  Sammlungen, und die Optionsdaten sind mit `MockConfigEntry` vollständig
  testbar. Jeder Eintrag trägt eine stabile `id` (aus dem Namen abgeleitet,
  ohne Umlaute), damit spätere Roll-ups und der Änderungsverlauf darauf
  verweisen können.
- **Pflichtquellen liegen in `entry.data`**, optionale Quellen in
  `entry.options`. Das entspricht der Trennung von Verdrahtung und
  Stellschrauben in raumklima-2. Änderungen an den Pflichtquellen laufen über
  `async_step_reconfigure`.
- **Validierung im Formular, nicht im Betrieb.** Einheit, Geräteklasse,
  Domain und Verfügbarkeit werden beim Speichern geprüft; Fehler erscheinen
  am Feld (`wrong_unit`, `unavailable`, `wrong_domain`, `not_found`).
- **`OptionsFlowWithReload`** wird verwendet: Änderungen an den Optionen laden
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

1. `async_read_daily` holt eine Sammelabfrage für alle gemappten Entities
   (31 Tage, `period="day"`).
2. `series` baut daraus `DaySample`-Proben; Energie bevorzugt `change`, sonst
   Zählerdelta.
3. `cop`, `cycling` und `heating_curve` berechnen die Kennzahlen fensterweise.
4. `async_read_hourly` (7 Tage) liefert nur die Stundenwerte für die
   Vorlauf-Abweichung, gefiltert auf laufenden Verdichter, wenn dessen
   Statistik vorhanden ist.
5. Sensoren lesen ausschließlich `coordinator.data`; sie fragen selbst nichts
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
  Handler holen den Laufzeitkontext über `runtime_data`. Das vermeidet
  doppelte Registrierung und Lecks beim Neu laden.
- Der Speicher liegt unter `heizungsanalyse.<entry_id>`, also getrennt je
  Eintrag; ein zweiter Eintrag (andere Anlage) überschreibt nichts.
- Roll-ups werden nach jedem Coordinator-Lauf geschrieben und beim Start
  geladen. `compare_periods` mischt gespeicherte Roll-ups mit den frischen
  Tagesproben, frische Werte gewinnen.
- Änderungen werden nur bei echter Wertdifferenz protokolliert; der Verlauf
  ist auf die letzten `CHANGE_LOG_LIMIT` Einträge begrenzt, der Bericht auf
  `REPORT_CHANGE_LIMIT`.
- Es gibt keinen Pfad zu `hass.services.async_call`; `tests/test_read_only.py`
  prüft den Quelltext auf steuernde Muster und direkte `.storage`-Zugriffe.

## 9. Umsetzung M4

```
analysis/rooms.py     RoomReading, deviation_stats, heating_up_times,
                      rank_rooms, circuit_ranking
analysis/circuits.py  CircuitSample, pump_idle, MixerSample, mixer_pulses
tracking.py           RoomTracker, CircuitTracker, MixerTracker (7 Tage)
coordinator.py        _track liest Zustände je Lauf, Snapshot trägt
                      Raum-/Kreiswerte und Ranglisten
sensor.py             je Raum Abweichung + Aufheizzeit, je Kreis
                      Leerlaufanteil + Mischer-Impulse, Raum-Rangliste
```

Entscheidungen:

- Raum- und Kreisdaten entstehen als **Stichproben im Coordinator-Takt**
  (fünf Minuten), nicht aus der Recorder-Statistik: Climate-Attribute und
  Binärsensoren haben keine Langzeitstatistik. Die Auflösung wird an jedem
  Sensor als Attribut ausgewiesen.
- Das Fenster ist sieben Tage und lebt im Arbeitsspeicher. Nach einem Neustart
  füllt es sich neu; die Stichprobenzahl macht das sichtbar.
- Räume ohne Climate-Entity (z. B. das Schlafzimmer) bekommen keine Sensoren
  und lösen keine Kennzahl aus. Räume ohne Ventilposition (Livisi) werden
  vollständig ausgewertet; `valve_available` ist dann `false`.
- Der Aufheiztest reagiert auf Sollwert-Anhebungen ab 0,3 K und endet bei
  `Soll - 0,5 K`; ein Abbruch nach sechs Stunden oder ein Sollwert-Rückgang
  verwirft den Versuch. So entstehen keine erfundenen Aufheizzeiten.
- Je Raum und je Kreis entsteht ein eigenes Gerät unter dem Hauptgerät.
  Damit bleiben Entity-Namen lesbar, ohne dass die Integration Raumnamen
  erfindet.

## 10. Umsetzung M5

```
analysis/findings.py  Thresholds, Finding, FindingsInput, evaluate, signature
findings_text.py      zweisprachige Text- und Empfehlungsvorlagen
coordinator.py        sammelt Regel-Eingaben, veröffentlicht Ergebnis
sensor.py             Sensor findings mit Details und Schwellen
config_flow.py        Schritt "thresholds" im Optionsdialog
```

Entscheidungen:

- Regeln sind reine Funktionen über `FindingsInput`; die Texte liegen getrennt.
  So lässt sich jede Regel ohne HA und ohne Übersetzungen testen.
- Jede Regel prüft zuerst, ob ihre Messwerte vorhanden sind. Fehlt etwas,
  entsteht kein Finding; das unterscheidet "unauffällig" von "unbekannt".
- F09 heißt bewusst "Abtau-Stunden", weil die Statistik eines Binärsensors
  keine Schaltvorgänge liefert. Eine Umdeutung wäre Scheinsicherheit.
- F08 prüft nur vorhandene, aber nicht verfügbare Quellen. Eine fehlende
  Entity meldet F12 (keine Statistik) bzw. schon die Einrichtung.
- Schwellen liegen als flaches Dict unter `options.thresholds`; unbekannte oder
  unplausible Werte werden ignoriert und durch den Standard ersetzt.
- Das Ereignis wird nur bei geänderter Signatur gefeuert, nicht bei jedem
  Coordinator-Lauf.

## 11. Umsetzung M7

Die Heizungsanalyse bleibt ein eigenständiges Projekt neben raumklima-2:
keine Importe, keine gemeinsamen Speicher, keine Dienste am anderen Projekt.
Die Schnittstelle ist rein lesend und in `docs/raumklima-2.md` beschrieben.
`tests/test_isolation.py` hält die Trennung fest (keine raumklima-Importe,
keine festen Entity-IDs). Geteilte Konstanten wandern später höchstens in eine
eigene Bibliothek, nicht per Copy-and-paste.

## 12. Umsetzung M13 – Protokoll, Diagnose, Debug-Spur

- `analysis/event_log.py` hält den Puffer und die Filter rein (2000 Einträge,
  30 Tage, neueste zuerst, Drosselung der update-Einträge, Neustart-Marker).
- `event_log.py` verbindet Puffer und `Store` (verzögertes Speichern im Feld
  `log`); `debug_log.py` ist ein eigener Logging-Handler (3000 Zeilen,
  12 Stunden, Sichern beim Stoppen).
- `diagnostics.py` baut Diagnose und Quellen-Check; Download und
  `heizungsanalyse/diagnostics` nutzen denselben Code.
- `websocket_api.py` ergänzt `log`, `diagnostics` (nur Admin) und `trace`
  (max. 20 Meldungen pro Minute).
- Der Coordinator protokolliert Start, Auswertung, Quellen, Hinweise,
  Konfiguration und Fehler; `services.py` protokolliert Inventar und kennt
  `refresh`.
- Das Frontend zeigt die sechste Ansicht „Protokoll“ mit Filter, Suche,
  Aufklappen, Download, Kopieren und Aktualisierung.
