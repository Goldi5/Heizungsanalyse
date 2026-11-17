# Heizungsanalyse

Home-Assistant-Custom-Integration zur **reinen Beobachtung und Auswertung**
einer Waermepumpenheizung. Sie liest vorhandene Entities und
Recorder-Statistiken, berechnet Kennzahlen (COP, Taktung, Vorlauf-Abweichung,
Raumkomfort, Pumpen- und Mischerverhalten) und leitet Hinweise mit Beleg ab.

**Die Integration steuert nichts.** Es gibt keinen Schreibzugriff auf
Waermepumpe, Heizkreise, Thermostate oder Pumpen. Der einzige Schreibpfad ist
das integrationseigene Inventar (Stammdaten, Aenderungsverlauf, Roll-ups); ein
Test prueft den Quelltext auf steuernde Aufrufe.

## Status

Frueher Entwicklungsstand, alle Analysestufen vorhanden: Repo-Geruest (M0),
Einrichtung (M1), Kennzahlen (M2), Inventar und Dienste (M3), Raum- und
Kreisanalyse (M4), Findings (M5) sowie Doku und Dashboard-Beispiel (M6). Ein
GitHub-Release steht noch aus, weil das Repo bisher kein Remote hat.

| Phase | Inhalt | Stand |
|---|---|---|
| M0 | Repo-Geruest, CI, leere Integration | erledigt |
| M1 | Config-Flow, Entity-Mapping, Kreis- und Raum-Modell | erledigt |
| M2 | Kennzahlen (COP, Starts, Laufzeit, Vorlauf) | erledigt |
| M3 | Geraeteinventar, Aenderungsverlauf, Services | erledigt |
| M4 | Raum- und Kreisanalyse | erledigt |
| M5 | Findings-Engine | erledigt |
| M6 | Doku, Dashboard-Beispiel, Release 0.1.0 | Doku erledigt, Release offen |
| M7 | Zusammenspiel mit raumklima-2 | offen |

## Voraussetzungen

- Home Assistant ab 2025.10 (siehe `hacs.json`).
- Recorder mit Langzeitstatistik fuer die gemappten Zaehler (Standard).
- Quellen: WP-Strom (kWh), WP-Heizwaerme (kWh), Aussentemperatur,
  Verdichter-Status. Alles Weitere ist optional.

## Installation (HACS, benutzerdefiniertes Repository)

1. HACS oeffnen, Integrationen, Drei-Punkte-Menue, *Benutzerdefinierte
   Repositories*.
2. URL dieses Repositories eintragen, Kategorie *Integration*.
3. Installieren und Home Assistant neu starten.
4. *Einstellungen, Geraete und Dienste, Integration hinzufuegen,
   Heizungsanalyse*.

Ohne HACS: Ordner `custom_components/heizungsanalyse` nach
`config/custom_components/` kopieren und neu starten.

## Einrichtung

1. **Pflichtquellen** im Einrichtungsdialog waehlen: Strom, Heizwaerme,
   Aussentemperatur, Verdichter-Status. Einheit, Geraeteklasse und Verfuegbarkeit
   werden geprueft; unpassende Entities werden abgelehnt.
2. **Optionen** (*Konfigurieren*): Ersatzstromquelle, Warmwasserwaerme,
   Vorlauf/Soll-Vorlauf, Ruecklauf, Puffer, Abtauung, Heizstab,
   Verdichterstarts und -laufzeit.
3. **Heizkreise** anlegen: Name, Typ, optional Ist-Temperatur, Pumpe, Mischer.
4. **Raeume** anlegen: Name, Kreis, optional Climate-Entity und Ventilposition.
   Die Zuordnung Kreis zu Raum bestaetigt immer der Nutzer; die Integration
   raet sie nie aus Entity-Namen. Raeume ohne Regelung (Heizung dauerhaft aus)
   werden ohne Climate-Entity angelegt und loesen keine Raumhinweise aus.
5. **Schwellen** der Hinweise pruefen (*Konfigurieren, Schwellen der Hinweise*).

Die Zuordnung der Pflichtquellen laesst sich ueber *Neu konfigurieren*
aendern.

## Entities, Dienste, Hinweise

- [Entities](docs/entities.md): Sensoren, Attribute, Datenfenster.
- [Dienste](docs/services.md): Inventar pflegen, Zeitraeume vergleichen,
  Bericht exportieren.
- [Hinweise](docs/findings.md): Regeln F01 bis F13, Schwellen, Grenzen.
- [Dashboard-Beispiel](docs/dashboard-example.yaml).

## Grenzen

- Hinweise ersetzen keine Fachbetrieb-Beratung und keine
  Herstellerdokumentation.
- Ohne ausreichende Datenbasis gibt die Integration `unknown` aus statt zu
  schaetzen. Fehlende Quellen erzeugen keine Kennzahl und kein Finding.
- Kennlinien (COP gegen Aussentemperatur, Heizkurve) fuellen sich erst ueber
  eine Heizperiode.
- Raum- und Kreiswerte sind Stichproben im Fuenf-Minuten-Takt und leben im
  Arbeitsspeicher; nach einem Neustart fuellen sie sich neu.
- Livisi-Thermostate liefern keine Ventilposition. Raumkennzahlen nutzen dann
  nur Soll und Ist; ein hydraulischer Abgleich laesst sich damit nicht
  nachweisen.

## Datenschutz

Keine Klarnamen, UUIDs oder Standortdaten in Code, Tests, Fixtures oder
Diagnostics. Diagnostics enthaelt nur Zaehler, Domaenen und Kennzahlen; siehe
`custom_components/heizungsanalyse/diagnostics.py`.

## Entwicklung

```bash
python3.13 -m venv .venv
.venv/bin/pip install -r requirements_test.txt
.venv/bin/ruff check custom_components tests
.venv/bin/ruff format --check custom_components tests
.venv/bin/pytest tests -q -p no:logging
```

CI fuehrt zusaetzlich `hassfest` und die HACS-Validierung aus
(`.github/workflows/validate.yml`). Beide brauchen das GitHub-Repo.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
