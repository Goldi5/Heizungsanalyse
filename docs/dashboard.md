# Dashboard

Die Integration bringt ihr Dashboard selbst mit. Es gibt nichts abzutippen.

## So entsteht es

1. Beim Start liefert die Integration die Datei `heizungsanalyse-card.js` aus
   und trägt sie als Lovelace-Ressource ein (Version und Inhalts-Hash in der
   URL, damit nach einem Update keine alte Fassung im Browser hängt). Im
   YAML-Modus von Lovelace wird sie als Extra-Modul geladen.
2. Öffnet ein **Admin** danach irgendeine Dashboard-Seite, legt die Karte
   einmalig das Dashboard `heizungsanalyse` an (Seitenleiste, Symbol
   Wärmepumpe) und speichert die Strategie `custom:heizungsanalyse`.
3. Die Integration merkt sich, dass das erledigt ist. Wer das Dashboard
   löscht, bekommt es nicht ungefragt zurück. Ein schon vorhandenes Dashboard
   mit dem Pfad `heizungsanalyse` wird nie überschrieben.

Von Hand geht es auch: *Einstellungen → Dashboards → Dashboard hinzufügen →
Neues Dashboard von Grund auf*, dann in der Rohkonfiguration:

```yaml
strategy:
  type: custom:heizungsanalyse
```

Einzelne Ansichten lassen sich als Karte in eigene Dashboards setzen:

```yaml
type: custom:heizungsanalyse-card
view: anlage   # anlage | effizienz | raeume | vergleich | inventar
```

## Ansichten

| Ansicht | Inhalt |
|---|---|
| Anlage | Anlagen-Check 0–100, COP 7/30 Tage, Starts pro Tag, Laufzeit je Zyklus, Vorlauf Ist − Soll (jeweils mit 30-Tage-Verlauf), Hinweise mit Beleg, COP-Kennlinie, Energie, „Was fehlt?“ |
| Effizienz | COP-Verlauf mit Außentemperatur und Änderungsmarken, Heizkurve, Takten nach Außentemperatur, Laufzeit je Zyklus, Abtauen & Heizstab, Warmwasseranteil, Energie – wählbar 30/90/365 Tage |
| Räume & Kreise | Abweichung zum Soll je Raum (Median, p90, Toleranzband), Zeitanteile zu kalt/zu warm, Aufheizzeit, aktuelle Ist-/Soll-Temperatur; je Kreis Pumpe ohne Verdichter und Mischer-Impulse |
| Vorher / Nachher | Eingetragene Änderungen mit 7 Tagen davor/danach (COP, Starts, Zykluslänge, Ø außen) und wetterbereinigtem COP-Effekt; Änderung direkt eintragen |
| Inventar | Pumpen, Thermostate, Hydraulik, zugeordnete Datenquellen, Bericht als Markdown |

## Begriffe

- **Anlagen-Check:** 100 Punkte minus 15 je Warnung und minus 5 je Hinweis.
  Er zählt anschlagende Regeln und ist kein absolutes Effizienzmaß. Unter drei
  Tagen Daten steht „Lernt noch“.
- **COP-Kennlinie:** Gerade durch die Tages-COP-Werte über der
  Außentemperatur (lineare Regression, ab drei Tagen).
- **Wetterbereinigt:** COP nachher minus vorher, abzüglich dessen, was die
  Kennlinie allein durch die andere mittlere Außentemperatur erwarten lässt.
  Eine Näherung – je mehr Tage, desto belastbarer.

## Datenfluss

Das Dashboard holt alle Werte mit einem Websocket-Aufruf
`heizungsanalyse/summary` (alle fünf Minuten neu). Der Aufruf ist rein lesend.
Geschrieben werden nur das eigene Dashboard (einmalig) und – auf Knopfdruck –
ein Eintrag im Änderungsverlauf über den Dienst `heizungsanalyse.log_change`.

## Entwicklung

Quelltext in `frontend/src`, gebaut mit esbuild nach
`custom_components/heizungsanalyse/www/heizungsanalyse-card.js`:

```bash
cd frontend
npm ci
npm test        # Logik, Diagramme, alle Ansichten in DE/EN
npm run build
```

Die CI prüft, dass die gebaute Datei zum Quelltext passt.
