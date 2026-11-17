# Annahmen und offene Fragen

Stand: 17.11.2026. Diese Datei ist die lebende Liste. Jede Annahme, die noch
nicht belegt ist, steht hier - auch dann, wenn der Code sie schon benutzt.

## 1. Belegte Annahmen (live geprueft am 17.11.2026)

Geprueft wurde die Ist-Instanz ueber die Home-Assistant-API (nur lesend).

| Annahme | Beleg |
|---|---|
| Ziel-Instanz laeuft mit HA 2026.11.1 | `system_info.version` |
| Entity-IDs der WPM/ISG tragen ein Geraete-Praefix `heizkeller_`, z. B. `sensor.heizkeller_stiebel_eltron_wpmsystem_*` | Registry-Abfrage |
| `sensor.stiebel_eltron_isg_total_heating` ist ein Lebenszeitzähler (`state_class: total`, kWh), Wert 57 340 | `ha_get_state` |
| `sensor.stiebel_eltron_isg_total_energy_consumption` ist ebenfalls Lebenszeitzähler (`total`, kWh), Wert 13 938 | `ha_get_state` |
| `sensor.heat_pumps_energy_consumption_<uuid>` ist ein Periodenzähler (`total_increasing`, kWh), Wert 838,9 | `ha_get_state` |
| `sensor.stiebel_eltron_isg_compressor_starts` ist `total` (nicht `total_increasing`), Wert 6 370 | `ha_get_state` |
| Soll-Vorlauf und Ist-Vorlauf weichen aktuell deutlich ab: 25,5 °C gegen 34,9 °C (9,4 K) | `ha_get_state`, gleicher Zeitpunkt |
| `climate.flur_thermostat_tur` besitzt einen Positionssensor | Registry |

Konsequenz: Ein Periodenzähler und ein Lebenszeitzähler duerfen nie ohne
Umrechnung in dieselbe Zeitreihe. Die Analyse arbeitet ausschliesslich mit
Deltas aus der Langzeitstatistik und kennzeichnet die Quelle.

## 2. Aus dem Plan uebernommene Festlegungen (vom Nutzer bestaetigt)

- Heizkreise: **HK1 = Pufferspeicher, HK2 = oben (Heizkörper), HK3 = unten
  (Fussbodenheizung)**. Nie aus Entity-Namen ableiten.
- Bad-Handtuchtrockner unten haengt an HK2.
- Schlafzimmer hat keine Climate-Entity und keine Regelung; es darf keine
  Raum-Findings ausloesen.
- Wohnung "Finja Berlin ..." gehoert nicht zur Anlage und wird ausgeschlossen.
- Stromquelle: 1KOMMA5GRAD (Heartbeat) ist Primaerquelle, ISG-Strom ist
  Fallback und Kreuzvalidierung. Wechsel werden markiert.
- Lizenz MIT, Repo `Goldi5/Heizungsanalyse`, neues Verzeichnis neben
  Raumklima-2.

## 3. Offene Fragen

| Nr. | Frage | Auswirkung | Status |
|---|---|---|---|
| C3-2 | Kueche und Wohnzimmer zeigen `unknown` bei den Climate-Entities. Ist das normal? | Raum-Abweichung nicht berechenbar | offen |
| C3-4 | Welche Sollgroesse liefert `target_flow_temperature` (Heizkreis- oder Puffer-Soll)? | F01-Schwelle und Vorlauf-Abweichung | offen |
| C3-5 | Sind `isg_flow_temperature`, Puffertemperatur und Ruecklauf derselbe Fuehler? Gibt es einen echten Ruecklauffuehler? | Keine Spreizung berechenbar, solange unklar | offen, blockiert nur die Spreizung |
| C3-6 | Waermepumpen-Modell, Leistung, invertergeregelt? | Einordnung der Kennzahlen | offen |
| C3-7 | Puffervolumen, Hysterese, Soll-Einstellung | Taktungs-Bewertung | offen |
| C3-8 | Pumpen: Hersteller, Typ, Regelart, Stufe, Leistung je Kreis | Pumpen-Leerlauf, Bewertung | offen |
| C3-9 | Thermostattypen je Raum (Livisi vs. Tuya TRV602Z), Ventil-Voreinstellungen | Hydraulischer Abgleich nur indirekt | offen |
| C3-10 | Repo-URL und Name `Goldi5/Heizungsanalyse` bestaetigt? | Manifest/README-Links | Vorschlag, noch nicht betaetigt |
| C3-11 | HA-Mindestversion fuer `hacs.json` | Installation | vorlaeufig 2025.10.0 (siehe unten) |
| C3-12 | Wohnflaeche, Baujahr, Heizlast, Auslegungs-Vorlauf | Bezugswerte (kWh/m², Gradtag) | offen, optional |

## 4. Getroffene Arbeitsannahmen (aenderbar, im Code konfigurierbar)

1. **HA-Mindestversion 2025.10.0** in `hacs.json`. Die Integration braucht
   keine Dashboard-Strategie; die 2026.5-Untergrenze aus raumklima-2 gilt nur
   fuer dessen Frontend-Karte. Wird bei Bedarf angehoben.
2. **`integration_type: hub`** im Manifest: eine Analyse-Instanz, kein
   einzelnes Geraet. `iot_class: calculated`, keine `requirements`.
3. **Ein Eintrag pro Anlage.** Mehrere Wohnungen werden im Datenmodell ueber
   einen Standortbezug abgebildet, nicht ueber mehrere Config-Eintraege. Bis
   M1 ist nur ein Eintrag erlaubt (`unique_id = domain`).
4. **Versionierung:** `0.1.0b0` als Entwicklungsstand; Beta-Suffix `bN` wie in
   raumklima-2, damit das Release-Muster uebereinstimmt.
5. **Kein `mypy` in CI**, wie in raumklima-2. `ruff` und `pytest` genuegen.
6. **Reine Analyseschicht** importiert kein `homeassistant`. Tests laden sie
   ueber das synthetische Paket `hz` (Muster aus raumklima-2 mit `rk`).
7. **Schwellen der Findings** sind Platzhalter aus dem Plan und werden erst
   nach realen Daten kalibriert. Bis dahin steht das in `docs/findings.md`.
8. **Fixtures** werden anonymisiert: keine UUIDs, keine Raumnamen, keine
   Standortangaben. Ersatznamen wie `room_a`, `circuit_top`.

## 5. Bekannte Widersprueche in den Daten
- Zwei Pumpen-Entities widersprechen sich zeitweise (`heizkreis_1_pumpe` an,
  `pumpe_hk_1` aus). Beide bleiben getrennt gemappt; F07/F12 melden, statt zu
  raten.
- Verdichter-Laufzeiten (629 h Heizung, 2 676 h Warmwasser) passen nicht zu den
  Waermemengen. Einheit und Zuordnung sind offen (C3-6 verwandt).
- `heat_pumps_energy_consumption` (838,9 kWh) passt nicht zur Summe der
  Monatsstatistik. Erklaerung: Perioden- statt Lebenszeitzähler; endgueltig zu
  klaeren, wenn die Statistik-Historie vorliegt.

## 6. Entscheidungen aus M1

- **Heizkreise und Raeume liegen als Listen in `entry.options`** (nicht als
  Config-Subentries). Begruendung in `docs/architecture.md`.
- **Pflichtquellen liegen in `entry.data`**, optionale Quellen in
  `entry.options`. Aenderungen an den Pflichtquellen laufen ueber
  `async_step_reconfigure`.
- **Bezeichner** werden beim Anlegen aus dem Namen abgeleitet (Umlaute
  transliteriert, doppelte Namen werden abgelehnt). Ein nachtraegliches
  Bearbeiten von Kreisen und Raeumen gibt es in M1 noch nicht; es kommt mit dem
  Aenderungsverlauf in M3. Bis dahin gilt: entfernen und neu anlegen.
- **Raeume ohne Thermostat** (Schlafzimmer, Livisi ohne Ventilposition) sind
  ausdruecklich zulaessig und werden als "ohne Regelung" gefuehrt.

## 7. Entscheidungen und Grenzen aus M2

- **Coordinator statt eigenem Listener:** `DataUpdateCoordinator` mit
  5-Minuten-Takt. Die Statistikabfrage ist teuer genug, dass ein fester Takt
  sinnvoll ist, und der Takt passt zur geforderten Zeitfenster-Aggregation.
- **Zwei Aufloesungen:** Tageswerte fuer COP, Taktung und Heizkurve,
  Stundenwerte nur fuer die Vorlauf-Abweichung (7 Tage).
- **Vorlauf-Abweichung ohne Verdichterstatistik:** Liefert der gemappte
  Verdichter-Status keine Langzeitstatistik (typisch fuer Text-Sensoren ohne
  `state_class`), wird ueber alle Stunden gerechnet. Das ist am Sensor als
  `compressor_filtered: false` sichtbar. Es wird nicht behauptet, dass nur
  Laufzeiten eingingen.
- **Stromquellen:** Die Primaerquelle gilt, solange sie Tagesdaten liefert;
  sonst die Ersatzquelle. Ist keine Quelle vorhanden, bleibt der COP `unknown`
  und das Attribut `power_source` ist `null`. Die Quelle steht an beiden
  COP-Sensoren.
- **Waermebegriff:** `heat_entity` ist Heizwaerme ohne Warmwasser. Der Strom
  enthaelt in der Regel Warmwasser. Der COP ist deshalb konservativ; das steht
  so in den Attributen (`heat_kwh`, `power_kwh`) und in der Doku.
- **Zaehlerstaende:** Bei `state_class: total` fehlt `change`; dann wird die
  Differenz der Tagesstaende gebildet, inklusive Reset-Erkennung. Der erste Tag
  einer Reihe hat keinen Vorgaenger und liefert keinen Verbrauch.
- **Keine Scheinsicherheit:** Fehlt eine Quelle, ist die Kennzahl `unknown`.
  Es werden keine Nullen oder Ersatzwerte eingesetzt.

## 8. Live-Gegenprobe zur Referenz (17.11.2026)

Abruf der Tagesstatistik fuer 03.–17.11.2026 direkt aus dem Recorder der
Ist-Instanz (nur lesend), Auswertung nach derselben Rechenregel wie die
Integration:

- Heizwaerme (Summe der Tagesaenderungen, 14 volle Tage): ca. 1 171,9 kWh
- Strom (Heartbeat, gleiche 14 Tage): ca. 324,8 kWh
- **COP ca. 3,61** (Tageswerte ca. 3,2 bis 3,9)

Das liegt unter den ca. 3,8 aus Teil A4. Der Unterschied ist erklaerbar und
kein Rechenfehler: A4 nannte einen anderen Zeitraum, und der Strom enthaelt
Warmwasser, waehrend die Waerme nur Heizung umfasst. Der Referenz-Fixture
bleibt bewusst bei den Planwerten (3,8), weil er die Abnahmebedingung aus M2
abbildet; die Live-Zahl wird hier separat festgehalten.

## 9. Grenzen aus M3

- **Inventar ist manuell.** Die Integration liest keine Geraetedaten aus
  Hersteller-Apps oder Registern; Felder werden ueber den Dienst gepflegt.
  Fehlende Felder bleiben leer und werden im Bericht als `unbekannt` gefuehrt.
- **Roll-ups sind Tageskoernung.** Feinere Vergleiche (z. B. vor/nach einer
  Aenderung am selben Tag) sind erst mit M4/M5 moeglich.
- **Der Verlauf ist kein Audit-Log.** Er dokumentiert die vom Nutzer
  gepflegten Aenderungen, nicht jede Zustandsaenderung einer Entity.

## 10. Grenzen aus M4

- **Stichproben statt Zeitreihe.** Raum- und Kreiswerte beruhen auf dem
  Fuenf-Minuten-Takt. Unter- und Ueberheizungsanteile, Aufheizzeiten und
  Mischer-Impulse sind deshalb Naeherungen; schnellere Vorgaenge koennen
  unerkannt bleiben.
- **Fenster im Arbeitsspeicher.** Nach einem Neustart von Home Assistant sind
  die Raum- und Kreiswerte fuer einige Laeufe `unknown`. Tageskennzahlen aus
  M2/M3 bleiben davon unberuehrt.
- **Keine Aufheizzeit ohne Sollwertsprung.** Raeume, in denen das Soll nie
  angehoben wird (oder die dauerhaft aus sind), zeigen `unknown` statt einer
  Zahl.
- **Mischer-Impulse sind ein Untergrenze.** Das Stichprobenraster erkennt keine
  Impulse, die zwischen zwei Laeufen beginnen und enden.
- **Livisi ohne Ventilposition.** Raumkennzahlen stuetzen sich auf Soll/Ist;
  eine Aussage ueber den hydraulischen Abgleich ist damit nicht moeglich.
