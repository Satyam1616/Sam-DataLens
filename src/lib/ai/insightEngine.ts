import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export class InsightGenerator {
  private llm: ChatOpenAI;

  constructor() {
    try {
      this.llm = new ChatOpenAI({ 
        modelName: "gpt-4o-mini",
        temperature: 0.2,
      });
    } catch (e) {
      console.warn("InsightGenerator initialized without OPENAI_API_KEY");
      this.llm = null as any;
    }
  }

  public async generateInsight(question: string, queryResults: any[]): Promise<string> {
    if (!this.llm) {
        throw new Error("Cannot generate insight: OpenAI API Key is missing.");
    }

    const promptText = `
You are an expert Data Analyst and Business Intelligence tool.
A user asked the following question:
"{question}"

The database returned the following data (in JSON format):
{queryResults}

Analyze the data and provide:
1. A concise, one-paragraph summary of the directly relevant facts.
2. A single, actionable business recommendation based on this data.

Do not mention the SQL query itself or the raw JSON. Speak directly to the business user.
`;
    
    const prompt = PromptTemplate.fromTemplate(promptText);
    const chain = prompt.pipe(this.llm);
    
    const response = await chain.invoke({
        question,
        queryResults: JSON.stringify(queryResults).substring(0, 3000) // Truncate to save tokens
    });
    
    return response.content.toString();
  }
}
