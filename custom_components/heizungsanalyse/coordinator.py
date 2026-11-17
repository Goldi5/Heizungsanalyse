"""Datensammlung und Kennzahlen.

Der Coordinator liest die Langzeitstatistik, baut daraus Tagesproben und
berechnet die Kennzahlen der Analyseschicht. Er steuert nichts.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_OFF, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .analysis.circuits import CircuitSample, CircuitStats, MixerSample, MixerStats
from .analysis.cop import CopBin, CopResult, cop_curve, cop_window
from .analysis.cycling import mean_runtime_per_cycle, starts_per_day
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
    ROOM_TOLERANCE,
    ROOM_WINDOW_DAYS,
    UPDATE_INTERVAL_MINUTES,
)
from .data_access import async_read_daily, async_read_hourly
from .tracking import CircuitTracker, MixerTracker, RoomTracker, rank_rooms_with_circuits

_LOGGER = logging.getLogger(__name__)


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

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=UPDATE_INTERVAL_MINUTES),
        )
        self.entry = entry
        self._rooms = RoomTracker(window_days=ROOM_WINDOW_DAYS)
        self._circuit_tracker = CircuitTracker(window_days=ROOM_WINDOW_DAYS)
        self._mixer_tracker = MixerTracker(window_days=ROOM_WINDOW_DAYS)
        self._findings_signature: str | None = None

    async def _async_update_data(self) -> AnalysisSnapshot:
        try:
            return await self._collect()
        except (KeyError, TypeError, ValueError) as err:
            raise UpdateFailed(str(err)) from err

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

        now = dt_util.utcnow()
        self._track(now)
        room_stats = self._rooms.stats(ROOM_TOLERANCE)
        circuit_of = {room[CONF_ID]: room.get(CONF_CIRCUIT) for room in self._rooms_config() if CONF_ID in room}

        thresholds = Thresholds.from_options(self.entry.options.get(CONF_THRESHOLDS))
        findings = self._evaluate_findings(
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

    def _evaluate_findings(
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
        self._publish_findings(findings)
        return findings

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
        """Aktuelle Zustaende als Stichprobe sichern (nur lesend)."""
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
        """Primaerquelle, solange sie Daten liefert; sonst die Ersatzquelle."""
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
        """Stundenwerte fuer die Vorlauf-Abweichung.

        Liefert zusaetzlich, ob nach Verdichterlauf gefiltert werden konnte.
        Ohne Verdichterstatistik wird ueber alle Stunden gerechnet; das wird
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
