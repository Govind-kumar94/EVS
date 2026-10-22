import React, { useState } from 'react';
import { Zone, OptimizationResult, Alert } from '../../types';
import { FileText, Printer, Download, Waves, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CsvService } from '../../services/csvService';

interface ReportsViewProps {
  zones: Zone[];
  optimization: OptimizationResult;
  alerts: Alert[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  zones,
  optimization,
  alerts,
}) => {
  const [reportDate, setReportDate] = useState('2026-10-05');
  const [reportTitle, setReportTitle] = useState('Executive Water Supply & Optimization Briefing');

  const totalSupply = Math.round(zones.reduce((sum, z) => sum + z.current_supply_ml, 0) * 10) / 10;
  const totalDemand = Math.round(zones.reduce((sum, z) => sum + z.predicted_demand_ml, 0) * 10) / 10;
  const totalLoss = Math.round(
    zones.reduce((sum, z) => sum + (z.current_supply_ml * (z.water_loss_rate / 100)), 0) * 10
  ) / 10;
  const netDeficit = Math.round(Math.max(0, totalDemand - totalSupply) * 10) / 10;
  const highRiskZones = zones.filter((z) => z.status === 'high' || z.status === 'critical');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const rows = zones.map((z) => {
      const opt = optimization.allocations.find((a) => a.zone_id === z.id);
      return {
        district_code: z.code,
        district_name: z.name,
        population: z.population,
        priority_rank: z.priority_level,
        current_supply_ml: z.current_supply_ml,
        predicted_demand_ml: z.predicted_demand_ml,
        shortage_ml: Math.round(Math.max(0, z.predicted_demand_ml - z.current_supply_ml) * 10) / 10,
        loss_rate_pct: z.water_loss_rate,
        recommended_allocation_ml: opt?.recommended_allocation || z.current_supply_ml,
        delta_ml: opt?.delta || 0,
      };
    });
    CsvService.exportToCsv(`municipal_report_${reportDate}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Action Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span>Official Water Authority Report Generator</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Printable municipal intelligence document with distribution matrices and risk analyses
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Document (A4 Styling) */}
      <div className="bg-white text-slate-900 border border-slate-300 shadow-sm rounded-lg p-8 max-w-4xl mx-auto printable-report print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono tracking-widest uppercase text-slate-500 block">
                Metropolitan Water Supply Authority
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                AquaPlan AI · Resource Intelligence Briefing
              </h2>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-600">
            <div>Doc Ref: MWD-REP-2026-10</div>
            <div>Date: {reportDate}</div>
            <div>Classification: Official Use</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
              1. Executive Operational Overview
            </h3>
            <p>
              This report presents the daily demand forecast, bulk supply allocations, and transmission loss audits for the Metropolitan Water District covering <strong>1,273,000 residents</strong> across 8 distinct administrative zones.
            </p>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-4 gap-3 py-3 border-y border-slate-200 bg-slate-50 p-3 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Total Bulk Supply</span>
              <span className="text-sm font-bold text-slate-900">{totalSupply} ML/d</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Predicted Demand</span>
              <span className="text-sm font-bold text-slate-900">{totalDemand} ML/d</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Total Shortage Deficit</span>
              <span className="text-sm font-bold text-rose-600">
                {netDeficit > 0 ? `-${netDeficit} ML/d` : '0.0 ML/d'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Network Water Loss</span>
              <span className="text-sm font-bold text-amber-600">{totalLoss} ML/d</span>
            </div>
          </div>

          {/* District Matrix Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-4">
              2. District Volumetric Matrix & Optimization Directives
            </h3>
            <table className="w-full text-[11px] text-left border border-slate-200 mt-2">
              <thead className="bg-slate-100 font-mono text-[10px]">
                <tr className="border-b border-slate-200">
                  <th className="p-2">District</th>
                  <th className="p-2 text-right">Population</th>
                  <th className="p-2 text-right">Current Supply</th>
                  <th className="p-2 text-right">Forecast Demand</th>
                  <th className="p-2 text-right">Shortage</th>
                  <th className="p-2 text-right">Loss %</th>
                  <th className="p-2 text-right">AI Recommended</th>
                  <th className="p-2 text-right">Net Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {zones.map((z) => {
                  const opt = optimization.allocations.find((a) => a.zone_id === z.id);
                  const shortage = Math.round(Math.max(0, z.predicted_demand_ml - z.current_supply_ml) * 10) / 10;
                  const rec = opt?.recommended_allocation || z.current_supply_ml;
                  const delta = opt?.delta || 0;

                  return (
                    <tr key={z.id}>
                      <td className="p-2 font-sans font-medium text-slate-900">
                        {z.code} · {z.name.split('·')[1]?.trim() || z.name}
                      </td>
                      <td className="p-2 text-right">{z.population.toLocaleString()}</td>
                      <td className="p-2 text-right">{z.current_supply_ml} ML</td>
                      <td className="p-2 text-right font-semibold">{z.predicted_demand_ml} ML</td>
                      <td className="p-2 text-right text-rose-600">
                        {shortage > 0 ? `-${shortage} ML` : '0.0 ML'}
                      </td>
                      <td className="p-2 text-right">{z.water_loss_rate}%</td>
                      <td className="p-2 text-right font-bold text-slate-900">{rec} ML</td>
                      <td className="p-2 text-right">
                        {delta > 0 ? `+${delta}` : delta} ML
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AI Recommended Directives */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 mt-4">
              3. Operational Action Directives
            </h3>
            <div className="space-y-2">
              {optimization.recommendations.map((rec, i) => (
                <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px]">
                  <strong>Directive 0{i + 1}: </strong>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signoff */}
          <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px] font-mono text-slate-600">
            <div>
              <div>Compiled by: AI Dispatch Engine (AquaPlan AI)</div>
              <div>System Status: All 8 District Nodes Active</div>
            </div>
            <div className="text-right">
              <div>Approved by: _____________________________</div>
              <div>Chief Water Operations Engineer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
