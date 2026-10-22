import React, { useState } from 'react';
import { OptimizationResult } from '../../types';
import { OptimizationEngine } from '../../services/optimizationEngine';
import { DataStore } from '../../services/dataService';
import { BarComparisonChart } from '../charts/BarComparisonChart';
import { Sliders, CheckCircle2, ArrowRight, ShieldCheck, Download, Zap } from 'lucide-react';
import { CsvService } from '../../services/csvService';

interface OptimizationViewProps {
  optimizationResult: OptimizationResult;
  onApplyOptimization: (result: OptimizationResult) => void;
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({
  optimizationResult: initialResult,
  onApplyOptimization,
}) => {
  const [availableWater, setAvailableWater] = useState<number>(initialResult.total_available_water);
  const [result, setResult] = useState<OptimizationResult>(initialResult);
  const [isSolving, setIsSolving] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleRunOptimization = () => {
    setIsSolving(true);
    setIsApplied(false);
    setTimeout(() => {
      const res = OptimizationEngine.optimizeDistribution(availableWater);
      setResult(res);
      setIsSolving(false);
    }, 250);
  };

  const handleCommitToGrid = () => {
    // Update live zones with recommended allocation
    result.allocations.forEach((alloc) => {
      DataStore.updateZone(alloc.zone_id, {
        current_supply_ml: alloc.recommended_allocation,
      });
    });
    onApplyOptimization(result);
    setIsApplied(true);
  };

  const handleExportPlan = () => {
    const rows = result.allocations.map((a) => ({
      district_code: a.zone_name.split('·')[0].trim(),
      district_name: a.zone_name,
      population: a.population,
      priority_rank: a.priority_level,
      predicted_demand_ml: a.predicted_demand,
      current_allocation_ml: a.current_allocation,
      recommended_allocation_ml: a.recommended_allocation,
      delta_ml: a.delta,
      shortage_before_ml: a.shortage_before,
      shortage_after_ml: a.shortage_after,
      loss_rate_pct: a.loss_rate,
      priority_score: a.priority_score,
    }));
    CsvService.exportToCsv(`optimization_dispatch_${Math.round(availableWater)}ML.csv`, rows);
  };

  // Prepare data for comparison chart
  const barData = result.allocations.map((a) => ({
    label: a.zone_name,
    code: a.zone_name.split('·')[0].trim(),
    primaryValue: a.current_allocation,
    secondaryValue: a.recommended_allocation,
  }));

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <span>Multi-Criteria Water Distribution Optimization</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Constraint-satisfaction linear rationing algorithm minimizing aggregate shortfall, inequality penalty, and non-revenue leakage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPlan}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Allocation CSV</span>
            </button>
          </div>
        </div>

        {/* Input parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Available Reservoir Inventory (Constraint Cap)
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                {availableWater} ML
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="280"
              step="5"
              value={availableWater}
              onChange={(e) => setAvailableWater(parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>Severe Drought (100 ML)</span>
              <span>Nominal Baseline ({result.total_current_allocation} ML)</span>
              <span>Maximum Capacity (280 ML)</span>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleRunOptimization}
              disabled={isSolving}
              className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSolving ? 'Solving Constraints...' : 'Run Optimization'}</span>
            </button>
            <button
              onClick={handleCommitToGrid}
              disabled={isApplied}
              className={`py-2 px-4 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isApplied
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isApplied ? 'Committed to Grid' : 'Commit Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Comparison Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Available vs Demand
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {result.total_available_water}
            </span>
            <span className="text-xs text-slate-500">/ {result.total_predicted_demand} ML</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-sans">
            Fulfillment Rate: {Math.min(100, Math.round((result.total_available_water / result.total_predicted_demand) * 100))}%
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Deficit Reduction
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{result.deficit_reduction_pct}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
            Before: {result.total_deficit_before} ML → After: {result.total_deficit_after} ML
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Grid Delivery Efficiency
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {result.distribution_efficiency_pct}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-sans">
            Leakage-penalized weighted delivery
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Water Equity Index
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {result.equity_index}
            </span>
            <span className="text-xs text-slate-500">/ 1.0</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-sans">
            Gini per-capita fairness metric
          </span>
        </div>
      </div>

      {/* Comparison Chart Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Current Allocation vs AI Recommended Allocation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side district volume comparison demonstrating rebalancing deltas
          </p>
        </div>

        <div className="mt-4">
          <BarComparisonChart
            data={barData}
            primaryLabel="Current Allocation"
            secondaryLabel="AI Recommended Allocation"
            unit="ML"
          />
        </div>
      </div>

      {/* Optimization Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Zone-by-Zone Optimization Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted adjustments based on population weight, priority ranking, and transmission leakage
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 pr-3 font-medium">District</th>
                <th className="py-2.5 px-3 font-medium text-center">Priority</th>
                <th className="py-2.5 px-3 font-medium text-right">Predicted Demand</th>
                <th className="py-2.5 px-3 font-medium text-right">Current Supply</th>
                <th className="py-2.5 px-3 font-medium text-right">AI Recommended</th>
                <th className="py-2.5 px-3 font-medium text-right">Delta (Change)</th>
                <th className="py-2.5 px-3 font-medium text-right">Deficit Before</th>
                <th className="py-2.5 px-3 font-medium text-right">Deficit After</th>
                <th className="py-2.5 px-3 font-medium text-right">Loss Rate</th>
                <th className="py-2.5 pl-3 font-medium text-right">Priority Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {result.allocations.map((a) => (
                <tr key={a.zone_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 pr-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                    {a.zone_name.split('·')[0].trim()}
                    <span className="text-slate-500 text-[11px] block font-normal">
                      {a.zone_name.split('·')[1]?.trim() || a.zone_name}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans text-slate-600 dark:text-slate-400">
                    Rank {a.priority_level}/5
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {a.predicted_demand} ML
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                    {a.current_allocation} ML
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-600 dark:text-sky-400 font-bold">
                    {a.recommended_allocation} ML
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-semibold ${
                      a.delta > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : a.delta < 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {a.delta > 0 ? `+${a.delta}` : a.delta} ML
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {a.shortage_before > 0 ? `-${a.shortage_before} ML` : '0.0 ML'}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-semibold ${
                      a.shortage_after > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {a.shortage_after > 0 ? `-${a.shortage_after} ML` : '0.0 ML'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                    {a.loss_rate}%
                  </td>
                  <td className="py-2.5 pl-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {a.priority_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendation Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-slate-800">
          Executive Decision Recommendations Generated by Solver
        </h3>
        <div className="space-y-2 mt-4">
          {result.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed flex items-start gap-2.5"
            >
              <span className="font-mono text-sky-600 font-bold shrink-0">
                [0{i + 1}]
              </span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
