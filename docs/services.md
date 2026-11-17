# Dienste

Alle Dienste schreiben ausschliesslich in den integrationseigenen Speicher
(`.storage/heizungsanalyse.<entry_id>`). Keiner ruft eine Aktion auf einer
Fremd-Entity auf; ein Test prüft den Quelltext darauf
(`tests/test_read_only.py`).

Beispiele als YAML oder in *Entwicklerwerkzeuge, Aktionen*.

## `heizungsanalyse.update_inventory`

Stammdaten setzen. Jede tatsaechliche Aenderung landet automatisch im
Aenderungsverlauf; unveraenderte Werte werden nicht protokolliert.

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `object` | ja | `pumps.<key>`, `thermostats.<key>` oder `hydraulics` |
| `values` | ja | Feld/Wert-Paare, erlaubte Felder je Bereich |
| `note` | nein | Grund oder Hinweis zur Aenderung |

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

Rueckgabe: `{"object": "pumps.hk2", "changed": 2}`.

## `heizungsanalyse.log_change`

Freie Aenderung dokumentieren, ohne Stammdaten zu setzen. Nuetzlich, wenn nur
der Zeitpunkt fuer einen Vorher-Nachher-Vergleich gebraucht wird.

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

Rueckgabe: `{"change": {...}}` mit Zeitstempel und fortlaufender Nummer.

## `heizungsanalyse.compare_periods`

Kennzahlen vor und nach einem Stichtag vergleichen. Grundlage sind die
gespeicherten Roll-ups plus die aktuellen Tagesproben; der laufende Tag zaehlt
nicht mit.

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `days` | nein | Fenstergroesse vor und nach dem Stichtag, 1–90, Standard 14 |
| `change_time` | nein | Stichtag; ohne Angabe der neueste Eintrag im Verlauf, sonst heute |

```yaml
action: heizungsanalyse.compare_periods
data:
  days: 14
  change_time: "2026-11-10T00:00:00+01:00"
response_variable: vergleich
```

Rueckgabe: `{"comparison": {...}}` mit `before`, `after`, `change_day`,
`window_days` und den Kennzahlen COP, Waerme, Strom, Starts pro Tag und
Laufzeit je Zyklus. Ohne Daten im Fenster: `ServiceValidationError`.

## `heizungsanalyse.export_report`

Bericht aus Kennzahlen, Inventar und Aenderungsverlauf erzeugen.

| Feld | Pflicht | Werte |
|---|---|---|
| `format` | nein | `markdown` (Standard) oder `json` |

```yaml
action: heizungsanalyse.export_report
data:
  format: markdown
response_variable: bericht
```

Rueckgabe: `{"format": "markdown", "report": "# Heizungsanalyse ..."}`.
Der Bericht enthaelt keine Entity-Namen und keine UUIDs.

## Ereignisse

| Ereignis | Wann | Nutzlast |
|---|---|---|
| `heizungsanalyse_inventory_changed` | nach jeder echten Inventaraenderung | `changes` (Liste) |
| `heizungsanalyse_period_comparison` | nach `compare_periods` | Vergleichsobjekt |

Damit lassen sich Automatisierungen ausloesen, ohne die Integration zu
beschreiben (z. B. Benachrichtigung "Pumpe umgestellt, Vergleich in 14 Tagen").
