# Entities

Alle Entities hängen am Coordinator (fünf Minuten) und am Gerät der
Integration. Räume und Kreise erhalten je ein eigenes Untergerät; dort stehen
nur die zugehörigen Sensoren. Es gibt keinen Schreibzugriff.

## Hauptgerät

| Entity | Einheit | Bedeutung | Attribute |
|---|---|---|---|
| `sensor.<titel>_cop_7_days` | 1 | COP der letzten 7 Tage | `power_source`, `heat_kwh`, `power_kwh`, `days` |
| `sensor.<titel>_cop_30_days` | 1 | COP der letzten 30 Tage | wie oben |
| `sensor.<titel>_starts_per_day` | /d | Verdichterstarts pro Tag | `window_days` |
| `sensor.<titel>_runtime_per_cycle` | min | mittlere Laufzeit je Zyklus | – |
| `sensor.<titel>_flow_deviation` | K | Median Ist−Soll-Vorlauf | `p90`, `hours`, `compressor_filtered` |
| `sensor.<titel>_data_days` | d | Tage mit Wärmedaten (diagnostisch) | – |
| `sensor.<titel>_room_ranking` | 1 | Anzahl bewerteter Räume (diagnostisch) | `rooms`, `by_circuit`, `window_days` |
| `sensor.<titel>_findings` | 1 | Anzahl Hinweise | `warning_count`, `info_count`, `findings`, `thresholds` |

Der Entity-Prefix ist der Titel des Konfigurationseintrags. Er lässt sich in
Home Assistant umbenennen; die `unique_id` bleibt stabil.

## Je Raum

Nur für Räume mit Climate-Entity. Räume ohne Regelung (z. B. Schlafzimmer mit
dauerhaft ausgeschalteter Heizung) bekommen keine Entities.

| Entity | Einheit | Bedeutung | Attribute |
|---|---|---|---|
| `sensor.<raum>_room_deviation` | K | Median Ist−Soll | `median`, `p90`, `under_share`, `over_share`, `samples`, `window_days`, `tolerance_k`, `valve_available` |
| `sensor.<raum>_room_heating_up` | min | Median Aufheizzeit nach Sollwert-Anhebung | `window_days`, `basis` |

`valve_available` ist `false`, wenn keine Ventilposition gemappt ist (Livisi).
Dann wird nur mit Soll und Ist gerechnet.

## Je Kreis

| Entity | Bedingung | Einheit | Bedeutung | Attribute |
|---|---|---|---|---|
| `sensor.<kreis>_pump_idle_share` | Pumpe gemappt | % | Anteil der Pumpenlaufzeit ohne Verdichter | `pump_minutes`, `idle_minutes`, `idle_share`, `samples`, `window_days`, `resolution_minutes` |
| `sensor.<kreis>_mixer_pulses` | Mischer gemappt | /d | Mischer-Impulse pro Tag | `pulses`, `pulses_per_day`, `days`, `resolution_minutes`, `window_days` |

## Ereignisse

| Ereignis | Wann | Nutzlast |
|---|---|---|
| `heizungsanalyse_findings` | Ergebnis der Hinweise geändert | `count`, `findings` |
| `heizungsanalyse_inventory_changed` | Inventar geändert | `changes` |
| `heizungsanalyse_period_comparison` | `compare_periods` gelaufen | Vergleichsobjekt |

## Datenfenster

| Kennzahl | Fenster | Quelle |
|---|---|---|
| COP, Starts, Laufzeit | 7 und 30 Tage | Recorder-Tagesstatistik |
| Vorlauf-Abweichung | 7 Tage | Recorder-Stundenstatistik |
| Raum- und Kreiswerte | 7 Tage | Stichproben im Coordinator-Takt |
| Roll-ups für Vergleiche | bis 400 Tage | eigener Speicher |

Raum- und Kreiswerte leben im Arbeitsspeicher; nach einem Neustart werden die
letzten sieben Tage aus dem Zustandsverlauf nachgetragen. Die Stichprobenzahl an
jedem Sensor zeigt, wie belastbar der Wert gerade ist.
