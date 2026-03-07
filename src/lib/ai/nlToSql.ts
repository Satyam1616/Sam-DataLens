import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SqlValidator } from "@/lib/sqlValidator";

export class NlToSqlEngine {
  private llm: ChatOpenAI;
  private validator: SqlValidator;

  constructor() {
    this.validator = new SqlValidator();
    
    // Will throw if OPENAI_API_KEY is not set, simulating production failure behavior
    // For scaffolding, we wrap it in a try-catch to allow the app to compile
    try {
      this.llm = new ChatOpenAI({ 
        modelName: "gpt-4o-mini",
        temperature: 0,
      });
    } catch (e) {
      console.warn("NlToSqlEngine initialized without OPENAI_API_KEY");
      this.llm = null as any;
    }
  }

  public async generateSql(question: string, schemaContext: string): Promise<string> {
    if (!this.llm) {
        throw new Error("Cannot generate SQL: OpenAI API Key is missing.");
    }

    const promptText = `
Given the following database schema:
{schemaContext}

Write a synthetic, accurate PostgreSQL query to answer the user's question:
"{question}"

Return ONLY the raw SQL query, with no markdown formatting or explanations.
`;
    
    const prompt = PromptTemplate.fromTemplate(promptText);
    const chain = prompt.pipe(this.llm);
    
    // 1. LLM Generation
    const response = await chain.invoke({
        schemaContext,
        question
    });
    
    let rawSql = response.content.toString().trim();
    // Strip markdown formatting if the LLM hallucinated it
    rawSql = rawSql.replace(/```sql/g, '').replace(/```/g, '');

    // 2. Safety Validation (Critical)
    const safeSql = this.validator.validateQuery(rawSql);
    
    return safeSql;
  }
}
