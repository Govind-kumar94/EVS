import React, { useState } from 'react';
import { Zone, Alert } from '../../types';
import { DataStore } from '../../services/dataService';
import { Droplet, AlertTriangle, ShieldCheck, CheckCircle2, Wrench, Search } from 'lucide-react';

interface WaterLossViewProps {
  zones: Zone[];
  onTriggerAlert?: (alert: Alert) => void;
}

export const WaterLossView: React.FC<WaterLossViewProps> = ({ zones, onTriggerAlert }) => {
  const [dispatchedZoneId, setDispatchedZoneId] = useState<string | null>(null);

  const getLossClassification = (lossPct: number) => {
    if (lossPct <= 10) return { label: 'NORMAL', color: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 text-emerald-700' };
    if (lossPct <= 20) return { label: 'MONITOR', color: 'text-sky-600 dark:text-sky-400', badge: 'bg-sky-50 text-sky-700' };
    if (lossPct <= 30) return { label: 'WARNING', color: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-50 text-amber-700' };
    return { label: 'CRITICAL', color: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-50 text-rose-700' };
  };

  const handleDispatchInspection = (zone: Zone, estimatedLossML: number) => {
    setDispatchedZoneId(zone.id);
    const newAlert: Alert = {
      id: `leak-audit-${Date.now()}`,
      zone_id: zone.id,
      zone_name: zone.name,
      alert_type: 'abnormal_loss',
      severity: zone.water_loss_rate > 30 ? 'critical' : 'high',
      message: `Acoustic pipe telemetry crew dispatched to ${zone.name}. Investigating ${estimatedLossML} ML/d loss (${zone.water_loss_rate}% rate).`,
      status: 'active',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      metric_value: zone.water_loss_rate,
      unit: '%',
      threshold: 'Loss > 20%',
      recommended_action: 'Perform step-testing on District Metered Area (DMA) valves.',
    };
    DataStore.addAlert(newAlert);
    if (onTriggerAlert) onTriggerAlert(newAlert);
  };

  // Aggregates
  const totalSupplied = Math.round(zones.reduce((sum, z) => sum + z.current_supply_ml, 0) * 10) / 10;
  const totalLossML = Math.round(
    zones.reduce((sum, z) => sum + (z.current_supply_ml * (z.water_loss_rate / 100)), 0) * 10
  ) / 10;
  const netConsumed = Math.round((totalSupplied - totalLossML) * 10) / 10;
  const networkLossPct = Math.round((totalLossML / totalSupplied) * 1000) / 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-amber-600" />
              <span>Abnormal Water Loss & Non-Revenue Water (NRW) Audit</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Differential mass-balance analysis comparing bulk station intake meters against municipal consumer delivery meters
            </p>
          </div>
        </div>

        {/* Technical Notice Banner */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded text-xs text-slate-600 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-slate-100">Engineering Note: </strong>
          Calculations reflect statistical transmission disparities (bulk inlet minus metered consumption). Flags represent <em>Abnormal Water Loss</em> candidate sectors requiring acoustic step-testing and valve calibration, rather than single localized pipe fractures.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Bulk Water Supplied
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalSupplied}
            </span>
            <span className="text-xs text-slate-500">ML/d</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Intake pump stations</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Consumer Metered
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {netConsumed}
            </span>
            <span className="text-xs text-slate-500">ML/d</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Billed & authorized draw</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Transmission Loss Volume
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {totalLossML}
            </span>
            <span className="text-xs text-slate-500">ML/d</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Non-revenue water</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
            Mean Network Loss Rate
          </span>
          <div className="mt-1 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {networkLossPct}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Target benchmark: &lt;12.0%</span>
        </div>
      </div>

      {/* District Water Loss Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            District Metered Area (DMA) Water Loss Ledger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: Loss = Supplied - Consumed · Loss % = ((Supplied - Consumed) / Supplied) × 100
          </p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 pr-4 font-medium">District</th>
                <th className="py-2.5 px-4 font-medium text-right">Supplied Water</th>
                <th className="py-2.5 px-4 font-medium text-right">Metered Consumption</th>
                <th className="py-2.5 px-4 font-medium text-right">Estimated Water Loss</th>
                <th className="py-2.5 px-4 font-medium text-right">Loss Rate (%)</th>
                <th className="py-2.5 px-4 font-medium text-center">Loss Severity</th>
                <th className="py-2.5 pl-4 font-medium text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {zones.map((zone) => {
                const supplied = zone.current_supply_ml;
                const lossRate = zone.water_loss_rate;
                const estimatedLoss = Math.round(supplied * (lossRate / 100) * 10) / 10;
                const consumed = Math.round((supplied - estimatedLoss) * 10) / 10;
                const classification = getLossClassification(lossRate);
                const isDispatched = dispatchedZoneId === zone.id;

                return (
                  <tr key={zone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-sans font-medium text-slate-900 dark:text-slate-100">
                      {zone.code} · {zone.name.split('·')[1]?.trim() || zone.name}
                      <span className="text-[11px] text-slate-500 block font-normal font-mono">
                        Pipeline: {zone.pipeline_connections.join(', ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                      {supplied} ML
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                      {consumed} ML
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        lossRate >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {estimatedLoss} ML
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${classification.color}`}>
                      {lossRate}%
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`text-[11px] font-semibold ${classification.color}`}>
                        {classification.label}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right font-sans">
                      {lossRate >= 20 ? (
                        <button
                          onClick={() => handleDispatchInspection(zone, estimatedLoss)}
                          disabled={isDispatched}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                            isDispatched
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                          }`}
                        >
                          {isDispatched ? 'Audit Dispatched' : 'Dispatch Leak Audit'}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Nominal</span>
                      )}
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
