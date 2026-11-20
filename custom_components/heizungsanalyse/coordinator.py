"""Datensammlung und Kennzahlen.

Der Coordinator liest die Langzeitstatistik, baut daraus Tagesproben und
berechnet die Kennzahlen der Analyseschicht. Er steuert nichts.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging
from time import perf_counter
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_OFF, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .analysis.circuits import CircuitSample, CircuitStats, MixerSample, MixerStats
from .analysis.cop import CopBin, CopResult, cop_curve, cop_window
from .analysis.costs import (
    clean_water_days,
    dhw_stats,
    heat_price_ct,
    month_start,
    numeric_changes,
    sum_since,
    weighted_cost,
)
from .analysis.cycling import mean_runtime_per_cycle, starts_per_day
from .analysis.event_log import (
    FindingDebouncer,
    config_diff,
    config_snapshot,
    should_log_update,
    update_signature,
)
from .analysis.findings import Finding, FindingsInput, Thresholds, evaluate, signature
from .analysis.heating_curve import CurveBin, DeviationResult, curve_bins, deviation
from .analysis.hydraulics import (
    daily_median as hourly_daily_median,
    live as hydraulics_live,
    overshoot_hours,
    power_kw,
    spread_hours,
    spread_stats,
)
from .analysis.onoff import (
    as_on,
    grid,
    hours_per_day,
    intervals,
    share_per_hour,
    starts_per_day as onoff_starts_per_day,
    value_at,
)
from .analysis.operation import cycle_histogram, hour_profile, timeline
from .analysis.rooms import RoomDeviation, RoomReading, climate_values
from .analysis.series import build_samples, counter_by_day, energy_by_day, mean_by_day
from .analysis.types import DaySample, HourSample
from .const import (
    CIRCUIT_TYPES,
    CONF_AUX_HEATER_ENTITY,
    CONF_BUFFER_ENTITY,
    CONF_CIRCUIT,
    CONF_CIRCUITS,
    CONF_CLIMATE_ENTITY,
    CONF_COMPRESSOR_ENTITY,
    CONF_COMPRESSOR_RUNTIME_ENTITY,
    CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY,
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_DEFROST_ENTITY,
    CONF_DHW_HEAT_ENTITY,
    CONF_DHW_OPERATION_ENTITY,
    CONF_DHW_POWER_ENTITY,
    CONF_DHW_PUMP_ENTITY,
    CONF_DHW_TARGET_ENTITY,
    CONF_DHW_TEMP_ENTITY,
    CONF_FLOW_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_HP_FLOW_ENTITY,
    CONF_ID,
    CONF_MIXER_CLOSE_ENTITY,
    CONF_MIXER_OPEN_ENTITY,
    CONF_NAME,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_POWER_FALLBACK_ENTITY,
    CONF_POWER_NOW_ENTITY,
    CONF_PUMP_ENTITY,
    CONF_RETURN_ENTITY,
    CONF_ROOMS,
    CONF_TARGET_ENTITY,
    CONF_TARGET_FLOW_ENTITY,
    CONF_TEMPERATURE_ENTITY,
    CONF_THRESHOLDS,
    CONF_VALVE_POSITION_ENTITY,
    CONF_VOLUME_FLOW_ENTITY,
    COP_LONG_DAYS,
    COP_SHORT_DAYS,
    DEVIATION_DAYS,
    DOMAIN,
    EVENT_ALERT,
    EVENT_FINDINGS,
    HEATING_UP_MAX_MINUTES,
    HEATING_UP_TOLERANCE,
    HEATING_UP_TRIGGER,
    HISTORY_DAYS,
    HISTORY_ONOFF_DAYS,
    HISTORY_REFRESH_MINUTES,
    MANDATORY_SOURCES,
    MIXER_RESOLUTION_MINUTES,
    OPTIONAL_SOURCES,
    POWER_SOURCE_FALLBACK,
    POWER_SOURCE_PRIMARY,
    ROOM_MIN_TARGET,
    ROOM_TOLERANCE,
    ROOM_WINDOW_DAYS,
    UPDATE_INTERVAL_MINUTES,
)
from .data_access import (
    async_read_daily,
    async_read_energy_prefs,
    async_read_history,
    async_read_hourly,
    async_read_hourly_change,
)
from .event_log import EventLog
from .tracking import CircuitTracker, MixerTracker, RoomTracker, rank_rooms_with_circuits

_LOGGER = logging.getLogger(__name__)

ENERGY_UNITS = frozenset({"Wh", "kWh", "MWh"})
POWER_UNITS = frozenset({"W", "kW"})
TEMPERATURE_UNITS = frozenset({"°C", "K"})

# Erwartete Art einer Quelle für den Quellen-Check im Protokoll.
SOURCE_KINDS: dict[str, str] = {
    CONF_HEAT_ENTITY: "energy",
    CONF_DHW_HEAT_ENTITY: "energy",
    # Strom-Quellen sind Zähler (kWh) – „power“ meint die Momentanleistung
    CONF_POWER_ENTITY: "energy",
    CONF_POWER_FALLBACK_ENTITY: "energy",
    CONF_DHW_POWER_ENTITY: "energy",
    CONF_POWER_NOW_ENTITY: "power",
    CONF_HP_FLOW_ENTITY: "temperature",
    CONF_RETURN_ENTITY: "temperature",
    CONF_VOLUME_FLOW_ENTITY: "volume_flow",
    CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY: "counter",
    CONF_OUTDOOR_ENTITY: "temperature",
    CONF_FLOW_ENTITY: "temperature",
    CONF_TARGET_FLOW_ENTITY: "temperature",
    CONF_BUFFER_ENTITY: "temperature",
    CONF_COMPRESSOR_ENTITY: "binary",
    CONF_COMPRESSOR_STARTS_ENTITY: "counter",
    CONF_COMPRESSOR_RUNTIME_ENTITY: "counter",
    CONF_DEFROST_ENTITY: "binary",
    CONF_AUX_HEATER_ENTITY: "binary",
    CONF_DHW_TEMP_ENTITY: "temperature",
    CONF_DHW_TARGET_ENTITY: "temperature",
    CONF_DHW_PUMP_ENTITY: "binary",
}


@dataclass(slots=True)
class AnalysisSnapshot:
    """Alle Kennzahlen eines Aktualisierungslaufs."""

    cop_short: CopResult
    cop_long: CopResult
    starts_per_day: float | None
    runtime_per_cycle: float | None
    deviation: DeviationResult
    compressor_filtered: bool
    cop_trend: list[CopBin]
    curve: list[CurveBin]
    samples: list[DaySample]
    power_source: str | None
    days_with_data: int
    rooms: dict[str, RoomDeviation]
    heating_up: dict[str, float | None]
    circuits: dict[str, CircuitStats]
    mixer: dict[str, MixerStats]
    rankings: dict[str, object]
    findings: list[Finding]
    thresholds: Thresholds
    hydraulics: dict = field(default_factory=dict)
    buffer_system: bool = False
    costs: dict = field(default_factory=dict)


EMPTY_COP = CopResult(None, 0.0, 0.0, 0, None)


def _add(first: float | None, second: float | None) -> float | None:
    """Summe zweier Mengen; fehlt die zweite, bleibt die erste."""
    if first is None:
        return None
    return round(first + (second or 0.0), 1)


def _hours_by_day(values) -> dict:
    """Tagesmittel eines Status-Sensors als Stunden."""
    return {value.day: round(value.mean * 24, 2) for value in values if value.mean is not None}


def _energy_total(values) -> float | None:
    total = energy_by_day(values)
    return round(sum(total.values()), 1) if total else None


def _as_float(value) -> float | None:
    try:
        return None if value is None else float(value)
    except (TypeError, ValueError):
        return None


class HeizungsanalyseCoordinator(DataUpdateCoordinator[AnalysisSnapshot]):
    """Aggregiert die Statistik in festen Zeitfenstern."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, *, log: EventLog | None = None, store: Any = None) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=UPDATE_INTERVAL_MINUTES),
        )
        self.entry = entry
        self.log = log
        self.store = store
        self._rooms = RoomTracker(window_days=ROOM_WINDOW_DAYS)
        self._circuit_tracker = CircuitTracker(window_days=ROOM_WINDOW_DAYS)
        self._mixer_tracker = MixerTracker(window_days=ROOM_WINDOW_DAYS)
        self._findings_signature: str | None = None
        self._findings_by_id: dict[str, str] = {}
        self._finding_debouncer = FindingDebouncer()
        self._sources_state: dict[str, str] = {}
        self._no_statistics: set[str] = set()
        self._run_index = 0
        self._update_signature: tuple | None = None
        self._source_counts: dict[str, int] = {}
        self._unit_warned: set[str] = set()
        self._class_warned: set[str] = set()
        self._flow_hours: list[HourSample] = []
        # Zustandsverlauf (Binärsensoren haben keine Langzeitstatistik)
        self._history_at: datetime | None = None
        self._changes: dict[str, list[tuple[datetime, bool | None]]] = {}
        self._spans: dict[str, list[tuple[datetime, datetime]]] = {}
        self._costs: dict = {}
        self._costs_at: datetime | None = None
        self._history_start: datetime | None = None
        self._backfilled = False
        self._hydraulics: dict = {}
        self.last_duration_ms = 0.0
        self.last_error: str | None = None

    async def _async_update_data(self) -> AnalysisSnapshot:
        self._run_index += 1
        started = perf_counter()
        try:
            snapshot = await self._collect()
        except (KeyError, TypeError, ValueError) as err:
            self.last_error = f"{type(err).__name__}: {err}"
            self.last_duration_ms = round((perf_counter() - started) * 1000, 1)
            await self._log_error(self.last_error)
            raise UpdateFailed(str(err)) from err
        self.last_error = None
        self.last_duration_ms = round((perf_counter() - started) * 1000, 1)
        await self._log_update(snapshot)
        return snapshot

    async def _log_error(self, text: str) -> None:
        if self.log is None:
            return
        await self.log.async_add(
            "error",
            "error",
            f"Aktualisierung fehlgeschlagen: {text}",
            key="error.update",
            params={"error": text},
            details={"type": text.split(":", 1)[0]},
        )

    async def _log_update(self, snapshot: AnalysisSnapshot) -> None:
        if self.log is None:
            return
        counts = self._source_counts
        signature = update_signature(counts, snapshot.days_with_data, snapshot.power_source)
        if not should_log_update(self._update_signature, signature, self._run_index):
            return
        self._update_signature = signature
        rows = sum(counts.values())
        await self.log.async_add(
            "info",
            "update",
            f"Auswertung: {rows} Statistikzeilen, {snapshot.days_with_data} Tage mit Daten, {self.last_duration_ms} ms",
            key="update.run",
            params={"rows": rows, "days": snapshot.days_with_data, "duration": self.last_duration_ms},
            details={
                "rows": rows,
                "days_with_data": snapshot.days_with_data,
                "duration_ms": self.last_duration_ms,
                "power_source": snapshot.power_source,
                "counts": counts,
            },
        )

    def _entity(self, key: str) -> str | None:
        return self.entry.options.get(key) or self.entry.data.get(key)

    async def _collect(self) -> AnalysisSnapshot:
        heat_id = self.entry.data[CONF_HEAT_ENTITY]
        outdoor_id = self.entry.data[CONF_OUTDOOR_ENTITY]
        compressor_id = self.entry.data[CONF_COMPRESSOR_ENTITY]
        primary_power_id = self.entry.data[CONF_POWER_ENTITY]
        fallback_power_id = self.entry.options.get(CONF_POWER_FALLBACK_ENTITY)

        starts_id = self._entity(CONF_COMPRESSOR_STARTS_ENTITY)
        runtime_id = self._entity(CONF_COMPRESSOR_RUNTIME_ENTITY)
        aux_id = self._entity(CONF_AUX_HEATER_ENTITY)
        defrost_id = self._entity(CONF_DEFROST_ENTITY)
        dhw_id = self._entity(CONF_DHW_HEAT_ENTITY)
        flow_id = self._entity(CONF_FLOW_ENTITY)
        target_flow_id = self._entity(CONF_TARGET_FLOW_ENTITY)
        buffer_id = self._entity(CONF_BUFFER_ENTITY)
        dhw_power_id = self._entity(CONF_DHW_POWER_ENTITY)
        runtime2_id = self._entity(CONF_COMPRESSOR_RUNTIME_EXTRA_ENTITY)

        wanted = {
            heat_id,
            outdoor_id,
            primary_power_id,
            fallback_power_id,
            starts_id,
            runtime_id,
            dhw_id,
            flow_id,
            target_flow_id,
            buffer_id,
            aux_id,
            defrost_id,
            dhw_power_id,
            runtime2_id,
        }
        daily = await async_read_daily(self.hass, wanted, HISTORY_DAYS)
        await self._refresh_history(dt_util.utcnow())

        power_source, power_id = self._select_power(daily, primary_power_id, fallback_power_id)

        samples = build_samples(
            heat=energy_by_day(daily.get(heat_id, [])),
            power=energy_by_day(daily.get(power_id, [])) if power_id else {},
            outdoor=mean_by_day(daily.get(outdoor_id, [])),
            starts=(counter_by_day(daily.get(starts_id, [])) if starts_id else {}) or self._history_starts(compressor_id),
            runtime=self._runtime_by_day(daily, runtime_id, runtime2_id) or self._history_hours(compressor_id),
            flow=mean_by_day(daily.get(flow_id, [])) if flow_id else {},
            target_flow=mean_by_day(daily.get(target_flow_id, [])) if target_flow_id else {},
            dhw_heat=energy_by_day(daily.get(dhw_id, [])) if dhw_id else {},
            aux_hours=(_hours_by_day(daily.get(aux_id, [])) if aux_id else {}) or self._history_hours(aux_id),
            defrost_hours=(_hours_by_day(daily.get(defrost_id, [])) if defrost_id else {}) or self._history_hours(defrost_id),
            dhw_power=energy_by_day(daily.get(dhw_power_id, [])) if dhw_power_id else {},
        )

        dhw_op_id = self._entity(CONF_DHW_OPERATION_ENTITY)
        outdoor_id = self.entry.data.get(CONF_OUTDOOR_ENTITY)
        hours, compressor_filtered = await self._read_hours(flow_id, target_flow_id, compressor_id, dhw_op_id, outdoor_id)
        self._hydraulics = await self._read_hydraulics(target_flow_id, compressor_id, dhw_op_id)
        self._hydraulics["circuits"] = await self._read_circuit_flows()
        self._hydraulics["dhw"] = await self._read_dhw()
        await self._refresh_costs()
        self._flow_hours = hours
        await self._evaluate_change_outcomes(samples)
        self._source_counts = {key: len(rows) for key, rows in daily.items()}
        self._source_counts.update({f"{key}:hour": len(rows) for key, rows in daily.items() if key in (flow_id, target_flow_id)})
        await self._log_sources(daily)

        now = dt_util.utcnow()
        self._track(now)
        room_stats = self._rooms.stats(ROOM_TOLERANCE)
        circuit_of = {room[CONF_ID]: room.get(CONF_CIRCUIT) for room in self._rooms_config() if CONF_ID in room}

        thresholds = Thresholds.from_options(self.entry.options.get(CONF_THRESHOLDS))
        findings = await self._evaluate_findings(
            daily=daily,
            samples=samples,
            thresholds=thresholds,
            room_stats=room_stats,
            power_source=power_source,
            cop_short=cop_window(samples, days=COP_SHORT_DAYS, source=power_source),
            trend=cop_curve(samples),
            flow_hours=hours,
        )

        return AnalysisSnapshot(
            cop_short=cop_window(samples, days=COP_SHORT_DAYS, source=power_source),
            cop_long=cop_window(samples, days=COP_LONG_DAYS, source=power_source),
            starts_per_day=starts_per_day(samples, days=COP_SHORT_DAYS),
            runtime_per_cycle=mean_runtime_per_cycle(samples, days=COP_SHORT_DAYS),
            deviation=deviation(hours, compressor_only=compressor_filtered),
            compressor_filtered=compressor_filtered,
            cop_trend=cop_curve(samples),
            curve=curve_bins(samples),
            samples=samples,
            power_source=power_source,
            days_with_data=sum(1 for sample in samples if sample.heat_kwh is not None),
            rooms=room_stats,
            heating_up=self._rooms.heating_up(
                trigger=HEATING_UP_TRIGGER,
                tolerance=HEATING_UP_TOLERANCE,
                max_minutes=HEATING_UP_MAX_MINUTES,
            ),
            circuits=self._circuit_tracker.stats(MIXER_RESOLUTION_MINUTES),
            mixer=self._mixer_tracker.stats(),
            rankings=rank_rooms_with_circuits(room_stats, circuit_of),
            findings=findings,
            thresholds=thresholds,
            hydraulics=self._hydraulics,
            buffer_system=self.buffer_system,
            costs=self._costs,
        )

    @property
    def buffer_system(self) -> bool:
        """Anlage mit Puffer: Puffer-Quelle, Puffer-Kreis oder Soll-Vorlauf des Puffers."""
        if self._entity(CONF_BUFFER_ENTITY):
            return True
        if any(str(circuit.get("type")) == "buffer" for circuit in self._circuits_config()):
            return True
        return "puffer" in str(self._entity(CONF_TARGET_FLOW_ENTITY) or "").lower()

    async def _evaluate_findings(
        self,
        *,
        daily: dict[str, list],
        samples: list[DaySample],
        thresholds: Thresholds,
        room_stats: dict,
        power_source: str | None,
        cop_short: CopResult,
        trend: list[CopBin],
        flow_hours: list[HourSample],
    ) -> list[Finding]:
        """Messwerte sammeln und die Regeln anwenden."""
        heat_id = self.entry.data[CONF_HEAT_ENTITY]
        primary_id = self.entry.data[CONF_POWER_ENTITY]
        fallback_id = self.entry.options.get(CONF_POWER_FALLBACK_ENTITY)
        mandatory = (
            primary_id,
            heat_id,
            self.entry.data[CONF_OUTDOOR_ENTITY],
            self.entry.data[CONF_COMPRESSOR_ENTITY],
        )

        rooms = self._rooms_config()
        circuits = self._circuits_config()
        recent = samples[-COP_SHORT_DAYS:]
        outdoor = [sample.outdoor_c for sample in recent if sample.outdoor_c is not None]

        cop_long = cop_window(samples, days=COP_LONG_DAYS, source=power_source)

        return_id = self._entity(CONF_RETURN_ENTITY)
        return_values = [value.mean for value in daily.get(return_id, []) if value.mean is not None] if return_id else []
        return_values = return_values[-COP_SHORT_DAYS:]
        return_temp_median = None
        if return_values:
            ordered = sorted(return_values)
            mid = len(ordered) // 2
            return_temp_median = ordered[mid] if len(ordered) % 2 else (ordered[mid - 1] + ordered[mid]) / 2

        results = FindingsInput(
            cop=cop_short.cop,
            cop_days=cop_short.days,
            cop_long=cop_long.cop,
            cop_trend=trend,
            outdoor_mean=sum(outdoor) / len(outdoor) if outdoor else None,
            deviation_median=self._deviation_median(flow_hours),
            deviation_p90=self._deviation_p90(flow_hours),
            deviation_hours=len(flow_hours),
            starts_per_day=starts_per_day(samples, days=COP_SHORT_DAYS),
            runtime_per_cycle=mean_runtime_per_cycle(samples, days=COP_SHORT_DAYS),
            room_stats=room_stats,
            room_names={str(room[CONF_ID]): str(room.get(CONF_NAME, room[CONF_ID])) for room in rooms if CONF_ID in room},
            circuit_stats=self._circuit_tracker.stats(MIXER_RESOLUTION_MINUTES),
            circuit_names={str(item[CONF_ID]): str(item.get(CONF_NAME, item[CONF_ID])) for item in circuits if CONF_ID in item},
            mixer_stats=self._mixer_tracker.stats(),
            samples=samples,
            duplicate_pairs=self._duplicate_pairs(
                daily,
                (
                    heat_id,
                    primary_id,
                    self._entity(CONF_FLOW_ENTITY),
                    self._entity(CONF_TARGET_FLOW_ENTITY),
                    self._entity(CONF_BUFFER_ENTITY),
                ),
            ),
            missing_statistics=[entity_id for entity_id in (heat_id, primary_id) if entity_id and not daily.get(entity_id)],
            unavailable_hours=self._unavailable_hours(mandatory),
            power_source=power_source,
            primary_energy=_add(
                _energy_total(daily.get(primary_id, [])),
                _energy_total(daily.get(self._entity(CONF_DHW_POWER_ENTITY), []))
                if self._entity(CONF_DHW_POWER_ENTITY)
                else None,
            ),
            fallback_energy=_energy_total(daily.get(fallback_id, [])) if fallback_id else None,
            spread_median=(self._hydraulics.get("spread") or {}).get("median"),
            spread_hours=int((self._hydraulics.get("spread") or {}).get("hours") or 0),
            return_temp_median=return_temp_median,
            buffer_system=self.buffer_system,
        )
        findings = evaluate(results, thresholds)
        await self._log_findings(findings)
        self._publish_findings(findings)
        return findings

    async def _log_findings(self, findings: list[Finding]) -> None:
        """Neue und erledigte Hinweise protokollieren – entprellt, ohne Messwert-Rauschen."""
        self._findings_by_id = {finding.id: self._finding_key(finding) for finding in findings}
        events = self._finding_debouncer.update(dt_util.utcnow(), {finding.id: finding.severity for finding in findings})
        if not events or self.log is None:
            return
        by_id = {finding.id: finding for finding in findings}
        from .summary import TITLES

        for finding_id, kind, old, new in events:
            finding = by_id.get(finding_id)
            title = TITLES["de"].get(finding.key, finding_id) if finding is not None else finding_id
            if kind == "resolved":
                await self.log.async_add(
                    "info",
                    "finding",
                    f"Hinweis {finding_id} erledigt",
                    key="finding.resolved",
                    params={"id": finding_id, "title": title},
                    details={"id": finding_id, "previous": old},
                )
            elif kind == "severity" and finding is not None:
                await self.log.async_add(
                    "warn" if finding.severity == "warning" else "info",
                    "finding",
                    f"Hinweis {finding_id} jetzt {'Warnung' if new == 'warning' else 'Hinweis'}",
                    key="finding.changed",
                    params={"id": finding_id, "title": title},
                    details={"id": finding_id, "previous": old, "current": new},
                )
            elif finding is not None:
                await self.log.async_add(
                    "warn" if finding.severity == "warning" else "info",
                    "finding",
                    f"Neuer Hinweis {finding_id}: {title}",
                    key="finding.new",
                    params={"id": finding_id, "title": title},
                    details={
                        "id": finding_id,
                        "severity": finding.severity,
                        "title": title,
                        "params": dict(finding.params),
                        "evidence": dict(finding.evidence),
                    },
                )

    @staticmethod
    def _finding_key(finding: Finding) -> str:
        return f"{finding.severity}|{finding.key}|{sorted(finding.params.items())}|{sorted(finding.evidence.items())}"

    async def _log_sources(self, daily: dict[str, list]) -> None:
        """Verfügbarkeit, Statistikmenge, Einheit und state_class protokollieren."""
        if self.log is None:
            return
        for entity_id, kind in self._source_expectations().items():
            state = self.hass.states.get(entity_id)
            if state is None:
                status = "missing"
            elif state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                status = "unavailable"
            else:
                status = "ok"
            previous = self._sources_state.get(entity_id)
            if status != previous:
                self._sources_state[entity_id] = status
                if status in ("missing", "unavailable") and previous is not None:
                    hours = 0.0
                    if state is not None:
                        hours = round((dt_util.utcnow() - state.last_changed).total_seconds() / 3600, 1)
                    await self.log.async_add(
                        "warn",
                        "source",
                        f"Quelle {entity_id} ist nicht verfügbar (seit {hours} h)",
                        key="source.lost",
                        params={"entity": entity_id, "hours": hours},
                        details={"entity": entity_id, "status": status},
                    )
                elif status == "ok" and previous is not None:
                    await self.log.async_add(
                        "info",
                        "source",
                        f"Quelle {entity_id} ist wieder verfügbar",
                        key="source.back",
                        params={"entity": entity_id},
                        details={"entity": entity_id},
                    )
            if status != "ok" or state is None:
                continue
            # Binärsensoren, Momentanwerte und WP-Temperaturen werden nicht als Tageswert gelesen
            hourly_only = {self._entity(CONF_HP_FLOW_ENTITY), self._entity(CONF_RETURN_ENTITY)}
            if kind in ("binary", "power", "volume_flow") or entity_id in hourly_only:
                pass
            elif not daily.get(entity_id):
                if entity_id not in self._no_statistics:
                    self._no_statistics.add(entity_id)
                    await self.log.async_add(
                        "warn",
                        "source",
                        f"Quelle {entity_id} hat keine Langzeitstatistik",
                        key="source.no_statistics",
                        params={"entity": entity_id},
                        details={"entity": entity_id},
                    )
            else:
                self._no_statistics.discard(entity_id)
            unit = state.attributes.get("unit_of_measurement")
            expected = {"energy": ENERGY_UNITS, "power": POWER_UNITS, "temperature": TEMPERATURE_UNITS}.get(kind)
            if expected and unit and unit not in expected and entity_id not in self._unit_warned:
                self._unit_warned.add(entity_id)
                await self.log.async_add(
                    "warn",
                    "source",
                    f"Quelle {entity_id}: Einheit {unit}, erwartet eine aus {sorted(expected)}",
                    key="source.unit",
                    params={"entity": entity_id, "unit": unit, "expected": sorted(expected)},
                    details={"entity": entity_id, "unit": unit, "expected": sorted(expected)},
                )
            state_class = state.attributes.get("state_class")
            if kind == "energy" and state_class not in ("total", "total_increasing") and entity_id not in self._class_warned:
                self._class_warned.add(entity_id)
                await self.log.async_add(
                    "warn",
                    "source",
                    f"Quelle {entity_id}: state_class {state_class}, erwartet total oder total_increasing",
                    key="source.state_class",
                    params={"entity": entity_id, "state_class": state_class},
                    details={"entity": entity_id, "state_class": state_class},
                )

    def operation_summary(self) -> dict:
        """Zeitstreifen der letzten 7 Tage, Zyklen und Raumprofile fürs Dashboard."""
        now = dt_util.utcnow()
        since = now - timedelta(days=7)
        tz = dt_util.get_default_time_zone()
        spans = self._spans or {}
        kinds = {
            "compressor": self.entry.data.get(CONF_COMPRESSOR_ENTITY),
            "dhw": self._entity(CONF_DHW_OPERATION_ENTITY),
            "defrost": self._entity(CONF_DEFROST_ENTITY),
            "aux": self._entity(CONF_AUX_HEATER_ENTITY),
        }
        lanes = {kind: timeline(spans.get(entity_id, []), since) for kind, entity_id in kinds.items() if entity_id and entity_id in spans}
        compressor = spans.get(kinds["compressor"] or "", [])
        return {
            "since": int(since.timestamp()),
            "now": int(now.timestamp()),
            "timeline": lanes,
            "cycles": cycle_histogram(compressor, since, open_end=now - timedelta(minutes=1)),
            "room_profiles": {
                str(room[CONF_ID]): hour_profile(self._rooms.readings(str(room[CONF_ID])), tz)
                for room in self._rooms_config()
                if CONF_ID in room
            },
        }

    def source_kinds(self) -> dict[str, str]:
        """Alle zugeordneten Quellen (Entity → erwartete Art), auch die ohne erwartete Art."""
        kinds = dict(self._source_expectations())
        for key in (*MANDATORY_SOURCES, *OPTIONAL_SOURCES):
            entity_id = self.entry.data.get(key) or self.entry.options.get(key)
            if entity_id and entity_id not in kinds:
                kinds[entity_id] = "binary" if str(entity_id).startswith("binary_sensor.") else "source"
        return kinds

    def _source_expectations(self) -> dict[str, str]:
        """Nur tatsächlich zugeordnete Quellen mit erwarteter Art."""
        result: dict[str, str] = {}
        for key, kind in SOURCE_KINDS.items():
            entity_id = self._entity(key)
            if entity_id:
                result[entity_id] = kind
        return result

    def config_state(self) -> dict:
        """Aktueller Stand der Konfiguration für den Vergleich."""
        return config_snapshot(dict(self.entry.data), dict(self.entry.options))

    async def async_log_config(self, previous: dict) -> int:
        """Konfigurationsänderungen protokollieren; Anzahl der Einträge."""
        if self.log is None:
            return 0
        entries = config_diff(previous, self.config_state())
        if not entries:
            return 0
        return await self.log.async_add_many(entries)

    def room_diagnostics(self) -> list[dict]:
        """Stichproben, letzte Lesung und Verwerfungsgründe je Raum."""
        rows: list[dict] = []
        for room in self._rooms_config():
            room_id = str(room.get(CONF_ID))
            climate_id = room.get(CONF_CLIMATE_ENTITY)
            samples = len(self._rooms.readings(room_id))
            last = self._rooms.readings(room_id)[-1] if samples else None
            reason = self._room_reason(room)
            rows.append(
                {
                    "id": room_id,
                    "circuit": room.get(CONF_CIRCUIT),
                    "climate_entity": climate_id,
                    "samples": samples,
                    "last": None
                    if last is None
                    else {
                        "at": last.at.isoformat(),
                        "current": last.current_c,
                        "target": last.target_c,
                    },
                    "reason": reason,
                }
            )
        return rows

    def _room_reason(self, room: dict) -> str:
        climate_id = room.get(CONF_CLIMATE_ENTITY)
        if not climate_id:
            return "no_climate"
        state = self.hass.states.get(climate_id)
        if state is None:
            return "unknown"
        values = climate_values(state.state, dict(state.attributes))
        if values is None:
            if state.state in (STATE_OFF, STATE_UNAVAILABLE, STATE_UNKNOWN):
                return "off"
            if _as_float(state.attributes.get("current_temperature")) is None:
                return "no_values"
            return "no_target"
        _current, target, _valve = values
        if target < ROOM_MIN_TARGET:
            return "target_low"
        return "ok"

    def circuit_diagnostics(self) -> list[dict]:
        rows: list[dict] = []
        for circuit in self._circuits_config():
            circuit_id = str(circuit.get(CONF_ID))
            pump = self._circuit_tracker.stats(MIXER_RESOLUTION_MINUTES).get(circuit_id)
            mixer = self._mixer_tracker.stats().get(circuit_id)
            rows.append(
                {
                    "id": circuit_id,
                    "has_pump": bool(circuit.get(CONF_PUMP_ENTITY)),
                    "has_mixer": bool(circuit.get(CONF_MIXER_OPEN_ENTITY) or circuit.get(CONF_MIXER_CLOSE_ENTITY)),
                    "pump": pump.as_dict() if pump is not None else None,
                    "mixer": mixer.as_dict() if mixer is not None else None,
                }
            )
        return rows

    def runtime_diagnostics(self) -> dict:
        next_run = None
        if self.update_interval is not None:
            next_run = (dt_util.utcnow() + self.update_interval).isoformat()
        return {
            "last_duration_ms": self.last_duration_ms,
            "next_run": next_run,
            "last_update_success": bool(self.last_update_success),
            "last_error": self.last_error,
            "run_index": self._run_index,
            "flow_hours": len(self._flow_hours),
            "compressor_filtered": bool(self._flow_hours) and any(hour.compressor_on is not None for hour in self._flow_hours),
        }

    def _publish_findings(self, findings: list[Finding]) -> None:
        current = signature(findings)
        if self._findings_signature is not None and current != self._findings_signature:
            self.hass.bus.async_fire(
                EVENT_FINDINGS,
                {"count": len(findings), "findings": [finding.as_dict() for finding in findings]},
            )
            warnings = [f for f in findings if f.severity == "warning"]
            if warnings:
                self.hass.bus.async_fire(
                    EVENT_ALERT,
                    {"count": len(warnings), "findings": [f.as_dict() for f in warnings]},
                )
        self._findings_signature = current

    def _duplicate_pairs(self, daily: dict[str, list], entity_ids) -> list[tuple[str, str]]:
        series: dict[str, dict] = {}
        for entity_id in entity_ids:
            if not entity_id:
                continue
            means = {value.day: round(value.mean, 3) for value in daily.get(entity_id, []) if value.mean is not None}
            if len(means) >= 7:
                series[entity_id] = means
        pairs: list[tuple[str, str]] = []
        ordered = sorted(series)
        for index, left in enumerate(ordered):
            for right in ordered[index + 1 :]:
                common = set(series[left]) & set(series[right])
                if len(common) >= 7 and all(series[left][day] == series[right][day] for day in common):
                    pairs.append((left, right))
        return pairs

    def _unavailable_hours(self, entity_ids) -> dict[str, float]:
        now = dt_util.utcnow()
        result: dict[str, float] = {}
        for entity_id in entity_ids:
            state = self.hass.states.get(entity_id)
            if state is None or state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                continue
            hours = (now - state.last_changed).total_seconds() / 3600
            if hours > 1.0:
                result[entity_id] = round(hours, 1)
        return result

    @staticmethod
    def _deviation_median(hours: list[HourSample]) -> float | None:
        values = [
            hour.flow_c - hour.target_flow_c for hour in hours if hour.flow_c is not None and hour.target_flow_c is not None
        ]
        if not values:
            return None
        values.sort()
        middle = len(values) // 2
        return values[middle] if len(values) % 2 else (values[middle - 1] + values[middle]) / 2

    @staticmethod
    def _deviation_p90(hours: list[HourSample]) -> float | None:
        from .analysis.heating_curve import percentile

        values = [
            hour.flow_c - hour.target_flow_c for hour in hours if hour.flow_c is not None and hour.target_flow_c is not None
        ]
        return percentile(values, 90)

    def _rooms_config(self) -> list[dict]:
        return list(self.entry.options.get(CONF_ROOMS) or [])

    def _circuits_config(self) -> list[dict]:
        return list(self.entry.options.get(CONF_CIRCUITS) or [])

    async def _evaluate_change_outcomes(self, samples: list[DaySample]) -> None:
        """Änderungen, die 7+ Tage alt sind, bewerten und speichern."""
        if self.store is None:
            return
        try:
            from .analysis.periods import summarize, within
        except Exception:  # noqa: BLE001
            return
        changes = await self.store.async_change_log(limit=50)
        existing = {str(e.get("ts")) for e in await self.store.async_evaluations()}
        now = dt_util.utcnow()
        for change in changes:
            ts = change.get("ts")
            if not ts or str(ts) in existing:
                continue
            try:
                logged = dt_util.parse_datetime(str(ts))
            except (TypeError, ValueError):
                continue
            if logged is None:
                continue
            day = dt_util.as_local(logged).date()
            if (now.date() - day).days < 7:
                continue
            before = within(samples, day - timedelta(days=7), day - timedelta(days=1))
            after = within(samples, day, day + timedelta(days=6))
            if not before or not after:
                continue
            b = summarize(before)
            a = summarize(after)
            if b.get("cop") is None or a.get("cop") is None:
                continue
            diff = round(a["cop"] - b["cop"], 2)
            if abs(diff) < 0.05:
                verdict = "gleich"
            elif diff > 0:
                verdict = "besser"
            else:
                verdict = "schlechter"
            entry = {
                "ts": ts,
                "day": day.isoformat(),
                "object": change.get("object"),
                "field": change.get("field"),
                "before_cop": b["cop"],
                "after_cop": a["cop"],
                "verdict": verdict,
                "diff": diff,
                "days_before": b.get("days", 0),
                "days_after": a.get("days", 0),
            }
            await self.store.async_add_evaluation(entry)
            existing.add(str(ts))
            if self.log is not None:
                await self.log.async_add(
                    "info",
                    "config",
                    f"Änderung {change.get('object')}.{change.get('field')} bewertet: {verdict} ({diff:+.2f} COP)",
                    key="change.evaluated",
                    params={"object": change.get("object"), "field": change.get("field"), "verdict": verdict, "diff": diff},
                    details=entry,
                )

    def _track(self, now: datetime) -> None:
        """Aktuelle Zustände als Stichprobe sichern (nur lesend)."""
        compressor_id = self.entry.data[CONF_COMPRESSOR_ENTITY]
        compressor_state = self.hass.states.get(compressor_id)
        compressor_known = compressor_state is not None and compressor_state.state not in (
            STATE_UNAVAILABLE,
            STATE_UNKNOWN,
        )
        compressor_on = compressor_known and compressor_state.state == "on"

        readings: list[RoomReading] = []
        for room in self._rooms_config():
            reading = self._room_reading(room, now)
            if reading is not None:
                readings.append(reading)

        samples: list[CircuitSample] = []
        mixer: list[MixerSample] = []
        for circuit in self._circuits_config():
            if circuit.get("type") is not None and circuit["type"] not in CIRCUIT_TYPES:
                continue
            circuit_id = circuit.get(CONF_ID)
            if not circuit_id:
                continue
            pump = self._on_off(circuit.get(CONF_PUMP_ENTITY))
            if pump is not None and compressor_known:
                samples.append(CircuitSample(at=now, circuit_id=circuit_id, pump_on=pump, compressor_on=compressor_on))
            open_on = self._on_off(circuit.get(CONF_MIXER_OPEN_ENTITY))
            close_on = self._on_off(circuit.get(CONF_MIXER_CLOSE_ENTITY))
            if open_on is not None or close_on is not None:
                mixer.append(
                    MixerSample(
                        at=now,
                        circuit_id=circuit_id,
                        open_on=bool(open_on),
                        close_on=bool(close_on),
                    )
                )

        self._rooms.add(readings, now)
        self._circuit_tracker.add(samples, now)
        self._mixer_tracker.add(mixer, now)

    def _room_reading(self, room: dict, now) -> RoomReading | None:
        climate_id = room.get(CONF_CLIMATE_ENTITY)
        if not climate_id:
            return None
        state = self.hass.states.get(climate_id)
        if state is None:
            return None
        values = climate_values(state.state, dict(state.attributes))
        if values is None:
            return None
        current, target, valve = values
        if target < ROOM_MIN_TARGET:
            # Frostschutz oder bewusst abgeschaltet: kein Komfortziel, keine Raumhinweise
            return None
        valve_id = room.get(CONF_VALVE_POSITION_ENTITY)
        if valve_id:
            valve_state = self.hass.states.get(valve_id)
            if valve_state is not None:
                valve = _as_float(valve_state.state)
        return RoomReading(
            at=now,
            room_id=str(room[CONF_ID]),
            current_c=current,
            target_c=target,
            circuit=room.get(CONF_CIRCUIT),
            valve=valve,
        )

    def _on_off(self, entity_id: str | None) -> bool | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        return state.state == "on"

    @staticmethod
    def _select_power(
        daily: dict[str, list],
        primary_id: str,
        fallback_id: str | None,
    ) -> tuple[str | None, str | None]:
        """Primärquelle, solange sie Daten liefert; sonst die Ersatzquelle."""
        if energy_by_day(daily.get(primary_id, [])):
            return POWER_SOURCE_PRIMARY, primary_id
        if fallback_id and energy_by_day(daily.get(fallback_id, [])):
            _LOGGER.debug("Primaerstromquelle ohne Daten, wechsle auf Ersatzquelle")
            return POWER_SOURCE_FALLBACK, fallback_id
        if not energy_by_day(daily.get(primary_id, [])):
            return None, None
        return POWER_SOURCE_PRIMARY, primary_id

    def _onoff_entities(self) -> set[str]:
        ids = {
            self.entry.data.get(CONF_COMPRESSOR_ENTITY),
            self._entity(CONF_DEFROST_ENTITY),
            self._entity(CONF_AUX_HEATER_ENTITY),
            self._entity(CONF_DHW_OPERATION_ENTITY),
            self._entity(CONF_DHW_PUMP_ENTITY),
        }
        for circuit in self._circuits_config():
            ids |= {circuit.get(CONF_PUMP_ENTITY), circuit.get(CONF_MIXER_OPEN_ENTITY), circuit.get(CONF_MIXER_CLOSE_ENTITY)}
        return {entity_id for entity_id in ids if entity_id}

    async def _refresh_history(self, now: datetime) -> None:
        """An/Aus-Verläufe alle HISTORY_REFRESH_MINUTES neu lesen; beim ersten Lauf die Raum- und
        Kreisstichproben der letzten Tage aus dem Verlauf nachtragen (statt nach jedem Neustart leer)."""
        if self._history_at is not None and now - self._history_at < timedelta(minutes=HISTORY_REFRESH_MINUTES):
            return
        self._history_at = now
        ids = self._onoff_entities()
        raw = await async_read_history(self.hass, ids, HISTORY_ONOFF_DAYS)
        start = now - timedelta(days=HISTORY_ONOFF_DAYS)
        self._history_start = start
        self._changes = {}
        self._spans = {}
        for entity_id, rows in raw.items():
            changes = [(at, as_on(state)) for at, state, _attrs in rows]
            self._changes[entity_id] = changes
            self._spans[entity_id] = intervals(changes, start, now)
        if not self._backfilled:
            self._backfilled = True
            await self._backfill(now)

    def _history_hours(self, entity_id: str | None) -> dict:
        """Stunden „an“ je Tag aus dem Verlauf; Tage im Fenster ohne Lauf zählen als 0."""
        if not entity_id or entity_id not in self._spans or self._history_start is None:
            return {}
        tz = dt_util.get_default_time_zone()
        result = hours_per_day(self._spans[entity_id], tz)
        first = self._history_start.astimezone(tz).date() + timedelta(days=1)
        today = dt_util.now().date()
        day = first
        while day <= today:
            result.setdefault(day, 0.0)
            day += timedelta(days=1)
        # erster Tag ist angeschnitten – nicht verwenden
        return {day: hours for day, hours in result.items() if day >= first}

    def _history_starts(self, entity_id: str | None) -> dict:
        if not entity_id or entity_id not in self._spans or self._history_start is None:
            return {}
        tz = dt_util.get_default_time_zone()
        first = self._history_start.astimezone(tz).date() + timedelta(days=1)
        counts = onoff_starts_per_day(self._spans[entity_id], tz, self._history_start)
        hours = self._history_hours(entity_id)
        return {day: float(counts.get(day, 0)) for day in hours if day >= first}

    async def _backfill(self, now: datetime) -> None:
        """Raum- und Kreisstichproben der letzten ROOM_WINDOW_DAYS aus dem Verlauf (5-min-Raster)."""
        start = now - timedelta(days=ROOM_WINDOW_DAYS)
        times = grid(start, now - timedelta(minutes=UPDATE_INTERVAL_MINUTES), UPDATE_INTERVAL_MINUTES)
        climate_ids = {room.get(CONF_CLIMATE_ENTITY) for room in self._rooms_config() if room.get(CONF_CLIMATE_ENTITY)}
        climate_rows = await async_read_history(self.hass, climate_ids, ROOM_WINDOW_DAYS, attributes=True)
        readings: list[RoomReading] = []
        for room in self._rooms_config():
            rows = climate_rows.get(room.get(CONF_CLIMATE_ENTITY) or "", [])
            if not rows or CONF_ID not in room:
                continue
            values = [(at, climate_values(state, attrs)) for at, state, attrs in rows]
            for at, value in value_at(values, times):
                if value is None:
                    continue
                current, target, valve = value
                if target < ROOM_MIN_TARGET:
                    continue
                readings.append(
                    RoomReading(
                        at=at,
                        room_id=str(room[CONF_ID]),
                        current_c=current,
                        target_c=target,
                        circuit=room.get(CONF_CIRCUIT),
                        valve=valve,
                    )
                )
        readings.sort(key=lambda item: item.at)
        self._rooms.add(readings, now)

        compressor = self._changes.get(self.entry.data.get(CONF_COMPRESSOR_ENTITY) or "", [])
        comp_at = dict(value_at(compressor, times)) if compressor else {}
        samples: list[CircuitSample] = []
        mixer: list[MixerSample] = []
        for circuit in self._circuits_config():
            circuit_id = circuit.get(CONF_ID)
            if not circuit_id:
                continue
            pump = self._changes.get(circuit.get(CONF_PUMP_ENTITY) or "", [])
            if pump and comp_at:
                for at, on in value_at(pump, times):
                    running = comp_at.get(at)
                    if on is None or running is None:
                        continue
                    samples.append(CircuitSample(at=at, circuit_id=circuit_id, pump_on=bool(on), compressor_on=bool(running)))
            opening = dict(value_at(self._changes.get(circuit.get(CONF_MIXER_OPEN_ENTITY) or "", []), times))
            closing = dict(value_at(self._changes.get(circuit.get(CONF_MIXER_CLOSE_ENTITY) or "", []), times))
            if opening or closing:
                for at in times:
                    if at not in opening and at not in closing:
                        continue
                    mixer.append(
                        MixerSample(at=at, circuit_id=circuit_id, open_on=bool(opening.get(at)), close_on=bool(closing.get(at)))
                    )
        samples.sort(key=lambda item: item.at)
        mixer.sort(key=lambda item: item.at)
        self._circuit_tracker.add(samples, now)
        self._mixer_tracker.add(mixer, now)
        if self.log is not None:
            await self.log.async_add(
                "info",
                "update",
                f"Verlauf nachgetragen: {len(readings)} Raum-, {len(samples)} Pumpen-, {len(mixer)} Mischer-Stichproben",
                key="update.backfill",
                params={"rooms": len(readings), "pumps": len(samples), "mixer": len(mixer)},
                details={"rooms": len(readings), "pumps": len(samples), "mixer": len(mixer)},
            )

    def _runtime_by_day(self, daily: dict, first_id: str | None, second_id: str | None) -> dict:
        """Laufzeit je Tag; ein zweiter Zähler (z. B. Warmwasser) wird addiert."""
        first = counter_by_day(daily.get(first_id, [])) if first_id else {}
        second = counter_by_day(daily.get(second_id, [])) if second_id else {}
        if not first:
            return dict(second)
        return {day: round(value + second.get(day, 0.0), 3) for day, value in first.items()}

    async def _read_hydraulics(self, target_flow_id: str | None, compressor_id: str | None, dhw_op_id: str | None = None) -> dict:
        """Spreizung, Puffer-Ladung und Momentanwerte der Wärmepumpe."""
        hp_flow_id = self._entity(CONF_HP_FLOW_ENTITY)
        return_id = self._entity(CONF_RETURN_ENTITY)
        volume_id = self._entity(CONF_VOLUME_FLOW_ENTITY)
        power_now_id = self._entity(CONF_POWER_NOW_ENTITY)
        if not hp_flow_id:
            return {}
        wanted = {hp_flow_id, return_id, target_flow_id, compressor_id}
        hourly = await async_read_hourly(self.hass, wanted, DEVIATION_DAYS)

        def means(entity_id: str | None) -> dict:
            if not entity_id:
                return {}
            return {value.hour: value.mean for value in hourly.get(entity_id, []) if value.mean is not None}

        flow = means(hp_flow_id)
        running = means(compressor_id)
        if not running and compressor_id and self._spans.get(compressor_id) is not None:
            running = share_per_hour(self._spans[compressor_id], flow.keys())
        tz = dt_util.get_default_time_zone()
        result: dict = {"filtered": bool(running)}
        if return_id:
            spreads = spread_hours(flow, means(return_id), running)
            result["spread"] = spread_stats(spreads).as_dict()
            result["spread_daily"] = {day.isoformat(): value for day, value in sorted(hourly_daily_median(spreads, tz).items())}
        if target_flow_id:
            dhw_running = dict(running) if running else {}
            if dhw_op_id:
                dhw_series = means(dhw_op_id)
                if not dhw_series and dhw_op_id in (self._spans or {}):
                    dhw_series = share_per_hour(self._spans[dhw_op_id], flow.keys())
                for hour in list(dhw_series):
                    if dhw_series.get(hour, 0.0) > 0.5:
                        dhw_running[hour] = 0.0
            over = overshoot_hours(flow, means(target_flow_id), dhw_running if dhw_running else running)
            result["overshoot"] = spread_stats(over).as_dict()
            result["overshoot_daily"] = {day.isoformat(): value for day, value in sorted(hourly_daily_median(over, tz).items())}

        def state_value(entity_id: str | None) -> tuple[float | None, str | None]:
            if not entity_id:
                return None, None
            state = self.hass.states.get(entity_id)
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return None, None
            return _as_float(state.state), state.attributes.get("unit_of_measurement")

        flow_now, _ = state_value(hp_flow_id)
        return_now, _ = state_value(return_id)
        volume_now, _ = state_value(volume_id)
        power_value, power_unit = state_value(power_now_id)
        result["live"] = hydraulics_live(
            hp_flow=flow_now,
            hp_return=return_now,
            volume_l_min=volume_now,
            power=power_kw(power_value, power_unit),
            running=self._on_off(compressor_id),
        )
        return result

    def circuit_target(self, circuit: dict) -> tuple[str | None, bool]:
        """Soll-Vorlauf eines Kreises: eingetragen oder – bei Stiebel Eltron – zum Ist passend abgeleitet."""
        target = circuit.get(CONF_TARGET_ENTITY)
        if target:
            return target, False
        if str(circuit.get("type")) == "buffer":
            return None, False  # Pufferkreis: das Kreis-Soll der Regelung ist kein Vorlauf-Soll
        actual = str(circuit.get(CONF_TEMPERATURE_ENTITY) or "")
        if "ist_temperatur" in actual:
            guess = actual.replace("ist_temperatur", "soll_temperatur", 1)
            if self.hass.states.get(guess) is not None:
                return guess, True
        return None, False

    async def _read_circuit_flows(self) -> dict:
        """Vorlauf Ist − Soll je Heizkreis (Stundenmittel, 7 Tage) und Momentanwerte."""
        circuits = [c for c in self._circuits_config() if c.get(CONF_ID) and c.get(CONF_TEMPERATURE_ENTITY)]
        if not circuits:
            return {}
        pairs = {str(c[CONF_ID]): (c[CONF_TEMPERATURE_ENTITY], *self.circuit_target(c)) for c in circuits}
        wanted = {entity for actual, target, _ in pairs.values() for entity in (actual, target) if entity}
        hourly = await async_read_hourly(self.hass, wanted, DEVIATION_DAYS)

        def means(entity_id: str | None) -> dict:
            if not entity_id:
                return {}
            return {value.hour: value.mean for value in hourly.get(entity_id, []) if value.mean is not None}

        def now_value(entity_id: str | None) -> float | None:
            state = self.hass.states.get(entity_id) if entity_id else None
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return None
            return _as_float(state.state)

        result: dict = {}
        for circuit in circuits:
            circuit_id = str(circuit[CONF_ID])
            actual_id, target_id, inferred = pairs[circuit_id]
            pump_id = circuit.get(CONF_PUMP_ENTITY)
            running = share_per_hour(self._spans[pump_id], means(actual_id).keys()) if pump_id and pump_id in (self._spans or {}) else None
            deviation_hours = overshoot_hours(means(actual_id), means(target_id), running) if target_id else {}
            actual_now, target_now = now_value(actual_id), now_value(target_id)
            result[circuit_id] = {
                "actual": actual_now,
                "target": target_now,
                "deviation_now": round(actual_now - target_now, 2) if actual_now is not None and target_now is not None else None,
                "deviation": spread_stats(deviation_hours).as_dict() if deviation_hours else None,
                "target_entity": target_id,
                "target_inferred": inferred,
            }
        return result

    async def _read_dhw(self) -> dict:
        """Warmwasserspeicher: Ist/Soll, Ladepumpe, Ladungen pro Tag, Abkühlung."""
        temp_id = self._entity(CONF_DHW_TEMP_ENTITY)
        target_id = self._entity(CONF_DHW_TARGET_ENTITY)
        pump_id = self._entity(CONF_DHW_PUMP_ENTITY)
        op_id = self._entity(CONF_DHW_OPERATION_ENTITY)
        if not temp_id:
            return {}
        now = dt_util.utcnow()
        window_start = now - timedelta(days=HISTORY_ONOFF_DAYS)
        hourly = await async_read_hourly(self.hass, {temp_id}, HISTORY_ONOFF_DAYS)
        temps = {value.hour: value.mean for value in hourly.get(temp_id, []) if value.mean is not None}
        spans = (self._spans or {}).get(op_id or pump_id or "", [])
        charging = share_per_hour(spans, temps.keys()) if spans else {}
        stats = dhw_stats(spans, temps, charging, window_start=window_start, now=now)

        def now_value(entity_id: str | None) -> float | None:
            state = self.hass.states.get(entity_id) if entity_id else None
            if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return None
            return _as_float(state.state)

        return {
            "temperature": now_value(temp_id),
            "target": now_value(target_id),
            "pump_on": self._on_off(pump_id),
            "charging": self._on_off(op_id) if op_id else self._on_off(pump_id),
            **stats.as_dict(),
        }

    async def _refresh_costs(self) -> None:
        """Kosten und Wasser – stündlich neu, weil sich Preise und Zähler nur stündlich ändern."""
        now = dt_util.utcnow()
        if self._costs_at is not None and now - self._costs_at < timedelta(minutes=55):
            return
        self._costs_at = now
        try:
            self._costs = await self._read_costs(now)
        except Exception as err:  # noqa: BLE001 - Kosten sind Zusatz, nie ein Abbruchgrund
            _LOGGER.debug("Kosten nicht berechenbar: %s", err)
            self._costs = {}

    async def _read_costs(self, now: datetime) -> dict:
        prefs = await async_read_energy_prefs(self.hass)
        tz = dt_util.get_default_time_zone()
        first = month_start(now, tz)
        since = min(first.astimezone(dt_util.UTC), now - timedelta(days=30))
        power_id = self.entry.data[CONF_POWER_ENTITY]
        heat_id = self.entry.data[CONF_HEAT_ENTITY]
        dhw_power_id = self._entity(CONF_DHW_POWER_ENTITY)
        dhw_heat_id = self._entity(CONF_DHW_HEAT_ENTITY)
        usage = await async_read_hourly_change(self.hass, {power_id, heat_id, dhw_power_id, dhw_heat_id}, since)

        price_id = prefs.get("grid_price_entity")
        prices: list[tuple[datetime, float]] = []
        if price_id:
            rows = await async_read_history(self.hass, {price_id}, (now - since).total_seconds() / 86400 + 1)
            prices = numeric_changes((at, state) for at, state, _attrs in rows.get(price_id, []))
            if prices and max(price for _at, price in prices) > 5:
                prices = [(at, price / 100) for at, price in prices]  # ct/kWh statt €/kWh
        fixed = prefs.get("grid_price")
        last_30 = now - timedelta(days=30)

        def period(start: datetime) -> dict:
            heating = weighted_cost(usage.get(power_id, {}), prices, fallback_price=fixed, since=start)
            dhw = weighted_cost(usage.get(dhw_power_id, {}), prices, fallback_price=fixed, since=start) if dhw_power_id else None
            heat = sum(v for h, v in usage.get(heat_id, {}).items() if h >= start and v and v > 0)
            dhw_heat = sum(v for h, v in usage.get(dhw_heat_id, {}).items() if h >= start and v and v > 0) if dhw_heat_id else 0.0
            total = None
            if heating.eur is not None or (dhw and dhw.eur is not None):
                total = round((heating.eur or 0) + ((dhw.eur if dhw else 0) or 0), 2)
            return {
                "heating": heating.as_dict(),
                "dhw": dhw.as_dict() if dhw else None,
                "heat_kwh": round(heat, 1),
                "dhw_heat_kwh": round(dhw_heat, 1),
                "total_eur": total,
                "heat_price_ct": heat_price_ct(total, heat + dhw_heat),
            }

        result: dict = {
            "price_entity": price_id,
            "price_now": prices[-1][1] if prices else fixed,
            "price_fixed": fixed,
            "feed_in_price": prefs.get("feed_in_price"),
            "month": period(first.astimezone(dt_util.UTC)),
            "last_30_days": period(last_30),
        }

        water_id = self._entity("water_entity") or prefs.get("water_entity")
        if water_id:
            daily = await async_read_daily(self.hass, {water_id}, 32)
            changes = {value.day: value.change for value in daily.get(water_id, []) if value.change is not None}
            clean = clean_water_days(changes)
            water_price = prefs.get("water_price")
            if water_price is None and prefs.get("water_price_entity"):
                state = self.hass.states.get(prefs["water_price_entity"])
                water_price = _as_float(state.state) if state is not None else None
            today = now.astimezone(tz).date()
            month_m3 = sum_since(clean, first.date())
            m30 = sum_since(clean, (now - timedelta(days=30)).astimezone(tz).date())
            result["water"] = {
                "entity": water_id,
                "price_eur_m3": water_price,
                "today_m3": round(clean.get(today, 0.0), 3),
                "month_m3": round(month_m3, 3),
                "month_eur": round(month_m3 * water_price, 2) if water_price is not None else None,
                "last_30_days_m3": round(m30, 3),
                "skipped_days": len(changes) - len(clean),
            }
        return result

    async def _read_hours(
        self,
        flow_id: str | None,
        target_flow_id: str | None,
        compressor_id: str | None,
        dhw_op_id: str | None = None,
        outdoor_id: str | None = None,
    ) -> tuple[list[HourSample], bool]:
        """Stundenwerte für die Vorlauf-Abweichung.

        Liefert zusätzlich, ob nach Verdichterlauf gefiltert werden konnte.
        Ohne Verdichterstatistik wird über alle Stunden gerechnet; das wird
        am Sensor als Attribut ausgewiesen.
        """
        if not flow_id or not target_flow_id:
            return [], False

        wanted = {flow_id, target_flow_id, compressor_id, dhw_op_id, outdoor_id}
        hourly = await async_read_hourly(self.hass, wanted, DEVIATION_DAYS)

        flow = {value.hour: value.mean for value in hourly.get(flow_id, []) if value.mean is not None}
        target = {value.hour: value.mean for value in hourly.get(target_flow_id, []) if value.mean is not None}
        compressor = {
            value.hour: value.mean for value in (hourly.get(compressor_id, []) if compressor_id else []) if value.mean is not None
        }
        outdoor = {value.hour: value.mean for value in (hourly.get(outdoor_id, []) if outdoor_id else []) if value.mean is not None}
        if not compressor and compressor_id and self._spans.get(compressor_id) is not None:
            # Binärsensor ohne Statistik: Laufanteil je Stunde aus dem Zustandsverlauf
            compressor = share_per_hour(self._spans[compressor_id], flow.keys())
        filtered = bool(compressor)

        dhw_op: dict = {}
        if dhw_op_id:
            rows = hourly.get(dhw_op_id, [])
            if rows:
                dhw_op = {value.hour: value.mean for value in rows if value.mean is not None}
            elif dhw_op_id in (self._spans or {}):
                dhw_op = share_per_hour(self._spans[dhw_op_id], flow.keys())
        dhw_filtered = bool(dhw_op)

        hours: list[HourSample] = []
        for hour, flow_c in flow.items():
            if hour not in target:
                continue
            if dhw_filtered and dhw_op.get(hour, 0.0) > 0.5:
                # Warmwasser-Ladung: Vorlauf ist dann nicht der Puffer-Sollwert
                continue
            running = None
            if compressor:
                running = compressor.get(hour, 0.0) > 0.5
            hours.append(
                HourSample(
                    hour=hour,
                    flow_c=flow_c,
                    target_flow_c=target[hour],
                    compressor_on=running,
                    outdoor_c=outdoor.get(hour),
                )
            )
        return sorted(hours, key=lambda item: item.hour), filtered
