"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { Table2, BarChart3 } from "lucide-react";

export const CHART_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];

type Result = {
  title: string;
  chartType: "bar" | "line" | "area" | "pie" | "metric" | "table";
  data: Record<string, unknown>[];
  xAxisKey: string;
  seriesKeys: string[];
};

const axisStyle = { fill: "var(--muted-foreground)", fontSize: 12 };
const gridStroke = "var(--border)";

function tooltipStyle() {
  return {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--foreground)",
    boxShadow: "var(--shadow-md)",
    fontSize: 13,
  };
}

const fmt = (v: unknown) =>
  typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v);

export default function ChartView({ result }: { result: Result }) {
  const [showTable, setShowTable] = useState(false);
  const { chartType, data, xAxisKey, seriesKeys } = result;

  if (chartType === "metric") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.map((item, i) => (
          <div key={i} className="surface rounded-xl p-5">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">{String(item.name)}</div>
            <div className="text-2xl font-semibold tracking-tight text-foreground">{fmt(item.value)}</div>
          </div>
        ))}
      </div>
    );
  }

  const Chart = (
    <ResponsiveContainer width="100%" height={320}>
      {chartType === "line" ? (
        <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xAxisKey} tick={axisStyle} stroke={gridStroke} />
          <YAxis tick={axisStyle} stroke={gridStroke} width={56} />
          <Tooltip contentStyle={tooltipStyle()} />
          {seriesKeys.map((k, i) => (
            <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      ) : chartType === "area" ? (
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <defs>
            {seriesKeys.map((k, i) => (
              <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xAxisKey} tick={axisStyle} stroke={gridStroke} />
          <YAxis tick={axisStyle} stroke={gridStroke} width={56} />
          <Tooltip contentStyle={tooltipStyle()} />
          {seriesKeys.map((k, i) => (
            <Area key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} fill={`url(#g-${k})`} />
          ))}
        </AreaChart>
      ) : chartType === "pie" ? (
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={64} outerRadius={110} paddingAngle={3}
            dataKey={seriesKeys[0]} nameKey={xAxisKey}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle()} />
        </PieChart>
      ) : (
        <BarChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xAxisKey} tick={axisStyle} stroke={gridStroke} />
          <YAxis tick={axisStyle} stroke={gridStroke} width={56} />
          <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: "var(--muted)" }} />
          {seriesKeys.map((k, i) => (
            <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={48} />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <button onClick={() => setShowTable((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors">
          {showTable ? <><BarChart3 size={13} /> Chart</> : <><Table2 size={13} /> Table</>}
        </button>
      </div>
      {showTable ? (
        <div className="overflow-auto max-h-80 rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left font-medium text-muted-foreground px-3 py-2">{xAxisKey}</th>
                {seriesKeys.map((k) => <th key={k} className="text-right font-medium text-muted-foreground px-3 py-2">{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{String(row[xAxisKey])}</td>
                  {seriesKeys.map((k) => <td key={k} className="px-3 py-2 text-right tabular-nums text-foreground">{fmt(row[k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : Chart}
    </div>
  );
}
