# Heizungsanalyse

Home-Assistant-Custom-Integration zur **reinen Beobachtung und Auswertung**
einer Waermepumpenheizung. Sie liest vorhandene Entities und
Recorder-Statistiken, berechnet Kennzahlen (COP, Taktung, Vorlauf-Abweichung,
Raumkomfort, Pumpen- und Mischerverhalten) und leitet Hinweise mit Beleg ab.

**Die Integration steuert nichts.** Es gibt keinen Schreibzugriff auf
Waermepumpe, Heizkreise, Thermostate oder Pumpen.

## Status

Frueher Entwicklungsstand. Vorhanden sind das Repo-Geruest (M0), die
Einrichtung (M1), die ersten Kennzahlen (M2), das Geraeteinventar mit
Aenderungsverlauf und Diensten (M3) sowie die Raum- und Kreisanalyse (M4).

| Phase | Inhalt | Stand |
|---|---|---|
| M0 | Repo-Geruest, CI, leere Integration | erledigt |
| M1 | Config-Flow, Entity-Mapping, Kreis- und Raum-Modell | erledigt |
| M2 | Kennzahlen (COP, Starts, Laufzeit, Vorlauf) | erledigt |
| M3 | Geraeteinventar, Aenderungsverlauf, Services | erledigt |
| M4 | Raum- und Kreisanalyse | erledigt |
| M5 | Findings-Engine | offen |
| M6 | Doku, Dashboard-Beispiel, Release 0.1.0 | offen |
| M7 | Zusammenspiel mit raumklima-2 | offen |

## Installation (HACS, benutzerdefiniertes Repository)

1. HACS oeffnen, Integrationen, Drei-Punkte-Menue, *Benutzerdefinierte
   Repositories*.
2. URL dieses Repositories eintragen, Kategorie *Integration*.
3. Installieren und Home Assistant neu starten.
4. *Einstellungen, Geraete und Dienste, Integration hinzufuegen,
   Heizungsanalyse*.

## Dokumentation

- [Annahmen und offene Fragen](docs/assumptions.md)
- [Architektur](docs/architecture.md)
- [Dienste](docs/services.md)

## Grenzen

- Hinweise ersetzen keine Fachbetrieb-Beratung und keine
  Herstellerdokumentation.
- Ohne ausreichende Datenbasis gibt die Integration `unknown` aus statt zu
  schaetzen.
- Kennlinien (COP gegen Aussentemperatur, Heizkurve) fuellen sich erst ueber
  eine Heizperiode.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
