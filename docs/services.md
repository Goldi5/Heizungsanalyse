# Dienste

Alle Dienste schreiben ausschließlich in den integrationseigenen Speicher
(`.storage/heizungsanalyse.<entry_id>`). Keiner ruft eine Aktion auf einer
Fremd-Entity auf; ein Test prüft den Quelltext darauf
(`tests/test_read_only.py`).

Beispiele als YAML oder in *Entwicklerwerkzeuge, Aktionen*.

## `heizungsanalyse.update_inventory`

Stammdaten setzen. Jede tatsächliche Änderung landet automatisch im
Änderungsverlauf; unveränderte Werte werden nicht protokolliert.

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `object` | ja | `pumps.<key>`, `thermostats.<key>` oder `hydraulics` |
| `values` | ja | Feld/Wert-Paare, erlaubte Felder je Bereich |
| `note` | nein | Grund oder Hinweis zur Änderung |

```yaml
action: heizungsanalyse.update_inventory
data:
  object: pumps.hk2
  values:
    manufacturer: Grundfos
    setting: "Stufe 2"
  note: "Nach Hydraulikabgleich 17.11."
```

Erlaubte Felder: `custom_components/heizungsanalyse/const.py`,
`INVENTORY_FIELDS`. Unbekannte Bereiche oder Felder werden mit
`ServiceValidationError` abgelehnt.

Rückgabe: `{"object": "pumps.hk2", "changed": 2}`.

## `heizungsanalyse.log_change`

Freie Änderung dokumentieren, ohne Stammdaten zu setzen. Nützlich, wenn nur
der Zeitpunkt für einen Vorher-Nachher-Vergleich gebraucht wird.

| Feld | Pflicht |
|---|---|
| `object`, `field` | ja |
| `old_value`, `new_value`, `note` | nein |

```yaml
action: heizungsanalyse.log_change
data:
  object: pumps.hk3
  field: setting
  old_value: "Stufe 3"
  new_value: "Stufe 2"
```

Rückgabe: `{"change": {...}}` mit Zeitstempel und fortlaufender Nummer.

## `heizungsanalyse.compare_periods`

Kennzahlen vor und nach einem Stichtag vergleichen. Grundlage sind die
gespeicherten Roll-ups plus die aktuellen Tagesproben; der laufende Tag zählt
nicht mit.

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `days` | nein | Fenstergröße vor und nach dem Stichtag, 1–90, Standard 14 |
| `change_time` | nein | Stichtag; ohne Angabe der neueste Eintrag im Verlauf, sonst heute |

```yaml
action: heizungsanalyse.compare_periods
data:
  days: 14
  change_time: "2026-11-10T00:00:00+01:00"
response_variable: vergleich
```

Rückgabe: `{"comparison": {...}}` mit `before`, `after`, `change_day`,
`window_days` und den Kennzahlen COP, Wärme, Strom, Starts pro Tag und
Laufzeit je Zyklus. Ohne Daten im Fenster: `ServiceValidationError`.

## `heizungsanalyse.export_report`

Bericht aus Kennzahlen, Inventar und Änderungsverlauf erzeugen.

| Feld | Pflicht | Werte |
|---|---|---|
| `format` | nein | `markdown` (Standard) oder `json` |

```yaml
action: heizungsanalyse.export_report
data:
  format: markdown
response_variable: bericht
```

Rückgabe: `{"format": "markdown", "report": "# Heizungsanalyse ..."}`.
Der Bericht enthält keine Entity-Namen und keine UUIDs.

## Ereignisse

| Ereignis | Wann | Nutzlast |
|---|---|---|
| `heizungsanalyse_inventory_changed` | nach jeder echten Inventaränderung | `changes` (Liste) |
| `heizungsanalyse_period_comparison` | nach `compare_periods` | Vergleichsobjekt |

Damit lassen sich Automatisierungen auslösen, ohne die Integration zu
beschreiben (z. B. Benachrichtigung "Pumpe umgestellt, Vergleich in 14 Tagen").

## Weiteres Ereignis

| Ereignis | Wann | Nutzlast |
|---|---|---|
| `heizungsanalyse_findings` | wenn sich das Ergebnis der Findings ändert | `count`, `findings` |

Die Findings selbst stehen am Sensor `sensor.heizungsanalyse_findings`; siehe
[Hinweise](findings.md).
