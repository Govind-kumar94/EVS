import React from 'react';
import { Zone, Alert, OptimizationResult } from '../../types';
import { KpiCards } from '../dashboard/KpiCards';
import { WaterNetworkMap } from '../map/WaterNetworkMap';
import {
  TrendingUp,
  Sliders,
  FlaskConical,
  UploadCloud,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { NavView } from '../common/Sidebar';

interface DashboardViewProps {
  zones: Zone[];
  alerts: Alert[];
  latestOptimization: OptimizationResult;
  onNavigate: (view: NavView) => void;
  onSelectZone: (zone: Zone) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  zones,
  alerts,
  latestOptimization,
  onNavigate,
  onSelectZone,
}) => {
  // Aggregate calculations
  const totalSupply = Math.round(zones.reduce((sum, z) => sum + z.current_supply_ml, 0) * 10) / 10;
  const predictedDemand = Math.round(zones.reduce((sum, z) => sum + z.predicted_demand_ml, 0) * 10) / 10;
  const deficit = Math.round((predictedDemand - totalSupply) * 10) / 10;
  const avgWaterLoss = Math.round((zones.reduce((sum, z) => sum + z.water_loss_rate, 0) / zones.length) * 10) / 10;
  const highRiskCount = zones.filter((z) => z.status === 'high' || z.status === 'critical').length;

  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-slate-100 rounded-lg p-5 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
            <span>Metropolitan Water Dispatch</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Operational Telemetry</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
            Municipal Water Network Overview
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Centralized decision intelligence for predictive demand scheduling, automated shortage mitigation, and non-revenue water containment across 8 municipal districts.
          </p>
        </div>

        {/* Quick action buttons (Prompt section 23) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('demand-forecast')}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Run Forecast</span>
          </button>
          <button
            onClick={() => onNavigate('optimization')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimize</span>
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulation</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <KpiCards
        totalSupply={totalSupply}
        predictedDemand={predictedDemand}
        deficit={deficit}
        efficiency={latestOptimization.distribution_efficiency_pct}
        waterLossPct={avgWaterLoss}
        highRiskZonesCount={highRiskCount}
      />

      {/* Critical Alert Notice if any */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                Urgent Operations Notice · {activeAlerts[0].zone_name}
              </h4>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-medium text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>View all {activeAlerts.length} alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-1">
              {activeAlerts[0].message}
            </p>
            {activeAlerts[0].recommended_action && (
              <div className="mt-1.5 text-[11px] text-rose-700 dark:text-rose-400 font-mono">
                Action: {activeAlerts[0].recommended_action}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Network Map Section */}
      <WaterNetworkMap
        zones={zones}
        onSelectZone={(z) => {
          onSelectZone(z);
          onNavigate('all-zones');
        }}
      />

      {/* Two-Column: Zone Operational Status & AI Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Status Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                District Operational Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time flow against 24-hour projected baseline
              </p>
            </div>
            <button
              onClick={() => onNavigate('all-zones')}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Detailed Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                  <th className="py-2.5 pr-3 font-medium">District</th>
                  <th className="py-2.5 px-3 font-medium text-right">Population</th>
                  <th className="py-2.5 px-3 font-medium text-right">Supply</th>
                  <th className="py-2.5 px-3 font-medium text-right">Forecast</th>
                  <th className="py-2.5 px-3 font-medium text-right">Shortage</th>
                  <th className="py-2.5 px-3 font-medium text-right">Loss Rate</th>
                  <th className="py-2.5 pl-3 font-medium text-right">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
                {zones.map((zone) => {
                  const shortage = Math.round(Math.max(0, zone.predicted_demand_ml - zone.current_supply_ml) * 10) / 10;
                  const isLossWarning = zone.water_loss_rate >= 20;

                  return (
                    <tr
                      key={zone.id}
                      onClick={() => {
                        onSelectZone(zone);
                        onNavigate('all-zones');
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                        <span>{zone.code}</span>
                        <span className="text-slate-500 text-[11px] block font-normal">
                          {zone.name.split('·')[1]?.trim() || zone.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                        {zone.population.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900 dark:text-slate-200">
                        {zone.current_supply_ml} ML
                      </td>
                      <td className="py-2.5 px-3 text-right text-sky-600 dark:text-sky-400">
                        {zone.predicted_demand_ml} ML
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right ${
                          shortage > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {shortage > 0 ? `-${shortage} ML` : '0.0 ML'}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right ${
                          isLossWarning ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {zone.water_loss_rate}%
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <span
                          className={`inline-block font-sans capitalize text-[11px] font-medium ${
                            zone.status === 'critical'
                              ? 'text-rose-600 dark:text-rose-400'
                              : zone.status === 'high'
                              ? 'text-orange-600 dark:text-orange-400'
                              : zone.status === 'medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {zone.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations & Optimization Engine Directives (Prompt Section 13) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>AI Dispatch Recommendations</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Calculated Engine</span>
            </div>

            <div className="space-y-3 mt-4">
              {latestOptimization.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Directive 0{i + 1}
                  </div>
                  {rec}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Distribution Equity Index</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {latestOptimization.equity_index} / 1.0
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-500">Deficit Reduction via AI</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                +{latestOptimization.deficit_reduction_pct}%
              </span>
            </div>
            <button
              onClick={() => onNavigate('optimization')}
              className="w-full mt-3 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors text-center"
            >
              Open Optimization Workbench
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
