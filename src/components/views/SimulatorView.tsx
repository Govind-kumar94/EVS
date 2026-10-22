import React, { useState } from 'react';
import { SimulationParams, SimulationResult } from '../../types';
import { SimulatorEngine } from '../../services/simulatorEngine';
import { FlaskConical, Play, RotateCcw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    available_water_ml: 195,
    temperature_change_c: 3,
    rainfall_change_pct: -20,
    population_change_pct: 5,
  });

  const [simResult, setSimResult] = useState<SimulationResult>(() =>
    SimulatorEngine.runSimulation({
      available_water_ml: 195,
      temperature_change_c: 3,
      rainfall_change_pct: -20,
      population_change_pct: 5,
    })
  );

  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = SimulatorEngine.runSimulation(params);
      setSimResult(res);
      setIsSimulating(false);
    }, 250);
  };

  const applyPreset = (presetParams: SimulationParams) => {
    setParams(presetParams);
    const res = SimulatorEngine.runSimulation(presetParams);
    setSimResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              <span>Hydrological What-If Scenario Simulator</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate climate shifts, demographic surges, and reservoir depletion to pressure-test municipal resilience
            </p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1 font-medium">Presets:</span>
            <button
              onClick={() =>
                applyPreset({
                  available_water_ml: 160,
                  temperature_change_c: 4,
                  rainfall_change_pct: -35,
                  population_change_pct: 2,
                })
              }
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              Summer Heatwave (+4°C)
            </button>
            <button
              onClick={() =>
                applyPreset({
                  available_water_ml: 120,
                  temperature_change_c: 2,
                  rainfall_change_pct: -50,
                  population_change_pct: 0,
                })
              }
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              Reservoir Drought (120 ML)
            </button>
            <button
              onClick={() =>
                applyPreset({
                  available_water_ml: 220,
                  temperature_change_c: 0,
                  rainfall_change_pct: 0,
                  population_change_pct: 8,
                })
              }
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              Demographic Growth (+8%)
            </button>
          </div>
        </div>

        {/* Simulator Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          {/* 1. Available Water */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Available Water
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {params.available_water_ml} ML
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="260"
              step="5"
              value={params.available_water_ml}
              onChange={(e) =>
                setParams({ ...params, available_water_ml: parseFloat(e.target.value) })
              }
              className="w-full accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>80 ML</span>
              <span>260 ML</span>
            </div>
          </div>

          {/* 2. Temperature Change */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Temperature Change
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {params.temperature_change_c >= 0 ? '+' : ''}
                {params.temperature_change_c}°C
              </span>
            </div>
            <input
              type="range"
              min="-4"
              max="8"
              step="0.5"
              value={params.temperature_change_c}
              onChange={(e) =>
                setParams({ ...params, temperature_change_c: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>-4°C</span>
              <span>+8°C</span>
            </div>
          </div>

          {/* 3. Rainfall Change */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Rainfall Change
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {params.rainfall_change_pct >= 0 ? '+' : ''}
                {params.rainfall_change_pct}%
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="5"
              value={params.rainfall_change_pct}
              onChange={(e) =>
                setParams({ ...params, rainfall_change_pct: parseFloat(e.target.value) })
              }
              className="w-full accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>-60% (Dry)</span>
              <span>+60% (Wet)</span>
            </div>
          </div>

          {/* 4. Population Change */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Population Change
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {params.population_change_pct >= 0 ? '+' : ''}
                {params.population_change_pct}%
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="25"
              step="1"
              value={params.population_change_pct}
              onChange={(e) =>
                setParams({ ...params, population_change_pct: parseFloat(e.target.value) })
              }
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>-10%</span>
              <span>+25%</span>
            </div>
          </div>
        </div>

        {/* Trigger Button */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-2 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current text-sky-400" />
            <span>{isSimulating ? 'Simulating Dynamic Grid...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Result KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Simulated Demand
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {simResult.simulated_demand_ml}
            </span>
            <span className="text-xs text-slate-500">ML/d</span>
          </div>
          <span
            className={`text-[10px] font-mono block mt-1 ${
              simResult.demand_change_pct >= 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {simResult.demand_change_pct >= 0 ? '+' : ''}
            {simResult.demand_change_pct}% vs Baseline ({simResult.baseline_demand_ml} ML)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Simulated Shortage
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span
              className={`text-xl font-bold tabular-nums ${
                simResult.simulated_shortage_ml > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
              }`}
            >
              {simResult.simulated_shortage_ml > 0 ? `-${simResult.simulated_shortage_ml}` : '0.0'}
            </span>
            <span className="text-xs text-slate-500">ML/d</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
            Deficit Rate: {simResult.shortage_rate_pct}%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            High Risk Districts
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span
              className={`text-xl font-bold tabular-nums ${
                simResult.high_risk_zones_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {simResult.high_risk_zones_count}
            </span>
            <span className="text-xs text-slate-500">/ 8 Zones</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Exceeding safe reserves</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Grid Delivery Efficiency
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {simResult.distribution_efficiency_pct}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Under simulated thermal stress</span>
        </div>
      </div>

      {/* Simulation Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            District Sensitivity & Shortage Under Simulated Stress
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Zone-by-zone projected impact comparing baseline versus perturbed climatic and demographic conditions
          </p>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 pr-4 font-medium">District</th>
                <th className="py-2.5 px-4 font-medium text-right">Baseline Demand</th>
                <th className="py-2.5 px-4 font-medium text-right">Simulated Demand</th>
                <th className="py-2.5 px-4 font-medium text-right">Current Supply</th>
                <th className="py-2.5 px-4 font-medium text-right">Projected Shortage</th>
                <th className="py-2.5 px-4 font-medium text-right">Projected Loss</th>
                <th className="py-2.5 pl-4 font-medium text-right">Simulated Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {simResult.zone_impacts.map((zi) => (
                <tr key={zi.zone_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-sans font-medium text-slate-900 dark:text-slate-100">
                    {zi.zone_name.split('·')[0].trim()}
                    <span className="text-slate-500 text-[11px] block font-normal">
                      {zi.zone_name.split('·')[1]?.trim() || zi.zone_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {zi.baseline_demand} ML
                  </td>
                  <td className="py-3 px-4 text-right text-sky-600 dark:text-sky-400 font-bold">
                    {zi.simulated_demand} ML
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                    {zi.current_supply} ML
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      zi.simulated_shortage > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {zi.simulated_shortage > 0 ? `-${zi.simulated_shortage} ML` : '0.0 ML'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {zi.simulated_loss} ML
                  </td>
                  <td className="py-3 pl-4 text-right font-sans">
                    <span
                      className={`capitalize text-[11px] font-semibold ${
                        zi.risk === 'critical'
                          ? 'text-rose-600 dark:text-rose-400'
                          : zi.risk === 'high'
                          ? 'text-orange-600 dark:text-orange-400'
                          : zi.risk === 'medium'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {zi.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Directives */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-slate-800">
          Executive Directives for Simulated Scenario
        </h3>
        <div className="space-y-2 mt-4">
          {simResult.executive_directives.map((dir, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
            >
              {dir}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
