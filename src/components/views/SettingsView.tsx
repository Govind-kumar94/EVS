import React, { useState } from 'react';
import { Sliders, Shield, Database, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [authorityName, setAuthorityName] = useState('Metropolitan Water Supply & Sewerage Board');
  const [volumetricUnit, setVolumetricUnit] = useState<'ML' | 'm3' | 'kL'>('ML');
  const [leakThreshold, setLeakThreshold] = useState<number>(20);
  const [shortageCriticalThreshold, setShortageCriticalThreshold] = useState<number>(25);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-slate-800">
          Municipal System & Telemetry Configuration
        </h1>

        <div className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Water Authority Institutional Entity
            </label>
            <input
              type="text"
              value={authorityName}
              onChange={(e) => setAuthorityName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Display Volumetric Unit
              </label>
              <select
                value={volumetricUnit}
                onChange={(e) => setVolumetricUnit(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="ML">Megaliters (ML/day) — Municipal Standard</option>
                <option value="m3">Cubic Meters (m³/day)</option>
                <option value="kL">Kiloliters (kL/day)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Abnormal Loss Warning Threshold (%)
              </label>
              <input
                type="number"
                value={leakThreshold}
                onChange={(e) => setLeakThreshold(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Critical Shortage Threshold (% of Supply)
              </label>
              <input
                type="number"
                value={shortageCriticalThreshold}
                onChange={(e) => setShortageCriticalThreshold(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[11px]">
              Schema Engine: v2.4-stable · SQLite/Postgres Ready
            </span>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded font-medium flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Settings Applied' : 'Save System Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
