// Erklärungen hinter den kleinen „?“ an jeder Kachel.
import { getLang } from "./i18n.js";

const HELP = {
  score: {
    de: "Ein einfacher Gesamtwert: 100 Punkte, minus 15 je Warnung und minus 5 je Hinweis. Er sagt nur, wie viele Regeln anschlagen – nicht, wie effizient die Anlage absolut ist. In den ersten Tagen steht „Lernt noch“.",
    en: "A simple overall value: 100 points, minus 15 per warning and minus 5 per note. It only reflects how many rules fire – not how efficient the system is in absolute terms. The first days show “still learning”.",
  },
  cop: {
    de: "COP = erzeugte Wärme ÷ verbrauchter Strom. 4,5 heißt: aus 1 kWh Strom wurden 4,5 kWh Wärme. Gezeigt wird der Wert der letzten 7 Tage, daneben 30 Tage. Bei Kälte sinkt der COP – das ist normal.",
    en: "COP = heat produced ÷ electricity used. 4.5 means 1 kWh of power became 4.5 kWh of heat. Shown is the last 7 days, next to it 30 days. COP drops in cold weather – that is normal.",
  },
  starts: {
    de: "Wie oft der Verdichter am Tag anspringt (Mittel über 7 Tage). Viele kurze Starts („Takten“) kosten Effizienz und Lebensdauer. Die rote Linie ist deine eingestellte Schwelle.",
    en: "How often the compressor starts per day (7-day mean). Many short starts (“cycling”) cost efficiency and lifetime. The red line is your threshold.",
  },
  runtime: {
    de: "Mittlere Laufzeit je Verdichterstart. Länger ist besser: unter etwa 20 Minuten läuft die Wärmepumpe meist im ineffizienten Anlaufbereich.",
    en: "Mean run time per compressor start. Longer is better: below about 20 minutes the heat pump mostly runs in its inefficient start-up phase.",
  },
  flow: {
    de: "Median aus Ist-Vorlauf minus Soll-Vorlauf, nur während der Verdichter läuft. Positiv heißt: wärmer als nötig – die Heizkurve ist vermutlich zu hoch oder ein Mischer regelt schlecht. Jedes Kelvin weniger Vorlauf bringt grob 2–3 % COP.",
    en: "Median of actual minus target flow temperature, only while the compressor runs. Positive means warmer than needed – the heating curve is probably too high or a mixer controls poorly. Each kelvin less flow gains roughly 2–3 % COP.",
  },
  findings: {
    de: "Jeder Hinweis stammt aus einer festen Regel (F01–F13) und nennt den Beleg: Zeitraum, Messwerte, Schwelle. Warnungen zuerst. Die Integration greift nie selbst ein – sie sagt nur, wo sich Hinsehen lohnt.",
    en: "Each finding comes from a fixed rule (F01–F13) and states its evidence: period, values, threshold. Warnings first. The integration never intervenes – it only tells you where to look.",
  },
  copcurve: {
    de: "Jeder Punkt ist ein Tag: Tages-COP über der mittleren Außentemperatur. Die grüne Linie ist der Trend deiner eigenen Anlage. Liegt der heutige Punkt deutlich darunter, lief etwas schlechter als sonst bei diesem Wetter.",
    en: "Each dot is a day: daily COP against mean outdoor temperature. The green line is your own system's trend. If today's dot is clearly below it, something ran worse than usual for this weather.",
  },
  energy: {
    de: "Tägliche Heizwärme und Stromverbrauch der Wärmepumpe, dazu Warmwasser, falls ein Zähler zugeordnet ist. Die Lücke zwischen Wärme und Strom ist die „kostenlose“ Umweltwärme.",
    en: "Daily heat and heat-pump power, plus hot water if a meter is mapped. The gap between heat and power is the “free” ambient heat.",
  },
  copline: {
    de: "Tages-COP (grün) und Außentemperatur (blau, rechte Achse). Senkrechte Striche markieren eingetragene Änderungen – so siehst du, ob danach etwas besser wurde.",
    en: "Daily COP (green) and outdoor temperature (blue, right axis). Vertical lines mark logged changes – so you can see whether something improved afterwards.",
  },
  curve: {
    de: "Tagesmittel von Ist- und Soll-Vorlauf über der Außentemperatur. Liegt Ist dauerhaft über Soll, heizt die Anlage wärmer als die Kurve verlangt. Eine flachere Kurve (niedriger) spart am meisten.",
    en: "Daily mean of actual and target flow vs outdoor temperature. If actual stays above target, the system heats warmer than the curve demands. A flatter (lower) curve saves the most.",
  },
  cycling: {
    de: "Mittlere Verdichterstarts pro Tag, sortiert nach Außentemperatur. Typisch: In der Übergangszeit (5–15 °C) taktet eine Wärmepumpe am meisten, weil wenig Wärme gebraucht wird. Rot = über deiner Schwelle.",
    en: "Mean compressor starts per day, grouped by outdoor temperature. Typical: in shoulder season (5–15 °C) a heat pump cycles most because little heat is needed. Red = above your threshold.",
  },
  cycle: {
    de: "Mittlere Minuten je Verdichterstart pro Tag. Steigt die Kurve, laufen die Zyklen länger – gut.",
    en: "Mean minutes per compressor start per day. A rising line means longer cycles – good.",
  },
  defrost: {
    de: "Stunden pro Tag mit Abtauung bzw. Heizstab. Abtauen ist bei 0–7 °C und feuchter Luft normal. Ein Heizstab, der regelmäßig läuft, kostet viel Strom – Einsatzgrenzen prüfen.",
    en: "Hours per day with defrost or aux heater. Defrost is normal at 0–7 °C and humid air. An aux heater that runs regularly costs a lot of power – check its limits.",
  },
  rooms: {
    de: "Je Raum der Median aus Ist minus Soll über 7 Tage (Stichproben alle 5 Minuten). Der Balken zeigt die Richtung: links zu kalt, rechts zu warm. Darunter die Anteile der Zeit außerhalb der Toleranz und die typische Aufheizzeit nach einer Sollwert-Anhebung.",
    en: "Per room the median of actual minus target over 7 days (sampled every 5 minutes). The bar shows the direction: left too cold, right too warm. Below: share of time outside tolerance and the typical heat-up time after a setpoint increase.",
  },
  circuits: {
    de: "Je Heizkreis: Anteil der Pumpenlaufzeit, in der der Verdichter aus war (Pumpe läuft „umsonst“), und wie oft der Mischer pro Tag stellt. Nur sichtbar, wenn Pumpe bzw. Mischer zugeordnet sind.",
    en: "Per circuit: share of pump run time while the compressor was off (pump runs “for nothing”) and how often the mixer moves per day. Only shown if pump or mixer is mapped.",
  },
  changes: {
    de: "Trag jede Einstellungsänderung ein (Heizkurve, Pumpenstufe, Abgleich …). Verglichen werden die 7 Tage davor mit den 7 Tagen danach. „Wetterbereinigt“ zieht ab, was allein die andere Außentemperatur am COP ändern würde – laut deiner eigenen Kennlinie.",
    en: "Log every settings change (heating curve, pump stage, balancing …). The 7 days before are compared with the 7 days after. “Weather-adjusted” subtracts what the different outdoor temperature alone would change in COP – according to your own curve.",
  },
  inventory: {
    de: "Stammdaten deiner Anlage: Pumpen, Thermostate, Hydraulik. Pflege sie über den Dienst „Heizungsanalyse: Inventar aktualisieren“ – jede Änderung landet automatisch im Verlauf.",
    en: "Master data of your system: pumps, thermostats, hydraulics. Maintain it via the service “Heating analysis: update inventory” – every change lands in the history automatically.",
  },
  system: {
    de: "Der Systemstatus zeigt, welche Version die Karte und welche das Backend hat, wann der letzte Lauf war und ob ein Fehler auftrat. Die Karte meldet eigene Fehler selbst mit – dann steht hier die gekürzte Meldung statt einer stillen Fehlfunktion.",
    en: "System status shows which version the card and the backend have, when the last run happened and whether an error occurred. The card reports its own errors itself – then the shortened message appears here instead of a silent failure.",
  },
  sources_check: {
    de: "Für jede zugeordnete Quelle: Zustand, Einheit, Anzahl Statistikzeilen und letzter Wert. Grün heißt auswertbar. „Keine Statistik“ bedeutet: Sensor ohne Langzeitdaten – dann rechnet die Integration nicht. „Unpassend“ nennt die Abweichung; der Tipp darunter sagt, was zu tun ist.",
    en: "For every mapped source: state, unit, number of statistics rows and last value. Green means usable. “No statistics” means a sensor without long-term data – the integration will not calculate. “Mismatched” names the deviation; the hint below says what to do.",
  },
  log: {
    de: "Das Protokoll hält Start, Auswertung, Quellen, Hinweise, Konfiguration, Inventar, Dashboard und Kartenfehler fest. Höchstens 2000 Einträge oder 30 Tage. Einträge lassen sich nach Kategorie, Stufe und Text filtern, nach Tag gruppiert aufklappen und als JSON exportieren.",
    en: "The log keeps start, analysis, sources, findings, configuration, inventory, dashboard and card errors. At most 2000 entries or 30 days. Entries can be filtered by category, level and text, grouped by day, expanded and exported as JSON.",
  },
  sources: {
    de: "Welche Sensoren zugeordnet sind. Fehlende optionale Sensoren schalten Auswertungen nicht frei – ergänzen lässt sich das unter Konfigurieren.",
    en: "Which sensors are mapped. Missing optional sensors leave analyses locked – add them under Configure.",
  },
  dhw: {
    de: "Anteil der Warmwasser-Wärme an der gesamten Wärme. Warmwasser braucht höhere Temperaturen und senkt deshalb den COP – ein hoher Anteil erklärt einen niedrigeren Gesamt-COP.",
    en: "Share of hot-water heat in total heat. Hot water needs higher temperatures and therefore lowers COP – a high share explains a lower overall COP.",
  },
};

export function helpText(key) {
  const h = HELP[key];
  if (!h) return "";
  return getLang() === "de" ? h.de : h.en;
}

export const HELP_KEYS = Object.keys(HELP);
