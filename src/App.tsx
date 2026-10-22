import React, { useState, useEffect } from 'react';
import { UserRole, Zone, Alert, OptimizationResult } from './types';
import { DataStore } from './services/dataService';
import { OptimizationEngine } from './services/optimizationEngine';
import { Header } from './components/common/Header';
import { Sidebar, NavView } from './components/common/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { ForecastingView } from './components/views/ForecastingView';
import { ModelComparisonView } from './components/views/ModelComparisonView';
import { ForecastHistoryView } from './components/views/ForecastHistoryView';
import { ZonesView } from './components/views/ZonesView';
import { WaterNetworkMap } from './components/map/WaterNetworkMap';
import { OptimizationView } from './components/views/OptimizationView';
import { WaterLossView } from './components/views/WaterLossView';
import { SimulatorView } from './components/views/SimulatorView';
import { AlertsView } from './components/views/AlertsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { DataManagementView } from './components/views/DataManagementView';
import { SettingsView } from './components/views/SettingsView';
import { PublicPortalView } from './components/views/PublicPortalView';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [zones, setZones] = useState<Zone[]>(() => DataStore.getZones());
  const [alerts, setAlerts] = useState<Alert[]>(() => DataStore.getAlerts());
  const [selectedZone, setSelectedZone] = useState<Zone>(() => zones[1] || zones[0]); // Default Zone B
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult>(() =>
    OptimizationEngine.optimizeDistribution()
  );

  // Sync dark class on root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // When role changes to public, auto-route to public-portal
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'public') {
      setCurrentView('public-portal');
    } else if (currentView === 'public-portal') {
      setCurrentView('dashboard');
    }
  };

  const refreshData = () => {
    const updatedZones = [...DataStore.getZones()];
    const updatedAlerts = [...DataStore.getAlerts()];
    setZones(updatedZones);
    setAlerts(updatedAlerts);
    setOptimizationResult(OptimizationEngine.optimizeDistribution());
  };

  const handleResetDemoData = () => {
    DataStore.resetToDemoDefaults();
    refreshData();
    alert('System baseline reset to authentic 180-day municipal demo telemetry.');
  };

  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        activeAlertCount={activeAlertCount}
        onOpenAlerts={() => setCurrentView('alerts')}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          currentRole={currentRole}
          alertCount={activeAlertCount}
        />

        {/* View Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              zones={zones}
              alerts={alerts}
              latestOptimization={optimizationResult}
              onNavigate={setCurrentView}
              onSelectZone={(z) => setSelectedZone(z)}
            />
          )}

          {currentView === 'demand-forecast' && (
            <ForecastingView
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
            />
          )}

          {currentView === 'model-comparison' && (
            <ModelComparisonView zoneId={selectedZone.id} />
          )}

          {currentView === 'forecast-history' && (
            <ForecastHistoryView zones={zones} />
          )}

          {currentView === 'all-zones' && (
            <ZonesView
              zones={zones}
              onUpdateZones={refreshData}
              onSelectZoneForForecast={(z) => {
                setSelectedZone(z);
                setCurrentView('demand-forecast');
              }}
            />
          )}

          {currentView === 'zone-analysis' && (
            <ZonesView
              zones={zones}
              onUpdateZones={refreshData}
              onSelectZoneForForecast={(z) => {
                setSelectedZone(z);
                setCurrentView('demand-forecast');
              }}
            />
          )}

          {currentView === 'water-map' && (
            <div className="space-y-4">
              <WaterNetworkMap
                zones={zones}
                selectedZoneId={selectedZone.id}
                onSelectZone={(z) => setSelectedZone(z)}
              />
            </div>
          )}

          {currentView === 'optimization' && (
            <OptimizationView
              optimizationResult={optimizationResult}
              onApplyOptimization={(newResult) => {
                setOptimizationResult(newResult);
                refreshData();
              }}
            />
          )}

          {currentView === 'water-loss' && (
            <WaterLossView
              zones={zones}
              onTriggerAlert={() => refreshData()}
            />
          )}

          {currentView === 'simulator' && <SimulatorView />}

          {currentView === 'alerts' && (
            <AlertsView alerts={alerts} onRefreshAlerts={refreshData} />
          )}

          {currentView === 'analytics' && <AnalyticsView zones={zones} />}

          {currentView === 'reports' && (
            <ReportsView
              zones={zones}
              optimization={optimizationResult}
              alerts={alerts}
            />
          )}

          {currentView === 'data-management' && (
            <DataManagementView onDataImported={refreshData} />
          )}

          {currentView === 'settings' && <SettingsView />}

          {currentView === 'public-portal' && (
            <PublicPortalView zones={zones} alerts={alerts} />
          )}
        </main>
      </div>
    </div>
  );
}
