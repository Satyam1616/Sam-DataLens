// Groq-powered analyst: question + schema -> AnalysisSpec, and result -> insight.
// Groq is OpenAI-compatible; we call it with fetch (no SDK). When no key is set,
// a heuristic planner keeps the app fully functional.

import { Dataset } from "../csv";
import { AnalysisSpec, AnalysisResult, Aggregation, ChartType } from "../analysis";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function schemaDescription(ds: Dataset): string {
  return ds.columns
    .map((c) => `- "${c.name}" (${c.type}, ${c.distinct} distinct, e.g. ${c.samples.slice(0, 3).join(" / ") || "n/a"})`)
    .join("\n");
}

export function hasGroq(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

async function groqJSON(system: string, user: string, maxTokens = 700): Promise<any> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const payload = await res.json();
  return JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
}

/** Heuristic planner used when Groq is unavailable or errors. */
export function heuristicSpec(ds: Dataset, question: string): AnalysisSpec {
  const q = question.toLowerCase();
  const dateCol = ds.columns.find((c) => c.type === "date");
  const numCols = ds.columns.filter((c) => c.type === "number");
  const catCols = ds.columns.filter((c) => c.type === "string" && c.distinct > 1 && c.distinct <= 50);

  const metric =
    numCols.find((c) => q.includes(c.name.toLowerCase()))?.name || numCols[0]?.name;

  const wantsTrend = /(trend|over time|month|year|daily|growth|timeline)/.test(q);
  const wantsShare = /(share|percent|proportion|breakdown|split|distribution)/.test(q);
  const mentionedCat = catCols.find((c) => q.includes(c.name.toLowerCase()));

  let chartType: ChartType = "bar";
  let groupBy = mentionedCat?.name || catCols[0]?.name;
  let timeBucket: AnalysisSpec["timeBucket"] = "none";

  if (wantsTrend && dateCol) { chartType = "line"; groupBy = dateCol.name; timeBucket = "month"; }
  else if (wantsShare) { chartType = "pie"; }
  if (!groupBy && !dateCol) chartType = "metric";

  return {
    title: question.replace(/\b\w/g, (m) => m.toUpperCase()).slice(0, 80),
    chartType,
    groupBy,
    timeBucket,
    metric,
    aggregation: "sum",
    sort: "desc",
    limit: 12,
  };
}

const SPEC_SYSTEM = `You translate a business question about a dataset into a single JSON analysis spec.
Return ONLY JSON with this exact shape:
{
  "title": string,                      // concise chart title
  "chartType": "bar"|"line"|"area"|"pie"|"metric",
  "groupBy": string|null,               // a column to group by (dimension); null for a single KPI
  "timeBucket": "none"|"day"|"month"|"year",  // bucket for date groupBy, else "none"
  "metric": string|null,                // numeric column to aggregate; null => count rows
  "aggregation": "sum"|"avg"|"count"|"min"|"max",
  "filters": [{"column": string, "op": "eq"|"ne"|"gt"|"gte"|"lt"|"lte"|"contains", "value": string|number}],
  "sort": "asc"|"desc",
  "limit": number
}
Rules: use ONLY column names that exist. Prefer a line chart with a date groupBy for trends,
a pie for share/breakdown questions, a bar for category comparisons, and "metric" for a single total.
Choose the metric/aggregation that best answers the question. Keep limit <= 20.`;

export async function planSpec(ds: Dataset, question: string): Promise<{ spec: AnalysisSpec; poweredBy: "groq" | "heuristic" }> {
  if (!hasGroq()) return { spec: heuristicSpec(ds, question), poweredBy: "heuristic" };
  try {
    const user = `Columns:\n${schemaDescription(ds)}\n\nQuestion: "${question}"`;
    const raw = await groqJSON(SPEC_SYSTEM, user, 500);
    const valid = new Set(ds.columns.map((c) => c.name));
    const spec: AnalysisSpec = {
      title: String(raw.title || question).slice(0, 90),
      chartType: (["bar", "line", "area", "pie", "metric"].includes(raw.chartType) ? raw.chartType : "bar") as ChartType,
      groupBy: valid.has(raw.groupBy) ? raw.groupBy : undefined,
      timeBucket: ["none", "day", "month", "year"].includes(raw.timeBucket) ? raw.timeBucket : "none",
      metric: valid.has(raw.metric) ? raw.metric : undefined,
      aggregation: (["sum", "avg", "count", "min", "max"].includes(raw.aggregation) ? raw.aggregation : "sum") as Aggregation,
      filters: Array.isArray(raw.filters)
        ? raw.filters.filter((f: any) => valid.has(f?.column)).slice(0, 5)
        : [],
      sort: raw.sort === "asc" ? "asc" : "desc",
      limit: Math.min(Math.max(Number(raw.limit) || 12, 1), 20),
    };
    return { spec, poweredBy: "groq" };
  } catch (e) {
    console.warn("planSpec: Groq failed, using heuristic.", e);
    return { spec: heuristicSpec(ds, question), poweredBy: "heuristic" };
  }
}

const INSIGHT_SYSTEM = `You are a senior data analyst. Given a question and the computed result rows,
write 2-3 sentences for a business reader: lead with the single most important fact grounded in the
numbers, then one concrete recommendation. Reference real figures, never invent numbers, no markdown.`;

export async function writeInsight(question: string, result: AnalysisResult): Promise<string | null> {
  if (!hasGroq()) return null;
  try {
    const user = `Question: "${question}"\nResult (${result.rowCount} rows analysed): ${JSON.stringify(result.data).slice(0, 2500)}`;
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          { role: "system", content: INSIGHT_SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    const text = (payload.choices?.[0]?.message?.content ?? "").trim();
    return text || null;
  } catch {
    return null;
  }
}

/** Suggest 3 natural follow-up questions grounded in the schema. */
export function suggestQuestions(ds: Dataset): string[] {
  const dateCol = ds.columns.find((c) => c.type === "date");
  const numCol = ds.columns.find((c) => c.type === "number");
  const catCols = ds.columns.filter((c) => c.type === "string" && c.distinct > 1 && c.distinct <= 50);
  const out: string[] = [];
  if (numCol && catCols[0]) out.push(`${numCol.name} by ${catCols[0].name}`);
  if (numCol && dateCol) out.push(`${numCol.name} trend over time`);
  if (numCol && catCols[1]) out.push(`Share of ${numCol.name} by ${catCols[1].name}`);
  if (out.length < 3 && numCol) out.push(`What is the total ${numCol.name}?`);
  return out.slice(0, 3);
}
