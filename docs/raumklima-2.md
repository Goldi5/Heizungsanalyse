# Zusammenspiel mit raumklima-2

`raumklima-2` regelt Heizkörperthermostate. Die Heizungsanalyse beobachtet die
Anlage. Beide laufen nebeneinander, ohne Codeabhängigkeit und ohne gemeinsame
Speicher.

## Regeln

1. **Keine Codeabhängigkeit.** Die Heizungsanalyse importiert nichts aus
   `custom_components.raumklima` und registriert dort keine Dienste. Ein Test
   prüft das (`tests/test_isolation.py`).
2. **Keine Steuerung von Raumklima-Geräten.** Die Heizungsanalyse ruft
   keinen Dienst auf, der ein Thermostat, eine Pumpe oder einen Mischer
   stellt. Die einzige Schreibstelle sind Reglerwerte der Wärmepumpe unter
   *Geräte → Regler einstellen* (nur Admins, doppelte Bestätigung).
3. **Getrennte Speicher.** Inventar und Roll-ups liegen unter
   `.storage/heizungsanalyse.<entry_id>`. raumklima-2 hat eigene Daten.
4. **Gemeinsame Entities nur lesend.** raumklima-2 kann die Sensoren der
   Heizungsanalyse wie normale Entities lesen. Umgekehrt ist keine
   raumklima-Entity Pflicht; die Integration funktioniert ohne raumklima-2.
5. **Ein Eintrag je Anlage.** Die Heizungsanalyse erlaubt genau einen Eintrag.
   Für die Berliner Wohnung aus raumklima-2 („Mehrere Wohnungen“) gilt sie
   nicht; deren Entities werden nicht gemappt.

## Was raumklima-2 lesen kann

Alle Werte sind Anlagenkennzahlen, keine Raumregelung:

| Entity | Einheit | Bedeutung |
|---|---|---|
| `sensor.<titel>_cop_7_days`, `_cop_30_days` | 1 | COP, Attribut `power_source` |
| `sensor.<titel>_starts_per_day` | /d | Verdichterstarts |
| `sensor.<titel>_runtime_per_cycle` | min | Laufzeit je Zyklus |
| `sensor.<titel>_flow_deviation` | K | Vorlauf-Abweichung |
| `sensor.<titel>_findings` | 1 | Hinweise mit `findings`-Liste |
| `sensor.<raum>_room_deviation` | K | Raum-Abweichung, `valve_available` |
| `sensor.<kreis>_pump_idle_share` | % | Leerlaufanteil der Kreispumpe |

Beispiel: eine raumklima-Automation reagiert auf einen neuen Anlagenhinweis,
ohne selbst zu rechnen:

```yaml
triggers:
  - trigger: state
    entity_id: sensor.heizungsanalyse_findings
conditions:
  - condition: template
    value_template: "{{ trigger.to_state.state | int > 0 }}"
actions:
  - action: persistent_notification.create
    data:
      title: Heizungsanalyse
      message: >-
        {{ state_attr('sensor.heizungsanalyse_findings', 'findings')
           | map(attribute='text') | join(' / ') }}
```

Das ist reine Anzeige. Keine Aktion an der Anlage.

## Was die Heizungsanalyse nicht doppelt baut

| Thema in raumklima-2 | Übernahme |
|---|---|
| Heizbericht (Heizstunden, wetterbereinigter Vergleich) | bleibt dort; die Heizungsanalyse liefert COP und Taktung der Anlage |
| Heizsaison und Heizgrenze | bleibt dort; die Heizungsanalyse nutzt nur die Außentemperatur |
| Gelernte Aufheizzeit je Raum | bleibt dort. Die Heizungsanalyse misst Aufheizzeit nur als Kontrollwert je Raum, ohne Regelung |
| Gesundheitscheck („Raum wird nicht warm“) | bleibt dort (Ereignis `raumklima_event`, Typ `health`). Die Heizungsanalyse meldet F04/F05 als 7-Tage-Median |
| Mehrere Wohnungen | bleibt dort; die Heizungsanalyse kennt nur die Anlage am Standort |

## Empfohlene Aufteilung

- **raumklima-2** entscheidet, wann und wie warm geheizt wird.
- **Heizungsanalyse** sagt, ob die Anlage dafür effizient läuft (COP,
  Takten, Vorlauf, Pumpen, Mischer) und wo Hinweise mit Beleg stehen.
- Beide Ereignisse dürfen nebeneinander existieren. Wer beides auswertet,
  sollte in Automatisierungen den Auslöser nennen
  (`raumklima_event` gegen `heizungsanalyse_findings`), damit die Quelle klar
  bleibt.

## Prüfung

```bash
.venv/bin/pytest tests/test_isolation.py tests/test_read_only.py -q -p no:logging
```

Der Test schlägt fehl, sobald die Integration raumklima-Code importiert,
fremde Dienste aufruft oder Entity-IDs fest verdrahtet.
