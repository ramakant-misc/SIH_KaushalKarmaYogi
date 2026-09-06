"use client";

import {
  Area, AreaChart, Bar, BarChart as ReBarChart, CartesianGrid, Cell, Legend, Line, LineChart as ReLineChart,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as ReRadarChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { AXIS_COLOR, GRID_COLOR, SERIES_COLORS } from "./palette";

/**
 * Thin Recharts wrappers with our tokens applied.
 *
 * Every chart is paired with a visually hidden data table by its caller, so the
 * information is available to screen readers — an SVG alone is not accessible.
 */

const axisProps = {
  stroke: AXIS_COLOR,
  tick: { fill: AXIS_COLOR, fontSize: 12 },
  tickLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--foreground)",
  },
  labelStyle: { color: "var(--foreground)", fontWeight: 600 },
} as const;

export function CompetencyRadar({
  data,
  height = 280,
}: {
  data: Array<{ label: string; current: number; required: number }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReRadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID_COLOR} />
        <PolarAngleAxis dataKey="label" tick={{ fill: AXIS_COLOR, fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fill: AXIS_COLOR, fontSize: 10 }} stroke={GRID_COLOR} />
        <Radar name="Required" dataKey="required" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.18} />
        <Radar name="Current" dataKey="current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.42} />
        <Legend wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
        <Tooltip {...tooltipStyle} />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}

export function BarChart({
  data, xKey, bars, height = 260, layout = "horizontal", stacked,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  bars: Array<{ key: string; name: string; color?: string }>;
  height?: number;
  layout?: "horizontal" | "vertical";
  stacked?: boolean;
}) {
  const vertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} layout={layout} margin={{ top: 8, right: 8, bottom: 8, left: vertical ? 8 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={!vertical} horizontal={vertical ? false : true} />
        {vertical ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey={xKey} width={140} {...axisProps} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} />
          </>
        )}
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--surface-muted)" }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />}
        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
            radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            stackId={stacked ? "a" : undefined}
          />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}

/** Bar chart where each bar carries its own colour (e.g. by severity). */
export function ColoredBarChart({
  data, height = 260,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
        <XAxis type="number" {...axisProps} />
        <YAxis type="category" dataKey="label" width={150} {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--surface-muted)" }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart({
  data, xKey, lines, height = 260,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  lines: Array<{ key: string; name: string; color?: string }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />}
        {lines.map((line, i) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  );
}

/** Compact inline trend, for table cells and stat tiles. */
export function Sparkline({
  data, color = "#4f46e5", height = 36,
}: {
  data: Array<{ value: number }>;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.16} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
