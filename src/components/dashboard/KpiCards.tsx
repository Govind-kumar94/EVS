import React from 'react';
import { Droplet, TrendingUp, AlertTriangle, CheckCircle, ShieldAlert, Activity } from 'lucide-react';

interface KpiCardsProps {
  totalSupply: number;
  predictedDemand: number;
  deficit: number;
  efficiency: number;
  waterLossPct: number;
  highRiskZonesCount: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalSupply,
  predictedDemand,
  deficit,
  efficiency,
  waterLossPct,
  highRiskZonesCount,
}) => {
  const isDeficit = deficit > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Supply */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Total Supply
          </span>
          <Droplet className="w-3.5 h-3.5 text-sky-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalSupply}
          </span>
          <span className="text-xs text-slate-500 font-mono">ML/d</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
          <span>8 Active Districts</span>
        </div>
      </div>

      {/* 2. Predicted Demand */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Predicted Demand
          </span>
          <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {predictedDemand}
          </span>
          <span className="text-xs text-slate-500 font-mono">ML/d</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          <span>AI Forecast Horizon</span>
        </div>
      </div>

      {/* 3. Deficit / Surplus */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            {isDeficit ? 'Water Deficit' : 'Water Surplus'}
          </span>
          {isDeficit ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={`text-xl font-bold font-mono tabular-nums ${
              isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isDeficit ? `-${deficit}` : `+${Math.abs(deficit)}`}
          </span>
          <span className="text-xs text-slate-500 font-mono">ML/d</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          <span>{isDeficit ? 'Rationing required' : 'Nominal buffer'}</span>
        </div>
      </div>

      {/* 4. Distribution Efficiency */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Grid Efficiency
          </span>
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {efficiency}%
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          <span>Weighted delivery</span>
        </div>
      </div>

      {/* 5. Total Water Loss */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            Mean Loss (NRW)
          </span>
          <Droplet className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={`text-xl font-bold font-mono tabular-nums ${
              waterLossPct > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {waterLossPct}%
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          <span>Non-revenue loss</span>
        </div>
      </div>

      {/* 6. High-Risk Zones */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium uppercase tracking-wider">
            High-Risk Zones
          </span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={`text-xl font-bold font-mono tabular-nums ${
              highRiskZonesCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {highRiskZonesCount}
          </span>
          <span className="text-xs text-slate-500">/ 8</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          <span>Deficit / leak flags</span>
        </div>
      </div>
    </div>
  );
};
