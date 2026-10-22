import React, { useState } from 'react';
import { Zone, WaterConsumptionRecord } from '../../types';
import { DataStore } from '../../services/dataService';
import { BarChart3, Calendar, Filter, TrendingUp, Droplets, Activity } from 'lucide-react';

interface AnalyticsViewProps {
  zones: Zone[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ zones }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [dateRangeDays, setDateRangeDays] = useState<number>(60);

  const allHistory = DataStore.getHistory();

  // Filter records
  const filteredRecords = allHistory.filter((r) => {
    const matchZone = selectedZoneId === 'all' || r.zone_id === selectedZoneId;
    const matchSeason = selectedSeason === 'all' || r.season === selectedSeason;
    return matchZone && matchSeason;
  });

  // Group by date for aggregate daily series
  const dateMap: Record<string, { supplied: number; consumed: number; count: number; tempSum: number }> = {};
  filteredRecords.forEach((r) => {
    if (!dateMap[r.date]) {
      dateMap[r.date] = { supplied: 0, consumed: 0, count: 0, tempSum: 0 };
    }
    dateMap[r.date].supplied += r.supplied_water;
    dateMap[r.date].consumed += r.consumed_water;
    dateMap[r.date].tempSum += r.temperature;
    dateMap[r.date].count += 1;
  });

  const dailySeries = Object.keys(dateMap)
    .sort()
    .slice(-dateRangeDays)
    .map((d) => ({
      date: d,
      supplied: Math.round(dateMap[d].supplied * 10) / 10,
      consumed: Math.round(dateMap[d].consumed * 10) / 10,
      loss: Math.round((dateMap[d].supplied - dateMap[d].consumed) * 10) / 10,
      lossPct: Math.round(((dateMap[d].supplied - dateMap[d].consumed) / (dateMap[d].supplied || 1)) * 1000) / 10,
      avgTemp: Math.round((dateMap[d].tempSum / dateMap[d].count) * 10) / 10,
    }));

  // Zone comparisons
  const zoneSummary = zones.map((z) => {
    const zRecs = allHistory.filter((r) => r.zone_id === z.id);
    const avgConsumed = zRecs.length > 0 
      ? Math.round((zRecs.reduce((sum, r) => sum + r.consumed_water, 0) / zRecs.length) * 10) / 10
      : z.predicted_demand_ml;
    const avgSupplied = zRecs.length > 0
      ? Math.round((zRecs.reduce((sum, r) => sum + r.supplied_water, 0) / zRecs.length) * 10) / 10
      : z.current_supply_ml;
    const lossPct = Math.round(((avgSupplied - avgConsumed) / (avgSupplied || 1)) * 1000) / 10;

    return {
      name: z.name.split('·')[0].trim(),
      code: z.code,
      consumed: avgConsumed,
      supplied: avgSupplied,
      lossPct,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header & Global Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <span>Municipal Hydrological Analytics & Flow Trends</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Long-horizon statistical metrics covering seasonal elasticity, diurnal loss patterns, and district volumetric balances
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="all">All 8 Districts (Metropolitan Network)</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.code} · {z.name.split('·')[1]?.trim() || z.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="all">All Seasons</option>
              <option value="summer">Summer (Peak Heat)</option>
              <option value="monsoon">Monsoon (Rain Substitution)</option>
              <option value="winter">Winter</option>
              <option value="spring">Spring</option>
            </select>

            <select
              value={dateRangeDays}
              onChange={(e) => setDateRangeDays(parseInt(e.target.value, 10))}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value={30}>Last 30 Days</option>
              <option value={60}>Last 60 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={180}>Full 180 Days Telemetry</option>
            </select>
          </div>
        </div>

        {/* Aggregate KPI Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans uppercase">Filtered Records</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              {filteredRecords.length.toLocaleString()} data points
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-sans uppercase">Network Water Pumped</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              {Math.round(filteredRecords.reduce((sum, r) => sum + r.supplied_water, 0)).toLocaleString()} ML
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-sans uppercase">Consumer Draw</span>
            <span className="text-base font-bold text-sky-600 dark:text-sky-400">
              {Math.round(filteredRecords.reduce((sum, r) => sum + r.consumed_water, 0)).toLocaleString()} ML
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-sans uppercase">Mean Loss Rate</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              {dailySeries.length > 0 
                ? Math.round((dailySeries.reduce((s, d) => s + d.lossPct, 0) / dailySeries.length) * 10) / 10
                : 13.5}%
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Chart 1: Daily Bulk Supply vs Consumed Water */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              1. Daily Bulk Supply vs Metered Consumption Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Net mass transmission balance over the selected {dateRangeDays}-day interval
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-400 rounded-xs"></span>
              <span>Supplied</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-sky-600 rounded-xs"></span>
              <span>Consumed</span>
            </span>
          </div>
        </div>

        {/* SVG Sparkline / Multi-Bar Area */}
        <div className="mt-4 overflow-x-auto">
          <svg viewBox="0 0 800 220" className="w-full h-auto max-h-56">
            {/* Gridlines */}
            {[0, 50, 100, 150, 200, 250].map((tick, i) => (
              <g key={i}>
                <line x1="40" y1={200 - (tick / 250) * 180} x2="780" y2={200 - (tick / 250) * 180} stroke="#334155" strokeOpacity="0.15" strokeDasharray="2,2" />
                <text x="32" y={204 - (tick / 250) * 180} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="JetBrains Mono">{tick}</text>
              </g>
            ))}

            {/* Supplied curve */}
            {dailySeries.length > 1 && (
              <path
                d={dailySeries.map((d, i) => `${i === 0 ? 'M' : 'L'} ${40 + (i / (dailySeries.length - 1)) * 740} ${200 - (d.supplied / 250) * 180}`).join(' ')}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
              />
            )}

            {/* Consumed curve */}
            {dailySeries.length > 1 && (
              <path
                d={dailySeries.map((d, i) => `${i === 0 ? 'M' : 'L'} ${40 + (i / (dailySeries.length - 1)) * 740} ${200 - (d.consumed / 250) * 180}`).join(' ')}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
              />
            )}

            {/* X-axis labels */}
            {dailySeries.filter((_, idx) => idx % Math.max(1, Math.floor(dailySeries.length / 6)) === 0).map((d, idx) => {
              const originalIndex = dailySeries.findIndex((item) => item.date === d.date);
              const x = 40 + (originalIndex / (dailySeries.length - 1)) * 740;
              return (
                <text key={idx} x={x} y="215" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="JetBrains Mono">
                  {d.date.slice(5)}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Two Column Grid: Zone Comparisons & Loss Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: District Mean Consumption */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              2. District Volumetric Distribution (Mean ML/d)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Average daily consumption volume across all 8 municipal zones
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {zoneSummary.map((z) => (
              <div key={z.code}>
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-sans font-medium text-slate-800 dark:text-slate-200">
                    {z.name} ({z.code})
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 tabular-nums">
                    {z.consumed} ML/d
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-xs"
                    style={{ width: `${(z.consumed / 55) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Water Loss Rate by Zone */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              3. Non-Revenue Water (NRW) Loss Percentage by District
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Critical leakage containment threshold at 20.0%
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {zoneSummary.map((z) => {
              const isWarning = z.lossPct >= 20;
              return (
                <div key={z.code}>
                  <div className="flex items-center justify-between text-xs mb-1 font-mono">
                    <span className="font-sans font-medium text-slate-800 dark:text-slate-200">
                      {z.name} ({z.code})
                    </span>
                    <span className={`tabular-nums font-semibold ${isWarning ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
                      {z.lossPct}% {isWarning && '⚠ Warning'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                    <div
                      className={`h-full rounded-xs ${isWarning ? 'bg-amber-600' : 'bg-slate-400'}`}
                      style={{ width: `${(z.lossPct / 35) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
