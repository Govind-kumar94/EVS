import React, { useState } from 'react';
import { Zone, RiskLevel } from '../../types';
import { DataStore } from '../../services/dataService';
import { Layers, ArrowUpDown, Search, Edit3, Check, X, ShieldAlert } from 'lucide-react';

interface ZonesViewProps {
  zones: Zone[];
  onUpdateZones: () => void;
  onSelectZoneForForecast?: (zone: Zone) => void;
}

export const ZonesView: React.FC<ZonesViewProps> = ({
  zones,
  onUpdateZones,
  onSelectZoneForForecast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'population' | 'supply' | 'demand' | 'shortage' | 'loss'>('shortage');
  const [sortAsc, setSortAsc] = useState(false);

  // Edit state
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editSupplyVal, setEditSupplyVal] = useState<number>(0);

  const handleStartEdit = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setEditSupplyVal(zone.current_supply_ml);
  };

  const handleSaveEdit = (zoneId: string) => {
    DataStore.updateZone(zoneId, { current_supply_ml: editSupplyVal });
    setEditingZoneId(null);
    onUpdateZones();
  };

  const filtered = zones.filter((z) => {
    const matchSearch =
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = filterRisk === 'all' || z.status === filterRisk;
    return matchSearch && matchRisk;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (sortField === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortField === 'population') { valA = a.population; valB = b.population; }
    if (sortField === 'supply') { valA = a.current_supply_ml; valB = b.current_supply_ml; }
    if (sortField === 'demand') { valA = a.predicted_demand_ml; valB = b.predicted_demand_ml; }
    if (sortField === 'loss') { valA = a.water_loss_rate; valB = b.water_loss_rate; }
    if (sortField === 'shortage') {
      valA = Math.max(0, a.predicted_demand_ml - a.current_supply_ml);
      valB = Math.max(0, b.predicted_demand_ml - b.current_supply_ml);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <span>Municipal District & Zone Inventory</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive telemetry for water allocations, population quotas, and shortage risk classifications
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search district or code..."
                className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500 w-52"
              />
            </div>

            {/* Risk Filter */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="all">All Risk Levels</option>
              <option value="normal">Normal</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-[11px]">
                <th
                  onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}
                  className="py-2.5 pr-3 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>District Code & Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th
                  onClick={() => { setSortField('population'); setSortAsc(!sortAsc); }}
                  className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Population
                </th>
                <th
                  onClick={() => { setSortField('supply'); setSortAsc(!sortAsc); }}
                  className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Allocated Supply
                </th>
                <th
                  onClick={() => { setSortField('demand'); setSortAsc(!sortAsc); }}
                  className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Predicted Demand
                </th>
                <th
                  onClick={() => { setSortField('shortage'); setSortAsc(!sortAsc); }}
                  className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Deficit / Shortage
                </th>
                <th
                  onClick={() => { setSortField('loss'); setSortAsc(!sortAsc); }}
                  className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Loss Rate
                </th>
                <th className="py-2.5 px-3 font-medium text-center">Priority</th>
                <th className="py-2.5 px-3 font-medium text-right">Risk Score</th>
                <th className="py-2.5 pl-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono tabular-nums">
              {sorted.map((zone) => {
                const shortage = Math.round(Math.max(0, zone.predicted_demand_ml - zone.current_supply_ml) * 10) / 10;
                const isEditing = editingZoneId === zone.id;

                return (
                  <tr key={zone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-3 font-sans">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {zone.code} · {zone.name.split('·')[1]?.trim() || zone.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Source: {zone.reservoir_source.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans capitalize text-slate-600 dark:text-slate-400">
                      {zone.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                      {zone.population.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={editSupplyVal}
                            onChange={(e) => setEditSupplyVal(parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-800 border border-sky-500 rounded text-xs"
                          />
                          <button
                            onClick={() => handleSaveEdit(zone.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingZoneId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">
                          {zone.current_supply_ml} ML
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-sky-600 dark:text-sky-400 font-semibold">
                      {zone.predicted_demand_ml} ML
                    </td>
                    <td
                      className={`py-3 px-3 text-right ${
                        shortage > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {shortage > 0 ? `-${shortage} ML` : '0.0 ML'}
                    </td>
                    <td
                      className={`py-3 px-3 text-right ${
                        zone.water_loss_rate >= 20 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {zone.water_loss_rate}%
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="text-slate-700 dark:text-slate-300">
                        Rank {zone.priority_level}/5
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-sans capitalize text-[11px] font-medium ${
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
                    <td className="py-3 pl-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(zone)}
                            title="Adjust supply quota"
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onSelectZoneForForecast && (
                          <button
                            onClick={() => onSelectZoneForForecast(zone)}
                            className="text-[11px] text-sky-600 hover:underline"
                          >
                            Forecast
                          </button>
                        )}
                      </div>
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
