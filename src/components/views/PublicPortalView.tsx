import React, { useState } from 'react';
import { Zone, Alert } from '../../types';
import { Droplet, Info, Calendar, ShieldCheck, HeartHandshake, PhoneCall, CheckCircle } from 'lucide-react';

interface PublicPortalViewProps {
  zones: Zone[];
  alerts: Alert[];
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({ zones, alerts }) => {
  const [selectedZoneCode, setSelectedZoneCode] = useState(zones[0].code);

  const activeZone = zones.find((z) => z.code === selectedZoneCode) || zones[0];
  const publicAlerts = alerts.filter(
    (a) => a.zone_id === activeZone.id || a.alert_type === 'shortage' || a.severity === 'critical'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Civic Banner */}
      <div className="bg-sky-900 text-white rounded-lg p-6 border border-sky-800">
        <div className="flex items-center gap-2 text-sky-300 text-xs uppercase tracking-wider font-mono">
          <span>Metropolitan Water Board</span>
          <span aria-hidden="true">·</span>
          <span>Citizen Information Service</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
          Public Water Supply & Conservation Portal
        </h1>
        <p className="text-xs text-sky-100 mt-1 max-w-2xl leading-relaxed">
          Check daily pipeline pressure schedules, neighborhood reservoir reserves, water quality notices, and drought conservation recommendations for your municipal sector.
        </p>

        {/* District Selector */}
        <div className="mt-4 pt-4 border-t border-sky-800/80 flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium text-sky-200">
            Select Your Neighborhood District:
          </label>
          <select
            value={selectedZoneCode}
            onChange={(e) => setSelectedZoneCode(e.target.value)}
            className="text-xs bg-sky-950 text-white border border-sky-700 rounded px-3 py-1.5 focus:outline-hidden"
          >
            {zones.map((z) => (
              <option key={z.code} value={z.code}>
                {z.code} — {z.name.split('·')[1]?.trim() || z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* District Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              District Telemetry Status
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {activeZone.name}
            </h2>
          </div>
          <div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded ${
                activeZone.status === 'normal' || activeZone.status === 'low'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
              }`}
            >
              ● {activeZone.status === 'normal' ? 'Normal Supply Hours' : 'Modified Supply Schedule Active'}
            </span>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-sans">Primary Supply Source</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {activeZone.reservoir_source}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-sans">
              Quality Grade: A1 (Certified Potable)
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-sans">Daily Household Supply Hours</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              06:00 – 10:30 & 18:00 – 21:30
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-sans">
              Mains pressure: 2.4 bar nominal
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-sans">District Quota Balance</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {activeZone.current_supply_ml} ML allocated today
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-sans">
              Serving {activeZone.population.toLocaleString()} citizens
            </span>
          </div>
        </div>
      </div>

      {/* Public Advisories & Conservation Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advisories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600" />
            <span>Public Water Advisories</span>
          </h3>

          <div className="space-y-3 mt-4 text-xs">
            {publicAlerts.length === 0 ? (
              <div className="text-slate-500 py-4">No active restrictions in your district today.</div>
            ) : (
              publicAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {a.alert_type === 'shortage' ? 'Water Conservation Request' : 'Supply Advisory'}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {a.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conservation Tips */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Recommended Conservation Guidelines</span>
          </h3>

          <ul className="space-y-2.5 mt-4 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Aerate taps:</strong> Standard aerators save up to 40% tap volume without loss in flow velocity.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Irrigation hours:</strong> Water community gardens strictly between 20:00 and 06:00 to minimize evaporative loss.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Report visible street leaks:</strong> Notify emergency municipal telemetry teams immediately via the 24/7 hotline.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Rainwater harvesting:</strong> Residential societies qualify for 15% municipal property tax rebates with active cisterns.
              </span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>24/7 Citizen Water Helpline:</span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">1800-425-WATER</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
