import React, { useState } from 'react';
import { Zone, RiskLevel } from '../../types';
import { Droplets, Info, Filter, X, ArrowUpRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface WaterNetworkMapProps {
  zones: Zone[];
  onSelectZone?: (zone: Zone) => void;
  selectedZoneId?: string;
}

export const WaterNetworkMap: React.FC<WaterNetworkMapProps> = ({
  zones,
  onSelectZone,
  selectedZoneId,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'shortage' | 'abnormal_loss' | 'high_risk'>('all');
  const [activeZone, setActiveZone] = useState<Zone | null>(
    selectedZoneId ? zones.find((z) => z.id === selectedZoneId) || null : zones[1] // Default to Zone B
  );

  // Geographic/topological coordinates inside a crisp 800x520 SVG coordinate space
  const districtLayouts: Record<
    string,
    { cx: number; cy: number; r: number; path: string; labelX: number; labelY: number }
  > = {
    'zone-a': {
      cx: 390,
      cy: 240,
      r: 48,
      path: 'M 340,210 L 440,200 L 460,280 L 370,290 Z',
      labelX: 400,
      labelY: 245,
    },
    'zone-b': {
      cx: 560,
      cy: 280,
      r: 54,
      path: 'M 490,240 L 620,230 L 640,340 L 510,340 Z',
      labelX: 565,
      labelY: 285,
    },
    'zone-c': {
      cx: 340,
      cy: 130,
      r: 56,
      path: 'M 270,90 L 420,80 L 430,180 L 290,180 Z',
      labelX: 350,
      labelY: 135,
    },
    'zone-d': {
      cx: 230,
      cy: 270,
      r: 50,
      path: 'M 170,220 L 310,210 L 300,320 L 160,310 Z',
      labelX: 235,
      labelY: 265,
    },
    'zone-e': {
      cx: 290,
      cy: 400,
      r: 52,
      path: 'M 220,340 L 370,330 L 360,460 L 210,440 Z',
      labelX: 290,
      labelY: 395,
    },
    'zone-f': {
      cx: 210,
      cy: 140,
      r: 45,
      path: 'M 150,90 L 250,80 L 260,190 L 150,180 Z',
      labelX: 205,
      labelY: 135,
    },
    'zone-g': {
      cx: 480,
      cy: 110,
      r: 46,
      path: 'M 440,70 L 570,70 L 560,170 L 440,160 Z',
      labelX: 500,
      labelY: 115,
    },
    'zone-h': {
      cx: 660,
      cy: 390,
      r: 48,
      path: 'M 580,340 L 730,340 L 710,470 L 570,450 Z',
      labelX: 650,
      labelY: 405,
    },
  };

  const getStatusColor = (status: RiskLevel) => {
    switch (status) {
      case 'critical':
        return '#dc2626'; // Red
      case 'high':
        return '#ea580c'; // Orange
      case 'medium':
        return '#d97706'; // Amber
      case 'low':
        return '#0284c7'; // Light Cyan/Sky
      case 'normal':
      default:
        return '#059669'; // Green
    }
  };

  const filteredZones = zones.filter((z) => {
    if (filterType === 'all') return true;
    if (filterType === 'normal') return z.status === 'normal';
    if (filterType === 'high_risk') return z.status === 'high' || z.status === 'critical';
    if (filterType === 'shortage') return z.predicted_demand_ml > z.current_supply_ml;
    if (filterType === 'abnormal_loss') return z.water_loss_rate >= 20;
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Metropolitan Water Grid Topology Map</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>Telemetry Source: Regional SCADA Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>8 Active Districts</span>
            <span aria-hidden="true">·</span>
            <span>Reservoir Aqueduct Lines</span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Zones
          </button>
          <button
            onClick={() => setFilterType('high_risk')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterType === 'high_risk'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            High Risk
          </button>
          <button
            onClick={() => setFilterType('shortage')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterType === 'shortage'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Shortage
          </button>
          <button
            onClick={() => setFilterType('abnormal_loss')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filterType === 'abnormal_loss'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Abnormal Loss (&gt;20%)
          </button>
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative mt-4 bg-slate-950 rounded-md border border-slate-800 overflow-hidden select-none">
        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded px-3 py-2 text-[11px] text-slate-300 z-10 space-y-1">
          <div className="font-semibold text-slate-200 tracking-wide uppercase text-[10px] mb-1">
            Status Telemetry
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Normal Operation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>High Risk (Deficit / Loss)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Critical Alert</span>
          </div>
        </div>

        {/* Scaled SVG Map Layout */}
        <svg
          viewBox="0 0 840 520"
          className="w-full h-auto max-h-[500px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2,2" />
            </pattern>
            {/* Water flow marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect width="840" height="520" fill="#090d16" />
          <rect width="840" height="520" fill="url(#grid)" opacity="0.65" />

          {/* Municipal coastline & river simulation */}
          <path
            d="M 60,0 C 80,120 70,240 50,380 C 40,440 30,520 20,520 L 0,520 L 0,0 Z"
            fill="#032541"
            opacity="0.4"
          />
          <path
            d="M 460,0 C 480,140 450,230 490,320 C 530,420 540,520 540,520"
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeOpacity="0.35"
          />

          {/* Reservoir Supply Nodes */}
          <g className="text-slate-400 font-mono text-[9px]">
            {/* Upper Vaitarna */}
            <circle cx="680" cy="50" r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="680" y="75" fill="#94a3b8" textAnchor="middle">Upper Vaitarna Res.</text>

            {/* Bhatsa Treatment Plant */}
            <circle cx="120" cy="50" r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="120" y="75" fill="#94a3b8" textAnchor="middle">Bhatsa Filtration Plant</text>

            {/* Coastal Marine Outfall */}
            <circle cx="120" cy="480" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <text x="120" y="505" fill="#64748b" textAnchor="middle">Harbor Outfall</text>
          </g>

          {/* Main transmission pipelines (Aqueducts) */}
          <g stroke="#38bdf8" strokeWidth="1.8" strokeOpacity="0.45" strokeDasharray="6,4">
            {/* Bhatsa to Zone F & C */}
            <line x1="120" y1="50" x2="210" y2="140" markerEnd="url(#arrow)" />
            <line x1="210" y1="140" x2="340" y2="130" />
            <line x1="340" y1="130" x2="390" y2="240" markerEnd="url(#arrow)" />

            {/* Upper Vaitarna to Zone G & Zone B */}
            <line x1="680" y1="50" x2="480" y2="110" markerEnd="url(#arrow)" />
            <line x1="480" y1="110" x2="560" y2="280" markerEnd="url(#arrow)" />

            {/* Inter-zone pipelines */}
            <line x1="390" y1="240" x2="560" y2="280" />
            <line x1="390" y1="240" x2="230" y2="270" />
            <line x1="230" y1="270" x2="290" y2="400" />
            <line x1="560" y1="280" x2="660" y2="390" />
          </g>

          {/* District Polygons */}
          {zones.map((zone) => {
            const layout = districtLayouts[zone.id];
            if (!layout) return null;

            const isSelected = activeZone?.id === zone.id;
            const isMatch = filteredZones.some((fz) => fz.id === zone.id);
            const statusColor = getStatusColor(zone.status);

            const shortageML = Math.round(Math.max(0, zone.predicted_demand_ml - zone.current_supply_ml) * 10) / 10;
            const isAbnormalLoss = zone.water_loss_rate >= 20;

            return (
              <g
                key={zone.id}
                onClick={() => {
                  setActiveZone(zone);
                  if (onSelectZone) onSelectZone(zone);
                }}
                className="cursor-pointer transition-all duration-150"
                opacity={isMatch ? 1 : 0.25}
              >
                {/* Polygon District Territory */}
                <path
                  d={layout.path}
                  fill={statusColor}
                  fillOpacity={isSelected ? 0.35 : 0.16}
                  stroke={isSelected ? '#ffffff' : statusColor}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                />

                {/* District Center Pulse Dot */}
                <circle
                  cx={layout.cx}
                  cy={layout.cy}
                  r={isSelected ? 8 : 5}
                  fill={statusColor}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />

                {/* District Code & Name */}
                <text
                  x={layout.labelX}
                  y={layout.labelY - 14}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {zone.code}
                </text>
                <text
                  x={layout.labelX}
                  y={layout.labelY}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {zone.name.split('·')[1]?.trim() || zone.name}
                </text>

                {/* Metrics badge: Demand / Supply */}
                <text
                  x={layout.labelX}
                  y={layout.labelY + 14}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {zone.current_supply_ml} / {zone.predicted_demand_ml} ML
                </text>

                {/* Shortage or Loss Warning Glyph */}
                {(shortageML > 0 || isAbnormalLoss) && (
                  <circle
                    cx={layout.labelX + 34}
                    cy={layout.labelY - 20}
                    r={5}
                    fill={isAbnormalLoss ? '#ea580c' : '#dc2626'}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Zone Inspection Popup (Floating Panel) */}
        {activeZone && (
          <div className="absolute bottom-3 right-3 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-4 shadow-xl text-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {activeZone.code} · {activeZone.type}
                </span>
                <h4 className="text-sm font-semibold text-white mt-0.5 leading-snug">
                  {activeZone.name}
                </h4>
              </div>
              <button
                onClick={() => setActiveZone(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Population</span>
                <span className="text-slate-100 tabular-nums">
                  {activeZone.population.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Priority Rank</span>
                <span className="text-slate-100 tabular-nums">
                  Level {activeZone.priority_level} / 5
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Current Supply</span>
                <span className="text-sky-400 tabular-nums">
                  {activeZone.current_supply_ml} ML/d
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Predicted Demand</span>
                <span className="text-slate-100 tabular-nums">
                  {activeZone.predicted_demand_ml} ML/d
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Expected Shortage</span>
                <span
                  className={`tabular-nums ${
                    activeZone.predicted_demand_ml > activeZone.current_supply_ml
                      ? 'text-rose-400 font-semibold'
                      : 'text-emerald-400'
                  }`}
                >
                  {Math.round(
                    Math.max(0, activeZone.predicted_demand_ml - activeZone.current_supply_ml) * 10
                  ) / 10}{' '}
                  ML
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Water Loss Rate</span>
                <span
                  className={`tabular-nums ${
                    activeZone.water_loss_rate >= 20
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-200'
                  }`}
                >
                  {activeZone.water_loss_rate}%
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Source: {activeZone.reservoir_source.split(' ')[0]}</span>
              <span
                className="font-medium capitalize"
                style={{ color: getStatusColor(activeZone.status) }}
              >
                ● {activeZone.status} status
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
