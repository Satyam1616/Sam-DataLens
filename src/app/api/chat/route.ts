import { NextResponse } from 'next/server';
import { DataLensEngine } from '@/lib/engine';
import { InsightGenerator } from '@/lib/ai/insightEngine';

const engine = new DataLensEngine();
const insighter = new InsightGenerator();

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // 1. Deterministic engine computes the real aggregated dataset + chart spec.
    //    This always succeeds and is the source of truth for the numbers.
    const response = engine.processQuery(query);

    // 2. If a Groq key is configured, upgrade the canned insight to a real
    //    LLM narrative grounded in the numbers we just computed. On any
    //    failure we keep the deterministic insight, so the demo never breaks.
    let poweredBy: 'groq' | 'engine' = 'engine';
    if (insighter.isLive && response.data.length > 0) {
      const aiInsight = await insighter.generateInsight(query, response.data);
      if (aiInsight) {
        response.insight = aiInsight;
        poweredBy = 'groq';
      }
    }

    return NextResponse.json({ ...response, poweredBy });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
