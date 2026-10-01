import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SqlValidator } from "@/lib/sqlValidator";

/**
 * Groq-powered natural-language -> SQL engine.
 *
 * Groq is OpenAI-API compatible, so we reuse LangChain's ChatOpenAI client
 * pointed at Groq's base URL. Every generated statement is passed through the
 * AST-based SqlValidator before it is ever returned (SELECT-only, row-capped).
 */
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export class NlToSqlEngine {
  private llm: ChatOpenAI | null;
  private validator: SqlValidator;

  constructor() {
    this.validator = new SqlValidator();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.llm = null;
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        model: DEFAULT_MODEL,
        temperature: 0,
        maxTokens: 512,
        apiKey,
        configuration: { baseURL: GROQ_BASE_URL },
      });
    } catch (e) {
      console.warn("NlToSqlEngine: failed to initialise Groq client", e);
      this.llm = null;
    }
  }

  public get isLive(): boolean {
    return this.llm !== null;
  }

  public async generateSql(question: string, schemaContext: string): Promise<string> {
    if (!this.llm) {
      throw new Error("Cannot generate SQL: GROQ_API_KEY is missing.");
    }

    const promptText = `Given the following database schema:
{schemaContext}

Write a single, accurate PostgreSQL SELECT query to answer the user's question:
"{question}"

Return ONLY the raw SQL query, with no markdown fences or explanations.`;

    const prompt = PromptTemplate.fromTemplate(promptText);
    const chain = prompt.pipe(this.llm);

    const response = await chain.invoke({ schemaContext, question });

    let rawSql = response.content.toString().trim();
    // Strip markdown fences if the model added them anyway.
    rawSql = rawSql.replace(/```sql/gi, "").replace(/```/g, "").trim();

    // Safety validation is mandatory (SELECT-only, enforced LIMIT).
    return this.validator.validateQuery(rawSql);
  }
}
