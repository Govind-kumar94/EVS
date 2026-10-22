import React, { useState } from 'react';
import { Zone, AIModelType, ZoneForecastResult, WaterConsumptionRecord } from '../../types';
import { MLEngine } from '../../services/mlEngine';
import { DataStore } from '../../services/dataService';
import { ForecastLineChart } from '../charts/LineChart';
import {
  TrendingUp,
  Cpu,
  Calendar,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Download,
} from 'lucide-react';
import { CsvService } from '../../services/csvService';

interface ForecastingViewProps {
  zones: Zone[];
  selectedZone: Zone;
  onSelectZone: (zone: Zone) => void;
}

export const ForecastingView: React.FC<ForecastingViewProps> = ({
  zones,
  selectedZone,
  onSelectZone,
}) => {
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('7d');
  const [modelType, setModelType] = useState<AIModelType>('XGBoost');
  const [isLoading, setIsLoading] = useState(false);

  // Compute forecast
  const [forecastResult, setForecastResult] = useState<ZoneForecastResult>(() =>
    MLEngine.runForecast(selectedZone.id, period, modelType)
  );

  // Historical records for this zone
  const historyRecords = DataStore.getHistory().filter((r) => r.zone_id === selectedZone.id);
  const historicalData = historyRecords.map((r) => ({
    date: r.date,
    value: r.consumed_water,
  }));

  const handleRunForecast = () => {
    setIsLoading(true);
    setTimeout(() => {
      const res = MLEngine.runForecast(selectedZone.id, period, modelType);
      setForecastResult(res);
      setIsLoading(false);
    }, 200);
  };

  const handleExportForecast = () => {
    const rows = forecastResult.forecasts.map((f) => ({
      date: f.date,
      zone: selectedZone.name,
      predicted_demand_ml: f.predicted_demand,
      confidence_pct: f.confidence_score,
      risk_level: f.risk_level,
      available_supply_ml: f.available_supply,
      expected_shortage_ml: f.expected_shortage,
    }));
    CsvService.exportToCsv(`forecast_${selectedZone.code}_${period}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Parameter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              <span>AI Demand Forecasting Engine</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-horizon time-series regression powered by local supervised learning and meteorological covariates
            </p>
          </div>

          <button
            onClick={handleExportForecast}
            className="self-start md:self-auto px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Forecast CSV</span>
          </button>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Zone Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select District / Zone
            </label>
            <select
              value={selectedZone.id}
              onChange={(e) => {
                const z = zones.find((item) => item.id === e.target.value);
                if (z) {
                  onSelectZone(z);
                  const res = MLEngine.runForecast(z.id, period, modelType);
                  setForecastResult(res);
                }
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.code} · {z.name.split('·')[1]?.trim() || z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Horizon Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded border border-slate-200 dark:border-slate-700">
              {(['1d', '7d', '30d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPeriod(p);
                    const res = MLEngine.runForecast(selectedZone.id, p, modelType);
                    setForecastResult(res);
                  }}
                  className={`py-1 text-xs font-medium rounded transition-colors ${
                    period === p
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {p === '1d' ? 'Next Day' : p === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Machine Learning Algorithm
            </label>
            <select
              value={modelType}
              onChange={(e) => {
                const m = e.target.value as AIModelType;
                setModelType(m);
                const res = MLEngine.runForecast(selectedZone.id, period, m);
                setForecastResult(res);
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500 font-mono"
            >
              <option value="XGBoost">XGBoost (Gradient Boosted Trees)</option>
              <option value="Random Forest">Random Forest Regressor</option>
              <option value="Linear Regression">Linear / Ridge Regression</option>
              <option value="LSTM">LSTM / Recurrent Exponential Model</option>
            </select>
          </div>

          {/* Action Trigger */}
          <div className="flex items-end">
            <button
              onClick={handleRunForecast}
              disabled={isLoading}
              className="w-full py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>{isLoading ? 'Training & Computing...' : 'Run Forecast'}</span>
            </button>
          </div>
        </div>

        {/* Input Features Pill-free strip */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-300">Features Activated:</span>
          <span>Lag-1 / Lag-7 Consumption</span>
          <span aria-hidden="true">·</span>
          <span>7-Day Rolling Moving Mean</span>
          <span aria-hidden="true">·</span>
          <span>Ambient Temperature (°C)</span>
          <span aria-hidden="true">·</span>
          <span>Precipitation Rainfall (mm)</span>
          <span aria-hidden="true">·</span>
          <span>Weekend/Weekday Shift</span>
          <span aria-hidden="true">·</span>
          <span>Demographic Baseline ({selectedZone.population.toLocaleString()})</span>
        </div>
      </div>

      {/* Summary KPI Strip for Current Forecast */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Avg Daily Demand
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {forecastResult.summary.avg_daily_demand}
            </span>
            <span className="text-xs text-slate-500">ML/d</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Total for period: {forecastResult.summary.total_projected_demand} ML
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Peak Demand Date
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {forecastResult.summary.max_demand_value}
            </span>
            <span className="text-xs text-slate-500">ML</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
            Projected on {forecastResult.summary.max_demand_day}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Model Confidence
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {forecastResult.summary.avg_confidence}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Algorithm: {modelType}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Projected Shortage
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span
              className={`text-xl font-bold tabular-nums ${
                forecastResult.summary.projected_shortage > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {forecastResult.summary.projected_shortage > 0
                ? `-${forecastResult.summary.projected_shortage}`
                : '0.0'}
            </span>
            <span className="text-xs text-slate-500">ML</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-sans capitalize">
            Highest Risk: {forecastResult.summary.highest_risk}
          </span>
        </div>
      </div>

      {/* Forecast Line Chart Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Demand Trajectory & Upper/Lower Envelopes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              14-day historical consumption linked to {period} forward projection with 95% confidence interval
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Current Supply Allocation: {selectedZone.current_supply_ml} ML/d
          </div>
        </div>

        <div className="mt-4">
          <ForecastLineChart
            historicalData={historicalData}
            forecastData={forecastResult.forecasts}
            availableSupply={selectedZone.current_supply_ml}
          />
        </div>
      </div>

      {/* Detailed Forecast Schedule Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Day-by-Day Forecast Schedule ({forecastResult.forecasts.length} Days)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabular parameters outputted by {modelType} model
          </p>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 pr-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium">Day</th>
                <th className="py-2.5 px-3 font-medium text-right">Predicted Demand</th>
                <th className="py-2.5 px-3 font-medium text-right">95% CI Range</th>
                <th className="py-2.5 px-3 font-medium text-right">Allocated Supply</th>
                <th className="py-2.5 px-3 font-medium text-right">Shortage</th>
                <th className="py-2.5 px-3 font-medium text-right">Confidence</th>
                <th className="py-2.5 pl-3 font-medium text-right">Risk Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {forecastResult.forecasts.map((f, i) => {
                const isShortage = f.expected_shortage > 0;
                return (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 pr-3 text-slate-900 dark:text-slate-100">{f.date}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans">{f.dayName}</td>
                    <td className="py-2.5 px-3 text-right text-sky-600 dark:text-sky-400 font-semibold">
                      {f.predicted_demand} ML
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                      [{f.lower_bound} – {f.upper_bound}]
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {f.available_supply} ML
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right ${
                        isShortage ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {isShortage ? `-${f.expected_shortage} ML` : '0.0 ML'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {f.confidence_score}%
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      <span
                        className={`font-sans capitalize text-[11px] font-medium ${
                          f.risk_level === 'critical'
                            ? 'text-rose-600 dark:text-rose-400'
                            : f.risk_level === 'high'
                            ? 'text-orange-600 dark:text-orange-400'
                            : f.risk_level === 'medium'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {f.risk_level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
