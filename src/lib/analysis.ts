// Deterministic analysis engine: executes an AnalysisSpec over real rows.
// The LLM decides the *spec* (what to compute); this code does the math, so
// every number shown is accurate and never hallucinated.

import { Dataset, toNumber } from "./csv";

export type Aggregation = "sum" | "avg" | "count" | "min" | "max";
export type ChartType = "bar" | "line" | "area" | "pie" | "metric" | "table";
export type TimeBucket = "none" | "day" | "month" | "year";

export interface Filter {
  column: string;
  op: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains";
  value: string | number;
}

export interface AnalysisSpec {
  title: string;
  chartType: ChartType;
  groupBy?: string;
  timeBucket?: TimeBucket;
  metric?: string;
  aggregation: Aggregation;
  filters?: Filter[];
  sort?: "asc" | "desc";
  limit?: number;
}

export interface AnalysisResult {
  title: string;
  chartType: ChartType;
  data: Record<string, unknown>[];
  xAxisKey: string;
  seriesKeys: string[];
  rowCount: number;
}

function applyFilter(row: Record<string, unknown>, f: Filter): boolean {
  const cell = row[f.column];
  if (cell === undefined) return true;
  const num = typeof cell === "number";
  const a = num ? (cell as number) : String(cell).toLowerCase();
  const b = num ? toNumber(f.value) : String(f.value).toLowerCase();
  switch (f.op) {
    case "eq": return a === b;
    case "ne": return a !== b;
    case "gt": return a > b;
    case "gte": return a >= b;
    case "lt": return a < b;
    case "lte": return a <= b;
    case "contains": return String(a).includes(String(b));
    default: return true;
  }
}

function bucketDate(value: unknown, bucket: TimeBucket): string {
  const str = String(value);
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (bucket === "year") return `${y}`;
  if (bucket === "day") return `${y}-${m}-${day}`;
  return `${y}-${m}`; // month (default for dates)
}

function aggregate(values: number[], agg: Aggregation): number {
  if (agg === "count") return values.length;
  if (values.length === 0) return 0;
  switch (agg) {
    case "sum": return values.reduce((a, b) => a + b, 0);
    case "avg": return values.reduce((a, b) => a + b, 0) / values.length;
    case "min": return Math.min(...values);
    case "max": return Math.max(...values);
    default: return 0;
  }
}

export function runAnalysis(dataset: Dataset, spec: AnalysisSpec): AnalysisResult {
  const colByName = new Map(dataset.columns.map((c) => [c.name, c]));
  let rows = dataset.rows;

  // 1. Filters
  if (spec.filters?.length) {
    rows = rows.filter((r) => spec.filters!.every((f) => applyFilter(r, f)));
  }

  const metricCol = spec.metric && colByName.get(spec.metric);
  const valueOf = (r: Record<string, unknown>): number =>
    spec.aggregation === "count" || !metricCol ? 1 : toNumber(r[spec.metric!]);

  // 2. Metric cards: a few headline KPIs, no grouping.
  if (spec.chartType === "metric" || !spec.groupBy) {
    const nums = rows.map(valueOf);
    const data: Record<string, unknown>[] = [];
    if (metricCol) {
      data.push({ name: `Total ${spec.metric}`, value: aggregate(nums, "sum") });
      data.push({ name: `Average ${spec.metric}`, value: Math.round(aggregate(nums, "avg")) });
    }
    data.push({ name: "Records", value: rows.length });
    return { title: spec.title, chartType: "metric", data, xAxisKey: "name", seriesKeys: ["value"], rowCount: rows.length };
  }

  // 3. Grouped aggregation
  const dim = spec.groupBy;
  const isDate = colByName.get(dim)?.type === "date";
  const bucket: TimeBucket = isDate ? (spec.timeBucket && spec.timeBucket !== "none" ? spec.timeBucket : "month") : "none";

  const groups = new Map<string, number[]>();
  for (const r of rows) {
    const key = bucket !== "none" ? bucketDate(r[dim], bucket) : String(r[dim] ?? "—");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(valueOf(r));
  }

  const metricKey = spec.aggregation === "count" ? "count" : (spec.metric || "value");
  let data = Array.from(groups.entries()).map(([key, vals]) => ({
    [dim]: key,
    [metricKey]: Math.round(aggregate(vals, spec.aggregation) * 100) / 100,
  }));

  // 4. Sort + limit
  if (bucket !== "none") {
    data.sort((a, b) => String(a[dim]).localeCompare(String(b[dim]))); // chronological
  } else {
    const dir = spec.sort === "asc" ? 1 : -1;
    data.sort((a, b) => (Number(a[metricKey]) - Number(b[metricKey])) * dir);
  }
  if (spec.limit && spec.limit > 0) data = data.slice(0, spec.limit);

  return {
    title: spec.title,
    chartType: spec.chartType,
    data,
    xAxisKey: dim,
    seriesKeys: [metricKey],
    rowCount: rows.length,
  };
}
