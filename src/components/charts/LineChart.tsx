import React, { useState } from 'react';
import { ForecastDayResult } from '../../types';

interface LineChartProps {
  historicalData: { date: string; value: number }[];
  forecastData: ForecastDayResult[];
  availableSupply: number;
  height?: number;
}

export const ForecastLineChart: React.FC<LineChartProps> = ({
  historicalData,
  forecastData,
  availableSupply,
  height = 320,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    label: string;
    value: number;
    upper?: number;
    lower?: number;
    x: number;
    y: number;
    isForecast: boolean;
  } | null>(null);

  // Take the last 14 historical points for clean chart pacing
  const historySlice = historicalData.slice(-14);

  // Combined points
  const combinedPoints: {
    date: string;
    label: string;
    value: number;
    upper?: number;
    lower?: number;
    isForecast: boolean;
  }[] = [
    ...historySlice.map((h) => ({
      date: h.date,
      label: h.date.slice(5),
      value: h.value,
      isForecast: false,
    })),
    ...forecastData.map((f) => ({
      date: f.date,
      label: f.date.slice(5),
      value: f.predicted_demand,
      upper: f.upper_bound,
      lower: f.lower_bound,
      isForecast: true,
    })),
  ];

  if (combinedPoints.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No chart telemetry</div>;
  }

  // Bounds
  const allValues = [
    ...combinedPoints.map((p) => p.value),
    ...combinedPoints.map((p) => p.upper || p.value),
    availableSupply,
  ];
  const minValue = Math.max(0, Math.floor(Math.min(...allValues) * 0.85));
  const maxValue = Math.ceil(Math.max(...allValues) * 1.15);
  const valueRange = maxValue - minValue || 1;

  const width = 800;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => paddingLeft + (index / (combinedPoints.length - 1 || 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minValue) / valueRange) * chartHeight;

  // Path for Historical line
  const histPoints = combinedPoints.slice(0, historySlice.length);
  const histPath = histPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.value)}`)
    .join(' ');

  // Path for Forecast line (starts from last historical point for continuous curve)
  const fcStartIndex = Math.max(0, historySlice.length - 1);
  const fcPoints = combinedPoints.slice(fcStartIndex);
  const fcPath = fcPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(fcStartIndex + i)} ${getY(p.value)}`)
    .join(' ');

  // Shaded polygon for 95% confidence interval
  const fcOnly = combinedPoints.slice(historySlice.length);
  let confidenceAreaPath = '';
  if (fcOnly.length > 0) {
    const topPoints = fcPoints.map((p, i) => `${getX(fcStartIndex + i)} ${getY(p.upper || p.value)}`);
    const bottomPoints = [...fcPoints]
      .reverse()
      .map((p, i) => `${getX(fcStartIndex + (fcPoints.length - 1 - i))} ${getY(p.lower || p.value)}`);
    confidenceAreaPath = `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
  }

  // Supply horizontal reference line
  const supplyY = getY(availableSupply);

  // Y-axis tick marks (4 ticks)
  const yTicks = [
    minValue,
    Math.round(minValue + valueRange * 0.33),
    Math.round(minValue + valueRange * 0.66),
    maxValue,
  ];

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Legend & Meta indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-500"></span>
            <span>Historical Consumption (14d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-500"></span>
            <span>Forecast Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-sky-500/20 border border-sky-500/30"></span>
            <span>95% Confidence Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed"></span>
            <span>Available Supply Target</span>
          </div>
        </div>
        <div className="font-mono tabular-nums text-[11px]">
          Available Supply: {availableSupply} ML/d
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {/* Horizontal grid lines */}
        {yTicks.map((tickVal, i) => {
          const y = getY(tickVal);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#334155"
                strokeOpacity="0.2"
                strokeDasharray="2,2"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
                fontFamily="JetBrains Mono, monospace"
              >
                {tickVal} ML
              </text>
            </g>
          );
        })}

        {/* Available Supply reference line */}
        <line
          x1={paddingLeft}
          y1={supplyY}
          x2={width - paddingRight}
          y2={supplyY}
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
        <text
          x={width - paddingRight}
          y={supplyY - 6}
          textAnchor="end"
          fontSize="9.5"
          fill="#ef4444"
          fontFamily="JetBrains Mono, monospace"
        >
          Capacity Limit ({availableSupply} ML)
        </text>

        {/* Confidence Interval band */}
        {confidenceAreaPath && (
          <path
            d={confidenceAreaPath}
            fill="#38bdf8"
            fillOpacity="0.12"
            stroke="#0284c7"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        )}

        {/* Historical line */}
        <path
          d={histPath}
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Forecast line */}
        <path
          d={fcPath}
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Forecast Transition Vertical Divider */}
        {historySlice.length > 0 && (
          <line
            x1={getX(historySlice.length - 1)}
            y1={paddingTop}
            x2={getX(historySlice.length - 1)}
            y2={paddingTop + chartHeight}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        )}

        {/* Data point dots & interactive hit targets */}
        {combinedPoints.map((p, idx) => {
          const cx = getX(idx);
          const cy = getY(p.value);
          const isSelected = hoveredPoint?.date === p.date;

          // X-axis label (show every 2-3 points to avoid clutter)
          const showLabel = idx % Math.max(1, Math.floor(combinedPoints.length / 8)) === 0 || idx === combinedPoints.length - 1;

          return (
            <g key={idx}>
              {/* Point circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 5 : p.isForecast ? 3.5 : 2.5}
                fill={p.isForecast ? '#0284c7' : '#64748b'}
                stroke="#ffffff"
                strokeWidth={isSelected ? 2 : 1}
              />

              {/* X-axis tick label */}
              {showLabel && (
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {p.label}
                </text>
              )}

              {/* Invisible wide hover area */}
              <rect
                x={cx - 15}
                y={paddingTop}
                width={30}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    date: p.date,
                    label: p.label,
                    value: p.value,
                    upper: p.upper,
                    lower: p.lower,
                    x: cx,
                    y: cy,
                    isForecast: p.isForecast,
                  })
                }
              />
            </g>
          );
        })}
      </svg>

      {/* Hover Card */}
      {hoveredPoint && (
        <div
          className="absolute pointer-events-none bg-slate-900/90 text-slate-100 border border-slate-700 rounded px-2.5 py-1.5 text-xs shadow-lg font-mono tabular-nums z-20"
          style={{
            left: Math.min(width - 150, Math.max(20, hoveredPoint.x - 60)),
            top: Math.max(10, hoveredPoint.y - 65),
          }}
        >
          <div className="font-sans font-medium text-[11px] text-slate-300">
            {hoveredPoint.date} · {hoveredPoint.isForecast ? 'Forecast' : 'Historical'}
          </div>
          <div className="text-sky-300 font-semibold">
            {hoveredPoint.value} ML/day
          </div>
          {hoveredPoint.upper && (
            <div className="text-[10px] text-slate-400">
              CI: [{hoveredPoint.lower} – {hoveredPoint.upper}] ML
            </div>
          )}
          {hoveredPoint.value > availableSupply && (
            <div className="text-[10px] text-rose-400 font-semibold">
              Deficit: +{Math.round((hoveredPoint.value - availableSupply) * 10) / 10} ML
            </div>
          )}
        </div>
      )}
    </div>
  );
};
