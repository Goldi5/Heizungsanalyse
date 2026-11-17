"""Neutrale Datenstrukturen der Analyseschicht (ohne Home-Assistant-Import)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime


@dataclass(slots=True)
class DayValue:
    """Ein Tageswert aus der Langzeitstatistik.

    ``change`` ist die vom Recorder berechnete Differenz, ``state`` der letzte
    Zählerstand des Tages. Je nach ``state_class`` ist nur eines von beiden
    gesetzt; deshalb werden beide mitgeführt.
    """

    day: date
    mean: float | None = None
    change: float | None = None
    state: float | None = None


@dataclass(slots=True)
class HourValue:
    """Ein Stundenwert aus der Langzeitstatistik."""

    hour: datetime
    mean: float | None = None


@dataclass(slots=True)
class DaySample:
    """Tageswerte einer Anlage, aus mehreren Quellen zusammengeführt."""

    day: date
    heat_kwh: float | None = None
    power_kwh: float | None = None
    outdoor_c: float | None = None
    starts: float | None = None
    runtime_h: float | None = None
    flow_c: float | None = None
    target_flow_c: float | None = None
    dhw_heat_kwh: float | None = None
    aux_hours: float | None = None
    defrost_hours: float | None = None


@dataclass(slots=True)
class HourSample:
    """Stundenwerte für die Vorlauf-Abweichung bei laufendem Verdichter."""

    hour: datetime
    flow_c: float | None = None
    target_flow_c: float | None = None
    compressor_on: bool | None = None
