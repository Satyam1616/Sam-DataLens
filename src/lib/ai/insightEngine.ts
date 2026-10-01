import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

/**
 * Groq-powered insight generator.
 *
 * Groq exposes an OpenAI-compatible endpoint, so we reuse LangChain's
 * ChatOpenAI client and simply point it at Groq's base URL. The model is a
 * reasoning model (gpt-oss), so we give it enough headroom in maxTokens.
 */
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export class InsightGenerator {
  private llm: ChatOpenAI | null;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // No key configured — caller falls back to the deterministic insight.
      this.llm = null;
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        model: DEFAULT_MODEL,
        temperature: 0.3,
        maxTokens: 1024,
        apiKey,
        configuration: { baseURL: GROQ_BASE_URL },
      });
    } catch (e) {
      console.warn("InsightGenerator: failed to initialise Groq client", e);
      this.llm = null;
    }
  }

  /** Whether a live LLM is available. */
  public get isLive(): boolean {
    return this.llm !== null;
  }

  /**
   * Turns the *actual* aggregated result set into a concise, business-facing
   * narrative. Returns null on any failure so the caller can fall back to the
   * deterministic insight — the demo must never hard-fail on an LLM hiccup.
   */
  public async generateInsight(
    question: string,
    queryResults: unknown[]
  ): Promise<string | null> {
    if (!this.llm) return null;

    const promptText = `You are a senior data analyst embedded in a business-intelligence tool.

A user asked:
"{question}"

The analytics engine returned this result set (JSON):
{queryResults}

Write a tight, two-to-three sentence insight for a business reader:
1. Lead with the single most important fact grounded in the numbers above.
2. Follow with one concrete, actionable recommendation.

Rules: reference real figures from the data, never invent numbers, do not mention SQL or JSON, and do not use markdown headings.`;

    try {
      const prompt = PromptTemplate.fromTemplate(promptText);
      const chain = prompt.pipe(this.llm);
      const response = await chain.invoke({
        question,
        // Cap payload so we stay well within token limits.
        queryResults: JSON.stringify(queryResults).substring(0, 3000),
      });

      const text = response.content.toString().trim();
      return text.length > 0 ? text : null;
    } catch (error) {
      console.warn("InsightGenerator: Groq call failed, using fallback.", error);
      return null;
    }
  }
}
