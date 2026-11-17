# Annahmen und offene Fragen

Stand: 17.11.2026. Diese Datei ist die lebende Liste. Jede Annahme, die noch
nicht belegt ist, steht hier - auch dann, wenn der Code sie schon benutzt.

## 1. Belegte Annahmen (live geprüft am 17.11.2026)

Geprüft wurde die Ist-Instanz über die Home-Assistant-API (nur lesend).

| Annahme | Beleg |
|---|---|
| Ziel-Instanz läuft mit HA 2026.11.1 | `system_info.version` |
| Entity-IDs der WPM/ISG tragen ein Geräte-Präfix `heizkeller_`, z. B. `sensor.heizkeller_stiebel_eltron_wpmsystem_*` | Registry-Abfrage |
| `sensor.stiebel_eltron_isg_total_heating` ist ein Lebenszeitzähler (`state_class: total`, kWh), Wert 57 340 | `ha_get_state` |
| `sensor.stiebel_eltron_isg_total_energy_consumption` ist ebenfalls Lebenszeitzähler (`total`, kWh), Wert 13 938 | `ha_get_state` |
| `sensor.heat_pumps_energy_consumption_<uuid>` ist ein Periodenzähler (`total_increasing`, kWh), Wert 838,9 | `ha_get_state` |
| `sensor.stiebel_eltron_isg_compressor_starts` ist `total` (nicht `total_increasing`), Wert 6 370 | `ha_get_state` |
| Soll-Vorlauf und Ist-Vorlauf weichen aktuell deutlich ab: 25,5 °C gegen 34,9 °C (9,4 K) | `ha_get_state`, gleicher Zeitpunkt |
| `climate.flur_thermostat_tur` besitzt einen Positionssensor | Registry |

Konsequenz: Ein Periodenzähler und ein Lebenszeitzähler dürfen nie ohne
Umrechnung in dieselbe Zeitreihe. Die Analyse arbeitet ausschließlich mit
Deltas aus der Langzeitstatistik und kennzeichnet die Quelle.

## 2. Aus dem Plan übernommene Festlegungen (vom Nutzer bestätigt)

- Heizkreise: **HK1 = Pufferspeicher, HK2 = oben (Heizkörper), HK3 = unten
  (Fußbodenheizung)**. Nie aus Entity-Namen ableiten.
- Bad-Handtuchtrockner unten hängt an HK2.
- Schlafzimmer hat keine Climate-Entity und keine Regelung; es darf keine
  Raum-Findings auslösen.
- Wohnung "Finja Berlin ..." gehört nicht zur Anlage und wird ausgeschlossen.
- Stromquelle: 1KOMMA5GRAD (Heartbeat) ist Primärquelle, ISG-Strom ist
  Fallback und Kreuzvalidierung. Wechsel werden markiert.
- Lizenz MIT, Repo `Goldi5/Heizungsanalyse`, neues Verzeichnis neben
  Raumklima-2.

## 3. Offene Fragen

| Nr. | Frage | Auswirkung | Status |
|---|---|---|---|
| C3-2 | Küche und Wohnzimmer zeigen `unknown` bei den Climate-Entities. Ist das normal? | Raum-Abweichung nicht berechenbar | offen |
| C3-4 | Welche Sollgröße liefert `target_flow_temperature` (Heizkreis- oder Puffer-Soll)? | F01-Schwelle und Vorlauf-Abweichung | offen |
| C3-5 | Sind `isg_flow_temperature`, Puffertemperatur und Rücklauf derselbe Fühler? Gibt es einen echten Rücklauffühler? | Keine Spreizung berechenbar, solange unklar | offen, blockiert nur die Spreizung |
| C3-6 | Wärmepumpen-Modell, Leistung, invertergeregelt? | Einordnung der Kennzahlen | offen |
| C3-7 | Puffervolumen, Hysterese, Soll-Einstellung | Taktungs-Bewertung | offen |
| C3-8 | Pumpen: Hersteller, Typ, Regelart, Stufe, Leistung je Kreis | Pumpen-Leerlauf, Bewertung | offen |
| C3-9 | Thermostattypen je Raum (Livisi vs. Tuya TRV602Z), Ventil-Voreinstellungen | Hydraulischer Abgleich nur indirekt | offen |
| C3-10 | Repo-URL und Name `Goldi5/Heizungsanalyse` bestätigt? | Manifest/README-Links | Vorschlag, noch nicht betätigt |
| C3-11 | HA-Mindestversion für `hacs.json` | Installation | vorläufig 2025.10.0 (siehe unten) |
| C3-12 | Wohnfläche, Baujahr, Heizlast, Auslegungs-Vorlauf | Bezugswerte (kWh/m², Gradtag) | offen, optional |

## 4. Getroffene Arbeitsannahmen (änderbar, im Code konfigurierbar)

1. **HA-Mindestversion 2025.10.0** in `hacs.json`. Die Integration braucht
   keine Dashboard-Strategie; die 2026.5-Untergrenze aus raumklima-2 gilt nur
   für dessen Frontend-Karte. Wird bei Bedarf angehoben.
2. **`integration_type: hub`** im Manifest: eine Analyse-Instanz, kein
   einzelnes Gerät. `iot_class: calculated`, keine `requirements`.
3. **Ein Eintrag pro Anlage.** Mehrere Wohnungen werden im Datenmodell über
   einen Standortbezug abgebildet, nicht über mehrere Config-Einträge. Bis
   M1 ist nur ein Eintrag erlaubt (`unique_id = domain`).
4. **Versionierung:** `0.1.0b0` als Entwicklungsstand; Beta-Suffix `bN` wie in
   raumklima-2, damit das Release-Muster übereinstimmt.
5. **Kein `mypy` in CI**, wie in raumklima-2. `ruff` und `pytest` genügen.
6. **Reine Analyseschicht** importiert kein `homeassistant`. Tests laden sie
   über das synthetische Paket `hz` (Muster aus raumklima-2 mit `rk`).
7. **Schwellen der Findings** sind Platzhalter aus dem Plan und werden erst
   nach realen Daten kalibriert. Bis dahin steht das in `docs/findings.md`.
8. **Fixtures** werden anonymisiert: keine UUIDs, keine Raumnamen, keine
   Standortangaben. Ersatznamen wie `room_a`, `circuit_top`.

## 5. Bekannte Widersprüche in den Daten
- Zwei Pumpen-Entities widersprechen sich zeitweise (`heizkreis_1_pumpe` an,
  `pumpe_hk_1` aus). Beide bleiben getrennt gemappt; F07/F12 melden, statt zu
  raten.
- Verdichter-Laufzeiten (629 h Heizung, 2 676 h Warmwasser) passen nicht zu den
  Wärmemengen. Einheit und Zuordnung sind offen (C3-6 verwandt).
- `heat_pumps_energy_consumption` (838,9 kWh) passt nicht zur Summe der
  Monatsstatistik. Erklärung: Perioden- statt Lebenszeitzähler; endgültig zu
  klären, wenn die Statistik-Historie vorliegt.

## 6. Entscheidungen aus M1

- **Heizkreise und Räume liegen als Listen in `entry.options`** (nicht als
  Config-Subentries). Begründung in `docs/architecture.md`.
- **Pflichtquellen liegen in `entry.data`**, optionale Quellen in
  `entry.options`. Änderungen an den Pflichtquellen laufen über
  `async_step_reconfigure`.
- **Bezeichner** werden beim Anlegen aus dem Namen abgeleitet (Umlaute
  transliteriert, doppelte Namen werden abgelehnt). Ein nachträgliches
  Bearbeiten von Kreisen und Räumen gibt es in M1 noch nicht; es kommt mit dem
  Änderungsverlauf in M3. Bis dahin gilt: entfernen und neu anlegen.
- **Räume ohne Thermostat** (Schlafzimmer, Livisi ohne Ventilposition) sind
  ausdrücklich zulässig und werden als "ohne Regelung" geführt.

## 7. Entscheidungen und Grenzen aus M2

- **Coordinator statt eigenem Listener:** `DataUpdateCoordinator` mit
  5-Minuten-Takt. Die Statistikabfrage ist teuer genug, dass ein fester Takt
  sinnvoll ist, und der Takt passt zur geforderten Zeitfenster-Aggregation.
- **Zwei Auflösungen:** Tageswerte für COP, Taktung und Heizkurve,
  Stundenwerte nur für die Vorlauf-Abweichung (7 Tage).
- **Vorlauf-Abweichung ohne Verdichterstatistik:** Liefert der gemappte
  Verdichter-Status keine Langzeitstatistik (typisch für Text-Sensoren ohne
  `state_class`), wird über alle Stunden gerechnet. Das ist am Sensor als
  `compressor_filtered: false` sichtbar. Es wird nicht behauptet, dass nur
  Laufzeiten eingingen.
- **Stromquellen:** Die Primärquelle gilt, solange sie Tagesdaten liefert;
  sonst die Ersatzquelle. Ist keine Quelle vorhanden, bleibt der COP `unknown`
  und das Attribut `power_source` ist `null`. Die Quelle steht an beiden
  COP-Sensoren.
- **Wärmebegriff:** `heat_entity` ist Heizwärme ohne Warmwasser. Der Strom
  enthält in der Regel Warmwasser. Der COP ist deshalb konservativ; das steht
  so in den Attributen (`heat_kwh`, `power_kwh`) und in der Doku.
- **Zählerstände:** Bei `state_class: total` fehlt `change`; dann wird die
  Differenz der Tagesstände gebildet, inklusive Reset-Erkennung. Der erste Tag
  einer Reihe hat keinen Vorgänger und liefert keinen Verbrauch.
- **Keine Scheinsicherheit:** Fehlt eine Quelle, ist die Kennzahl `unknown`.
  Es werden keine Nullen oder Ersatzwerte eingesetzt.

## 8. Live-Gegenprobe zur Referenz (17.11.2026)

Abruf der Tagesstatistik für 03.–17.11.2026 direkt aus dem Recorder der
Ist-Instanz (nur lesend), Auswertung nach derselben Rechenregel wie die
Integration:

- Heizwärme (Summe der Tagesänderungen, 14 volle Tage): ca. 1 171,9 kWh
- Strom (Heartbeat, gleiche 14 Tage): ca. 324,8 kWh
- **COP ca. 3,61** (Tageswerte ca. 3,2 bis 3,9)

Das liegt unter den ca. 3,8 aus Teil A4. Der Unterschied ist erklärbar und
kein Rechenfehler: A4 nannte einen anderen Zeitraum, und der Strom enthält
Warmwasser, während die Wärme nur Heizung umfasst. Der Referenz-Fixture
bleibt bewusst bei den Planwerten (3,8), weil er die Abnahmebedingung aus M2
abbildet; die Live-Zahl wird hier separat festgehalten.

## 9. Grenzen aus M3

- **Inventar ist manüll.** Die Integration liest keine Gerätedaten aus
  Hersteller-Apps oder Registern; Felder werden über den Dienst gepflegt.
  Fehlende Felder bleiben leer und werden im Bericht als `unbekannt` geführt.
- **Roll-ups sind Tageskörnung.** Feinere Vergleiche (z. B. vor/nach einer
  Änderung am selben Tag) sind erst mit M4/M5 möglich.
- **Der Verlauf ist kein Audit-Log.** Er dokumentiert die vom Nutzer
  gepflegten Änderungen, nicht jede Zustandsänderung einer Entity.

## 10. Grenzen aus M4

- **Stichproben statt Zeitreihe.** Raum- und Kreiswerte beruhen auf dem
  Fünf-Minuten-Takt. Unter- und Überheizungsanteile, Aufheizzeiten und
  Mischer-Impulse sind deshalb Näherungen; schnellere Vorgänge können
  unerkannt bleiben.
- **Fenster im Arbeitsspeicher.** Nach einem Neustart wird es aus dem
  Zustandsverlauf nachgetragen; reicht der Verlauf nicht so weit, bleiben
  Raumhinweise bis zwölf Stunden Daten aus.
- **Keine Aufheizzeit ohne Sollwertsprung.** Räume, in denen das Soll nie
  angehoben wird (oder die dauerhaft aus sind), zeigen `unknown` statt einer
  Zahl.
- **Mischer-Impulse sind ein Untergrenze.** Das Stichprobenraster erkennt keine
  Impulse, die zwischen zwei Läufen beginnen und enden.
- **Livisi ohne Ventilposition.** Raumkennzahlen stützen sich auf Soll/Ist;
  eine Aussage über den hydraulischen Abgleich ist damit nicht möglich.

## 11. Grenzen aus M5

- **Schwellen sind Platzhalter.** Sie stammen aus dem Arbeitsauftrag und sind
  nicht gegen reale Langzeitdaten kalibriert. Ein ruhiger Normalbetrieb ist
  deshalb nicht garantiert; die Zahlen stehen in `docs/findings.md`.
- **F09 zählt Stunden, keine Abtauungen.** Die Statistik eines Binärsensors
  liefert nur Mittelwerte.
- **F07 erkennt nur identische Tagesmittel**, keine deckungsgleichen Kurven und
  keine stundenlang unveränderten Werte.
- **Keine Push-Benachrichtigung, keine Repairs.** Findings sind Sensor und
  Ereignis; was daraus folgt, entscheidet der Nutzer.
- **Texte liegen im Modul**, nicht in den Strings-Dateien, weil Home Assistant
  für freie Attributtexte keinen Übersetzungsplatz bietet.
