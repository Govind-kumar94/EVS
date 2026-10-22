import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  GitCompare,
  History,
  Layers,
  MapPin,
  Sliders,
  Droplet,
  FlaskConical,
  Bell,
  BarChart3,
  FileText,
  Database,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavView =
  | 'dashboard'
  | 'demand-forecast'
  | 'model-comparison'
  | 'forecast-history'
  | 'all-zones'
  | 'zone-analysis'
  | 'water-map'
  | 'optimization'
  | 'water-loss'
  | 'simulator'
  | 'alerts'
  | 'analytics'
  | 'reports'
  | 'data-management'
  | 'settings'
  | 'public-portal';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  currentRole: UserRole;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentRole,
  alertCount,
}) => {
  const [forecastingExpanded, setForecastingExpanded] = React.useState(true);
  const [zonesExpanded, setZonesExpanded] = React.useState(true);

  if (currentRole === 'public') {
    return (
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0">
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Public Water Service
          </div>
          <button
            onClick={() => onSelectView('public-portal')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-left transition-colors ${
              currentView === 'public-portal'
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Public Water Portal</span>
          </button>
          <button
            onClick={() => onSelectView('water-map')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-left transition-colors ${
              currentView === 'water-map'
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>District Water Map</span>
          </button>
          <button
            onClick={() => onSelectView('alerts')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-left transition-colors ${
              currentView === 'alerts'
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-500" />
              <span>Public Advisories</span>
            </div>
            {alertCount > 0 && (
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
                {alertCount}
              </span>
            )}
          </button>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <p className="font-medium text-slate-700 dark:text-slate-300">Citizen Helpline</p>
          <p className="mt-1 font-mono text-[11px]">Toll-Free: 1800-425-WATER</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div className="p-3 space-y-1">
        {/* Dashboard Link */}
        <button
          onClick={() => onSelectView('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
            currentView === 'dashboard'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-sky-600" />
          <span>Dashboard</span>
        </button>

        {/* Forecasting Group */}
        <div className="pt-2">
          <button
            onClick={() => setForecastingExpanded(!forecastingExpanded)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300"
          >
            <span>Forecasting</span>
            {forecastingExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {forecastingExpanded && (
            <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-0.5">
              <button
                onClick={() => onSelectView('demand-forecast')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded text-left transition-colors ${
                  currentView === 'demand-forecast'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Demand Forecast</span>
              </button>
              <button
                onClick={() => onSelectView('model-comparison')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded text-left transition-colors ${
                  currentView === 'model-comparison'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5 text-slate-500" />
                <span>Model Comparison</span>
              </button>
              <button
                onClick={() => onSelectView('forecast-history')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded text-left transition-colors ${
                  currentView === 'forecast-history'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Forecast History</span>
              </button>
            </div>
          )}
        </div>

        {/* Zones Group */}
        <div className="pt-2">
          <button
            onClick={() => setZonesExpanded(!zonesExpanded)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300"
          >
            <span>Districts & Network</span>
            {zonesExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {zonesExpanded && (
            <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 mt-0.5">
              <button
                onClick={() => onSelectView('all-zones')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded text-left transition-colors ${
                  currentView === 'all-zones'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>All Zones</span>
              </button>
              <button
                onClick={() => onSelectView('zone-analysis')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded text-left transition-colors ${
                  currentView === 'zone-analysis'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Zone Analysis</span>
              </button>
              <button
                onClick={() => onSelectView('water-map')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded text-left transition-colors ${
                  currentView === 'water-map'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Water Map</span>
              </button>
            </div>
          )}
        </div>

        {/* Operational Intelligence Sections */}
        <div className="pt-2 space-y-0.5">
          <button
            onClick={() => onSelectView('optimization')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
              currentView === 'optimization'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Optimization</span>
          </button>

          <button
            onClick={() => onSelectView('water-loss')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
              currentView === 'water-loss'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Droplet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Water Loss</span>
          </button>

          <button
            onClick={() => onSelectView('simulator')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
              currentView === 'simulator'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>What-If Simulator</span>
          </button>

          <button
            onClick={() => onSelectView('alerts')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
              currentView === 'alerts'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Alert Center</span>
            </div>
            {alertCount > 0 && (
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                {alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectView('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
              currentView === 'analytics'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onSelectView('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
              currentView === 'reports'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Reports</span>
          </button>

          {currentRole === 'admin' && (
            <button
              onClick={() => onSelectView('data-management')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left transition-colors ${
                currentView === 'data-management'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4 text-slate-500" />
              <span>Data Management</span>
            </button>
          )}
        </div>
      </div>

      {/* Authority footer notice */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Municipal Water Control</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-600">
          ISO 24510 · Certified Utility Engine
        </p>
      </div>
    </aside>
  );
};
