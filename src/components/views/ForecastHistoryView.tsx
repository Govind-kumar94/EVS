import React from 'react';
import { Zone } from '../../types';
import { History, Download } from 'lucide-react';
import { CsvService } from '../../services/csvService';

interface ForecastHistoryViewProps {
  zones: Zone[];
}

export const ForecastHistoryView: React.FC<ForecastHistoryViewProps> = ({ zones }) => {
  const simulatedHistoryRuns = [
    { id: 'FCR-1049', date: '2026-10-05 06:00', zone: 'Zone B · Industrial', horizon: '7 Days', model: 'XGBoost', predicted_mean: '39.8 ML', actual_sample: '38.4 ML', variance: '+3.6%', error_mae: '0.94 ML', status: 'Active Evaluation' },
    { id: 'FCR-1048', date: '2026-10-04 06:00', zone: 'Zone A · Commercial', horizon: '1 Day', model: 'XGBoost', predicted_mean: '45.2 ML', actual_sample: '44.8 ML', variance: '+0.8%', error_mae: '0.88 ML', status: 'Verified' },
    { id: 'FCR-1047', date: '2026-10-03 06:00', zone: 'Zone C · Residential', horizon: '7 Days', model: 'Random Forest', predicted_mean: '51.0 ML', actual_sample: '50.2 ML', variance: '+1.5%', error_mae: '1.21 ML', status: 'Verified' },
    { id: 'FCR-1046', date: '2026-10-02 06:00', zone: 'Zone D · West Ridge', horizon: '30 Days', model: 'LSTM', predicted_mean: '17.8 ML', actual_sample: '18.1 ML', variance: '-1.6%', error_mae: '1.08 ML', status: 'Verified' },
    { id: 'FCR-1045', date: '2026-10-01 06:00', zone: 'Zone F · Tech Hub', horizon: '7 Days', model: 'Linear Regression', predicted_mean: '28.1 ML', actual_sample: '27.4 ML', variance: '+2.5%', error_mae: '1.82 ML', status: 'Archived' },
  ];

  const handleExport = () => {
    CsvService.exportToCsv('forecast_evaluation_history.csv', simulatedHistoryRuns);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-600" />
              <span>Forecast Model Audit & Accuracy Ledger</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical record of forward projections benchmarked against realized end-of-day meter logs
            </p>
          </div>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log</span>
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 pr-3 font-medium">Batch ID</th>
                <th className="py-2.5 px-3 font-medium">Timestamp</th>
                <th className="py-2.5 px-3 font-medium">District</th>
                <th className="py-2.5 px-3 font-medium">Horizon</th>
                <th className="py-2.5 px-3 font-medium">Algorithm</th>
                <th className="py-2.5 px-3 font-medium text-right">Predicted</th>
                <th className="py-2.5 px-3 font-medium text-right">Actual Intake</th>
                <th className="py-2.5 px-3 font-medium text-right">Variance</th>
                <th className="py-2.5 px-3 font-medium text-right">MAE</th>
                <th className="py-2.5 pl-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {simulatedHistoryRuns.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-3 text-sky-600 dark:text-sky-400 font-bold">{run.id}</td>
                  <td className="py-3 px-3 text-slate-500">{run.date}</td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">{run.zone}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{run.horizon}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{run.model}</td>
                  <td className="py-3 px-3 text-right text-slate-900 dark:text-slate-100 font-semibold">{run.predicted_mean}</td>
                  <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">{run.actual_sample}</td>
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">{run.variance}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{run.error_mae}</td>
                  <td className="py-3 pl-3 text-right font-sans">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">{run.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
