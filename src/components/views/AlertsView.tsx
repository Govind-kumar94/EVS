import React, { useState } from 'react';
import { Alert, AlertSeverity, AlertType } from '../../types';
import { DataStore } from '../../services/dataService';
import { Bell, Filter, CheckCircle2, ShieldAlert, AlertTriangle, Info, Clock, Check } from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  onRefreshAlerts: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onRefreshAlerts }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const handleUpdateStatus = (alertId: string, status: 'active' | 'acknowledged' | 'resolved') => {
    DataStore.updateAlertStatus(alertId, status);
    onRefreshAlerts();
  };

  const filtered = alerts.filter((a) => {
    const matchSev = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchStat = filterStatus === 'all' || a.status === filterStatus;
    const matchType = filterType === 'all' || a.alert_type === filterType;
    return matchSev && matchStat && matchType;
  });

  const getSeverityStyle = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return {
          border: 'border-l-4 border-l-rose-600',
          badge: 'text-rose-600 dark:text-rose-400 font-bold',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />,
        };
      case 'high':
        return {
          border: 'border-l-4 border-l-orange-500',
          badge: 'text-orange-600 dark:text-orange-400 font-bold',
          icon: <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />,
        };
      case 'medium':
        return {
          border: 'border-l-4 border-l-amber-500',
          badge: 'text-amber-600 dark:text-amber-400 font-semibold',
          icon: <Clock className="w-4 h-4 text-amber-500 shrink-0" />,
        };
      case 'normal':
      default:
        return {
          border: 'border-l-4 border-l-emerald-600',
          badge: 'text-emerald-600 dark:text-emerald-400 font-medium',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-600" />
              <span>Municipal Telemetry Alert Center</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated system notifications identifying imminent deficits, abnormal mass losses, and pressure anomalies
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="normal">Normal / Info</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="all">All Alert Types</option>
              <option value="shortage">Shortage</option>
              <option value="abnormal_loss">Abnormal Loss</option>
              <option value="high_demand">High Demand</option>
              <option value="supply_reduction">Supply Reduction</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3 mt-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No telemetry alerts match the selected criteria.
            </div>
          ) : (
            filtered.map((alert) => {
              const style = getSeverityStyle(alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`p-4 bg-white dark:bg-slate-850 rounded border border-slate-200 dark:border-slate-800 shadow-xs ${style.border} transition-colors`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{style.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`uppercase tracking-wide text-[11px] ${style.badge}`}>
                            {alert.severity}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {alert.zone_name}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {alert.created_at}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                          {alert.message}
                        </p>

                        {alert.recommended_action && (
                          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-200 dark:border-slate-700/60 font-mono">
                            <strong className="text-slate-800 dark:text-slate-200 font-sans">
                              Required Action:{' '}
                            </strong>
                            {alert.recommended_action}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0 font-sans">
                      <span className="text-[11px] font-mono text-slate-400 capitalize">
                        {alert.status}
                      </span>
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                          className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                          className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
