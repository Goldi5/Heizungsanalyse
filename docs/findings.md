# Hinweise (Findings)

Jedes Finding nennt Regel, Schwere, Messwerte und Zeitfenster. Es ist ein
Hinweis, keine Handlungsanweisung an die Anlage; die Integration steuert
nichts. Fehlen Messwerte, entsteht kein Finding.

Ausgabe: `sensor.heizungsanalyse_findings` (Anzahl, Details als Attribute) und
Ereignis `heizungsanalyse_findings`, wenn sich das Ergebnis aendert.

## Regeln

| ID | Regel | Schwere | Datengrundlage |
|---|---|---|---|
| F01 | Median Ist−Soll-Vorlauf ueber 7 Tage groesser als Schwelle | warning | Stundenstatistik Vorlauf/Soll |
| F02 | Starts pro Tag ueber Schwelle (Aussentemperatur ueber 0 °C) oder Laufzeit je Zyklus unter Schwelle | warning | Zaehler + Tagesproben |
| F03 | Pumpen-Leerlaufanteil eines Kreises ueber Schwelle | warning | Stichproben Pumpe/Verdichter |
| F04 | Raum-Median mehr als Schwelle unter Soll | warning | Stichproben Climate |
| F05 | Raum-Median mehr als Schwelle ueber Soll | warning | Stichproben Climate |
| F06 | Heizstab-Laufzeit pro Tag ueber Schwelle | info | Tagesmittel des Status-Sensors |
| F07 | Zwei gemappte Sensoren liefern identische Tagesmittel (mind. 7 Tage) | info | Tagesmittel |
| F08 | Pflichtquelle laenger als 1 Stunde `unavailable`/`unknown` | warning | Zustand + `last_changed` |
| F09 | Abtau-Stunden pro Tag ueber Schwelle, nur bei 0–7 °C Aussentemperatur | info | Tagesmittel des Status-Sensors |
| F10 | COP weicht mehr als Schwelle von der eigenen Kennlinie ab (ab 7 Tagen) | info | COP-Fenster + Kennlinie |
| F11 | Mischer-Impulse pro Tag eines Kreises ueber Schwelle | info | Stichproben Mischer |
| F12 | Pflichtquelle liefert keine Langzeitstatistik | info | Tagesabfrage |
| F13 | Ersatzstromquelle aktiv oder Abweichung Primaer/Ersatz ueber Schwelle | warning | Tagesmengen |

F09 ist eine Naeherung: die Statistik eines Binaersensors liefert Stunden, keine
Schaltvorgaenge. Deshalb heisst die Regel "Abtau-Stunden", nicht "Abtauungen".

## Schwellen

Standardeinstellungen (Platzhalter, im Optionsdialog aenderbar):

| Feld | Standard |
|---|---|
| `flow_deviation_k` | 5.0 |
| `starts_per_day` | 20.0 |
| `runtime_minutes` | 20.0 |
| `pump_idle_share` | 0.4 |
| `room_deviation_k` | 1.0 |
| `aux_hours_per_day` | 1.0 |
| `defrost_hours_per_day` | 2.0 |
| `cop_curve_deviation` | 0.15 |
| `mixer_pulses_per_day` | 12.0 |
| `power_source_deviation` | 0.15 |

Die Werte sind Startpunkte aus dem Arbeitsauftrag und mit realen Daten zu
kalibrieren. Eine Schwelle zu erhoehen entfernt Hinweise, sie verbessert die
Anlage nicht.

## Texte

Die Hinweistexte liegen zweisprachig in `findings_text.py`, weil Home Assistant
fuer freie Attribute keinen Uebersetzungsplatz in den Strings-Dateien anbietet.
Der Sensor waehlt die Sprache aus `hass.config.language`; unbekannte Sprachen
fallen auf Deutsch zurueck.

## Grenzen

- Kein Finding ohne Messwerte. Fehlt eine Quelle, bleibt die Regel stumm.
- F07 prueft nur identische Tagesmittel, keine sekundengleichen Kurven.
- F10 braucht mindestens sieben COP-Tage und einen belegten Kennlinien-Bin.
- F03/F04/F05/F11 beruhen auf Stichproben im Fuenf-Minuten-Takt.
