"""Datensammlung und Kennzahlen.

Der Coordinator liest die Langzeitstatistik, baut daraus Tagesproben und
berechnet die Kennzahlen der Analyseschicht. Er steuert nichts.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from time import perf_counter

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_OFF, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .analysis.circuits import CircuitSample, CircuitStats, MixerSample, MixerStats
from .analysis.cop import CopBin, CopResult, cop_curve, cop_window
from .analysis.cycling import mean_runtime_per_cycle, starts_per_day
from .analysis.event_log import (
    config_diff,
    config_snapshot,
    finding_diff,
    should_log_update,
    update_signature,
)
from .analysis.findings import Finding, FindingsInput, Thresholds, evaluate, signature
from .analysis.heating_curve import CurveBin, DeviationResult, curve_bins, deviation
from .analysis.rooms import RoomDeviation, RoomReading
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
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_DEFROST_ENTITY,
    CONF_DHW_HEAT_ENTITY,
    CONF_FLOW_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_ID,
    CONF_MIXER_CLOSE_ENTITY,
    CONF_MIXER_OPEN_ENTITY,
    CONF_NAME,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_POWER_FALLBACK_ENTITY,
    CONF_PUMP_ENTITY,
    CONF_ROOMS,
    CONF_TARGET_FLOW_ENTITY,
    CONF_THRESHOLDS,
    CONF_VALVE_POSITION_ENTITY,
    COP_LONG_DAYS,
    COP_SHORT_DAYS,
    DEVIATION_DAYS,
    DOMAIN,
    EVENT_FINDINGS,
    HEATING_UP_MAX_MINUTES,
    HEATING_UP_TOLERANCE,
    HEATING_UP_TRIGGER,
    HISTORY_DAYS,
    MIXER_RESOLUTION_MINUTES,
    POWER_SOURCE_FALLBACK,
    POWER_SOURCE_PRIMARY,
    ROOM_MIN_TARGET,
    ROOM_TOLERANCE,
    ROOM_WINDOW_DAYS,
    UPDATE_INTERVAL_MINUTES,
)
from .data_access import async_read_daily, async_read_hourly
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
    CONF_POWER_ENTITY: "power",
    CONF_POWER_FALLBACK_ENTITY: "power",
    CONF_OUTDOOR_ENTITY: "temperature",
    CONF_FLOW_ENTITY: "temperature",
    CONF_TARGET_FLOW_ENTITY: "temperature",
    CONF_BUFFER_ENTITY: "temperature",
    CONF_COMPRESSOR_ENTITY: "binary",
    CONF_COMPRESSOR_STARTS_ENTITY: "binary",
    CONF_COMPRESSOR_RUNTIME_ENTITY: "binary",
    CONF_DEFROST_ENTITY: "binary",
    CONF_AUX_HEATER_ENTITY: "binary",
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


EMPTY_COP = CopResult(None, 0.0, 0.0, 0, None)


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

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, *, log: EventLog | None = None) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=UPDATE_INTERVAL_MINUTES),
        )
        self.entry = entry
        self.log = log
        self._rooms = RoomTracker(window_days=ROOM_WINDOW_DAYS)
        self._circuit_tracker = CircuitTracker(window_days=ROOM_WINDOW_DAYS)
        self._mixer_tracker = MixerTracker(window_days=ROOM_WINDOW_DAYS)
        self._findings_signature: str | None = None
        self._findings_by_id: dict[str, str] = {}
        self._sources_state: dict[str, str] = {}
        self._no_statistics: set[str] = set()
        self._run_index = 0
        self._update_signature: tuple | None = None
        self._source_counts: dict[str, int] = {}
        self._unit_warned: set[str] = set()
        self._class_warned: set[str] = set()
        self._flow_hours: list[HourSample] = []
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
        }
        daily = await async_read_daily(self.hass, wanted, HISTORY_DAYS)

        power_source, power_id = self._select_power(daily, primary_power_id, fallback_power_id)

        samples = build_samples(
            heat=energy_by_day(daily.get(heat_id, [])),
            power=energy_by_day(daily.get(power_id, [])) if power_id else {},
            outdoor=mean_by_day(daily.get(outdoor_id, [])),
            starts=counter_by_day(daily.get(starts_id, [])) if starts_id else {},
            runtime=counter_by_day(daily.get(runtime_id, [])) if runtime_id else {},
            flow=mean_by_day(daily.get(flow_id, [])) if flow_id else {},
            target_flow=mean_by_day(daily.get(target_flow_id, [])) if target_flow_id else {},
            dhw_heat=energy_by_day(daily.get(dhw_id, [])) if dhw_id else {},
            aux_hours=_hours_by_day(daily.get(aux_id, [])) if aux_id else {},
            defrost_hours=_hours_by_day(daily.get(defrost_id, [])) if defrost_id else {},
        )

        hours, compressor_filtered = await self._read_hours(flow_id, target_flow_id, compressor_id)
        self._flow_hours = hours
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
            deviation=deviation(hours),
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
        )

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

        results = FindingsInput(
            cop=cop_short.cop,
            cop_days=cop_short.days,
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
            primary_energy=_energy_total(daily.get(primary_id, [])),
            fallback_energy=_energy_total(daily.get(fallback_id, [])) if fallback_id else None,
        )
        findings = evaluate(results, thresholds)
        await self._log_findings(findings)
        self._publish_findings(findings)
        return findings

    async def _log_findings(self, findings: list[Finding]) -> None:
        """Neue, geänderte und erledigte Hinweise protokollieren."""
        current = {finding.id: self._finding_key(finding) for finding in findings}
        changes = finding_diff(self._findings_by_id, current)
        self._findings_by_id = current
        if not changes or self.log is None:
            return
        by_id = {finding.id: finding for finding in findings}
        from .summary import TITLES

        for finding_id, old, new in changes:
            finding = by_id.get(finding_id)
            title = TITLES["de"].get(finding.key, finding_id) if finding is not None else finding_id
            if old and not new:
                await self.log.async_add(
                    "info",
                    "finding",
                    f"Hinweis {finding_id} erledigt",
                    key="finding.resolved",
                    params={"id": finding_id, "title": title},
                    details={"id": finding_id, "previous": old},
                )
            elif finding is None:
                await self.log.async_add(
                    "info",
                    "finding",
                    f"Hinweis {finding_id} geändert",
                    key="finding.changed",
                    params={"id": finding_id, "title": title},
                    details={"id": finding_id, "previous": old, "current": new},
                )
            else:
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
            if not daily.get(entity_id):
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
        if state.state in (STATE_OFF, STATE_UNAVAILABLE, STATE_UNKNOWN):
            return "off"
        target = _as_float(state.attributes.get("temperature"))
        current = _as_float(state.attributes.get("current_temperature"))
        if current is None:
            return "no_values"
        if target is None:
            return "no_target"
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
        if state is None or state.state in (STATE_OFF, STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        current = _as_float(state.attributes.get("current_temperature"))
        target = _as_float(state.attributes.get("temperature"))
        if current is None or target is None:
            return None
        if target < ROOM_MIN_TARGET:
            # Frostschutz oder bewusst abgeschaltet: kein Komfortziel, keine Raumhinweise
            return None
        valve = None
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

    async def _read_hours(
        self,
        flow_id: str | None,
        target_flow_id: str | None,
        compressor_id: str | None,
    ) -> tuple[list[HourSample], bool]:
        """Stundenwerte für die Vorlauf-Abweichung.

        Liefert zusätzlich, ob nach Verdichterlauf gefiltert werden konnte.
        Ohne Verdichterstatistik wird über alle Stunden gerechnet; das wird
        am Sensor als Attribut ausgewiesen.
        """
        if not flow_id or not target_flow_id:
            return [], False

        wanted = {flow_id, target_flow_id, compressor_id}
        hourly = await async_read_hourly(self.hass, wanted, DEVIATION_DAYS)

        flow = {value.hour: value.mean for value in hourly.get(flow_id, []) if value.mean is not None}
        target = {value.hour: value.mean for value in hourly.get(target_flow_id, []) if value.mean is not None}
        compressor = {
            value.hour: value.mean for value in (hourly.get(compressor_id, []) if compressor_id else []) if value.mean is not None
        }
        filtered = bool(compressor)

        hours: list[HourSample] = []
        for hour, flow_c in flow.items():
            if hour not in target:
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
                )
            )
        return sorted(hours, key=lambda item: item.hour), filtered
