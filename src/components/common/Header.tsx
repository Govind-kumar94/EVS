import React from 'react';
import { Waves, Bell, Shield, User as UserIcon, RefreshCw, Sun, Moon } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  activeAlertCount: number;
  onOpenAlerts: () => void;
  onResetDemoData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isDark,
  onToggleTheme,
  activeAlertCount,
  onOpenAlerts,
  onResetDemoData,
}) => {
  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-sky-700 text-white flex items-center justify-center shadow-xs">
          <Waves className="w-5 h-5 text-sky-100" />
        </div>
        <div>
          <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 font-sans block leading-none">
            AquaPlan AI
          </span>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block mt-1 tracking-normal">
            Metropolitan Water Supply Authority
          </span>
        </div>
      </div>

      {/* Center metadata: Operational Mode */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Network Grid 04-A</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono tabular-nums">180d Telemetry Active</span>
        <span aria-hidden="true">·</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">Predict · Optimize · Conserve</span>
      </div>

      {/* Zone 3: Actions & Role switcher */}
      <div className="flex items-center gap-3">
        {/* Role Segmented Selector */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onRoleChange('admin')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              currentRole === 'admin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => onRoleChange('operator')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              currentRole === 'operator'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Operator
          </button>
          <button
            onClick={() => onRoleChange('public')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              currentRole === 'public'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Public
          </button>
        </div>

        {/* Demo reset button */}
        <button
          onClick={onResetDemoData}
          title="Reset to official synthetic demo baseline"
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          title="System Alerts"
          className="relative p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600"></span>
          )}
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User avatar indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
            {currentRole === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
          </div>
          <div className="text-left text-xs leading-none hidden lg:block">
            <span className="font-medium text-slate-900 dark:text-slate-100 block capitalize">
              {currentRole === 'admin' ? 'MWD Chief Engineer' : currentRole === 'operator' ? 'Grid Controller' : 'Citizen Portal'}
            </span>
            <span className="text-[10px] text-slate-500 capitalize">{currentRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
