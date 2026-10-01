# DataLens

**Ask your data anything.** Upload a CSV, ask a question in plain English, and get a chart plus a written insight computed from your actual rows — no SQL, no dashboards to build.

🔗 **Live:** https://sam-datalens.vercel.app

---

## Why it's different

Most "AI analytics" tools let a model make up numbers. DataLens splits the two jobs:

1. The model only decides **what** to measure (an analysis spec: group-by, metric, aggregation, chart type).
2. A deterministic engine does the **arithmetic** on your real data.
3. The model then writes a short insight **grounded in the computed numbers**.

Every figure on screen traces back to a row you uploaded — nothing is hallucinated.

---

## Features

- **Bring your own data** — drop in any CSV; columns and types are detected automatically. A realistic sample dataset is bundled so it works instantly.
- **Natural-language questions** — "revenue by region", "profit trend over time", "which segment is growing fastest?"
- **Auto-charts** — bar / line / area / pie / KPI, picked to fit the question, with a data-table toggle.
- **Grounded insights** — a plain-English takeaway written from the real result set.
- **Safe SQL path** — for the live-database mode, generated SQL is parsed to an AST and validated **SELECT-only with an enforced row limit**.
- **Accounts & saved insights** — credentials auth (NextAuth) with a graceful in-memory fallback when no database is attached.
- **Light / dark theme.**

---

## How it works

```
CSV ──▶ client parses + infers schema ──▶ POST /api/analyze
                                              │
          ┌───────────────────────────────────┘
          ▼
   1. Plan   → model returns an AnalysisSpec (what to compute)
   2. Compute→ deterministic engine aggregates the real rows
   3. Narrate→ model writes an insight from the computed result
          │
          ▼
   { title, chartType, data, insight } ──▶ chart + takeaway
```

Key files: `src/lib/csv.ts` (parser + type inference), `src/lib/analysis.ts` (engine), `src/lib/ai/analyst.ts` (planning + narration), `src/app/api/analyze/route.ts` (orchestration), `src/components/ChartView.tsx` (rendering).

---

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Recharts · NextAuth · Prisma + PostgreSQL (optional) · `node-sql-parser` for SQL validation.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

### Environment

```env
LLM_API_KEY=...              # see .env.example for the exact names
NEXTAUTH_SECRET=some_random_string
NEXTAUTH_URL=http://localhost:3000
# DATABASE_URL is optional — the app runs in demo mode without it
```

Without a model API key the app still works end-to-end using a deterministic planner and insight; without a database, login and saved queries fall back to in-memory behaviour.

---

Built by Satyam Jha.
