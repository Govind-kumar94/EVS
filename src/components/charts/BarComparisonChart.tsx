import React, { useState } from 'react';

interface BarDataPoint {
  label: string;
  code: string;
  primaryValue: number;
  secondaryValue: number;
  highlight?: boolean;
}

interface BarComparisonChartProps {
  data: BarDataPoint[];
  primaryLabel: string;
  secondaryLabel: string;
  height?: number;
  unit?: string;
}

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  data,
  primaryLabel,
  secondaryLabel,
  height = 260,
  unit = 'ML',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.primaryValue, d.secondaryValue))) * 1.15 || 50;
  const width = 800;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const groupWidth = chartWidth / data.length;
  const barWidth = Math.min(22, (groupWidth - 16) / 2);

  const getY = (val: number) => paddingTop + chartHeight - (val / maxVal) * chartHeight;

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Legend */}
      <div className="flex items-center justify-between gap-4 mb-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-slate-400 rounded-xs"></span>
            <span>{primaryLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-600 rounded-xs"></span>
            <span>{secondaryLabel}</span>
          </div>
        </div>
        <span className="font-mono tabular-nums text-[11px]">Units: {unit}</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Horizontal grid lines */}
        {[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#334155"
                strokeOpacity="0.15"
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
                {Math.round(tick)}
              </text>
            </g>
          );
        })}

        {/* Bar pairs */}
        {data.map((item, idx) => {
          const groupCenterX = paddingLeft + idx * groupWidth + groupWidth / 2;
          const bar1X = groupCenterX - barWidth - 2;
          const bar2X = groupCenterX + 2;

          const y1 = getY(item.primaryValue);
          const y2 = getY(item.secondaryValue);
          const h1 = chartHeight - (y1 - paddingTop);
          const h2 = chartHeight - (y2 - paddingTop);

          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
            >
              {/* Primary Bar */}
              <rect
                x={bar1X}
                y={y1}
                width={barWidth}
                height={Math.max(2, h1)}
                fill="#94a3b8"
                rx="2"
                opacity={isHovered ? 1 : 0.85}
              />

              {/* Secondary Bar */}
              <rect
                x={bar2X}
                y={y2}
                width={barWidth}
                height={Math.max(2, h2)}
                fill="#0284c7"
                rx="2"
                opacity={isHovered ? 1 : 0.9}
              />

              {/* Delta indicator if secondary > primary */}
              {item.secondaryValue !== item.primaryValue && (
                <text
                  x={groupCenterX}
                  y={Math.min(y1, y2) - 6}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill={item.secondaryValue > item.primaryValue ? '#0284c7' : '#ea580c'}
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {item.secondaryValue > item.primaryValue ? '+' : ''}
                  {Math.round((item.secondaryValue - item.primaryValue) * 10) / 10}
                </text>
              )}

              {/* Category label */}
              <text
                x={groupCenterX}
                y={height - 14}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontWeight={isHovered ? '600' : '400'}
                fontFamily="JetBrains Mono, monospace"
              >
                {item.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {data[hoveredIdx].label} ({data[hoveredIdx].code})
          </span>
          <div className="flex items-center gap-4 font-mono tabular-nums text-slate-600 dark:text-slate-400">
            <span>
              {primaryLabel}: <strong className="text-slate-900 dark:text-slate-100">{data[hoveredIdx].primaryValue} {unit}</strong>
            </span>
            <span>
              {secondaryLabel}: <strong className="text-sky-600 dark:text-sky-400">{data[hoveredIdx].secondaryValue} {unit}</strong>
            </span>
            <span>
              Delta:{' '}
              <strong
                className={
                  data[hoveredIdx].secondaryValue >= data[hoveredIdx].primaryValue
                    ? 'text-sky-600'
                    : 'text-amber-600'
                }
              >
                {Math.round((data[hoveredIdx].secondaryValue - data[hoveredIdx].primaryValue) * 10) / 10} {unit}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
