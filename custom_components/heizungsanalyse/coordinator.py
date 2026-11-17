"""Datensammlung und Kennzahlen.

Der Coordinator liest die Langzeitstatistik, baut daraus Tagesproben und
berechnet die Kennzahlen der Analyseschicht. Er steuert nichts.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .analysis.cop import CopBin, CopResult, cop_curve, cop_window
from .analysis.cycling import mean_runtime_per_cycle, starts_per_day
from .analysis.heating_curve import CurveBin, DeviationResult, curve_bins, deviation
from .analysis.series import build_samples, counter_by_day, energy_by_day, mean_by_day
from .analysis.types import DaySample, HourSample
from .const import (
    CONF_BUFFER_ENTITY,
    CONF_COMPRESSOR_ENTITY,
    CONF_COMPRESSOR_RUNTIME_ENTITY,
    CONF_COMPRESSOR_STARTS_ENTITY,
    CONF_DHW_HEAT_ENTITY,
    CONF_FLOW_ENTITY,
    CONF_HEAT_ENTITY,
    CONF_OUTDOOR_ENTITY,
    CONF_POWER_ENTITY,
    CONF_POWER_FALLBACK_ENTITY,
    CONF_TARGET_FLOW_ENTITY,
    COP_LONG_DAYS,
    COP_SHORT_DAYS,
    DEVIATION_DAYS,
    DOMAIN,
    HISTORY_DAYS,
    POWER_SOURCE_FALLBACK,
    POWER_SOURCE_PRIMARY,
    UPDATE_INTERVAL_MINUTES,
)
from .data_access import async_read_daily, async_read_hourly

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


EMPTY_COP = CopResult(None, 0.0, 0.0, 0, None)


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
        )

        hours, compressor_filtered = await self._read_hours(flow_id, target_flow_id, compressor_id)

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
        )

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
