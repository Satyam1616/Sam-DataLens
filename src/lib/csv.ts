// Shared data types + a dependency-free CSV parser and schema inference.

export type ColumnType = "number" | "date" | "string";

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  /** A few example values, for display and for grounding the LLM. */
  samples: string[];
  /** Distinct-value count (capped) — helps decide dimension vs measure. */
  distinct: number;
}

export interface Dataset {
  name: string;
  columns: ColumnMeta[];
  rows: Record<string, unknown>[];
}

/** Parse CSV text into rows of string cells (RFC-4180-ish: quotes, escaped quotes, newlines in quotes). */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Normalise newlines and strip a BOM if present.
  const s = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  // Flush trailing field/row.
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  // Drop fully empty rows.
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const DATE_RE =
  /^\d{4}-\d{1,2}-\d{1,2}([ T]\d{1,2}:\d{2}(:\d{2})?)?$|^\d{1,2}\/\d{1,2}\/\d{2,4}$/;

function looksNumeric(v: string): boolean {
  if (v.trim() === "") return false;
  // Allow currency/thousands separators and percentages.
  const cleaned = v.replace(/[$£€,%\s]/g, "");
  return cleaned !== "" && !isNaN(Number(cleaned));
}

export function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/[$£€,%\s]/g, ""));
  return isNaN(n) ? 0 : n;
}

function inferType(values: string[]): ColumnType {
  const nonEmpty = values.filter((v) => v.trim() !== "").slice(0, 200);
  if (nonEmpty.length === 0) return "string";
  const numeric = nonEmpty.filter(looksNumeric).length;
  const dates = nonEmpty.filter((v) => DATE_RE.test(v.trim())).length;
  if (dates / nonEmpty.length > 0.8) return "date";
  if (numeric / nonEmpty.length > 0.8) return "number";
  return "string";
}

/** Build a typed Dataset from raw CSV text. */
export function datasetFromCSV(text: string, name = "dataset"): Dataset {
  const grid = parseCSV(text);
  if (grid.length === 0) return { name, columns: [], rows: [] };

  const header = grid[0].map((h, i) => h.trim() || `column_${i + 1}`);
  const bodyRows = grid.slice(1);

  const columns: ColumnMeta[] = header.map((colName, idx) => {
    const colValues = bodyRows.map((r) => (r[idx] ?? "").toString());
    const type = inferType(colValues);
    const distinctSet = new Set<string>();
    for (const v of colValues) {
      if (distinctSet.size > 1000) break;
      if (v.trim() !== "") distinctSet.add(v);
    }
    return {
      name: colName,
      type,
      samples: colValues.filter((v) => v.trim() !== "").slice(0, 3),
      distinct: distinctSet.size,
    };
  });

  const rows = bodyRows.map((r) => {
    const obj: Record<string, unknown> = {};
    header.forEach((colName, idx) => {
      const raw = (r[idx] ?? "").toString();
      const col = columns[idx];
      obj[colName] = col.type === "number" ? toNumber(raw) : raw;
    });
    return obj;
  });

  return { name, columns, rows };
}
