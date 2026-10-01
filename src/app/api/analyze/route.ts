import { NextResponse } from "next/server";
import { Dataset } from "@/lib/csv";
import { runAnalysis } from "@/lib/analysis";
import { planSpec, writeInsight, suggestQuestions } from "@/lib/ai/analyst";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { question, dataset } = (await req.json()) as {
      question?: string;
      dataset?: Dataset;
    };

    if (!question || !dataset?.columns?.length || !dataset?.rows?.length) {
      return NextResponse.json(
        { error: "A question and a non-empty dataset are required." },
        { status: 400 }
      );
    }

    // 1. LLM (or heuristic) decides WHAT to compute.
    const { spec, poweredBy } = await planSpec(dataset, question);

    // 2. Deterministic engine computes the real numbers.
    const result = runAnalysis(dataset, spec);

    // 3. LLM narrates the computed result (grounded, never invents figures).
    const aiInsight = await writeInsight(question, result);
    const insight =
      aiInsight ??
      `Analysed ${result.rowCount.toLocaleString()} records. ${result.title}.`;

    return NextResponse.json({
      ...result,
      insight,
      spec,
      poweredBy: aiInsight ? poweredBy : poweredBy === "groq" ? "groq" : "heuristic",
      suggestedQuestions: suggestQuestions(dataset),
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: "Failed to analyse the data." }, { status: 500 });
  }
}
