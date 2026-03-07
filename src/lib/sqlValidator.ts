import { Parser } from 'node-sql-parser';

export class SqlValidator {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Validates that an LLM-generated SQL query is safe to execute.
   * Enforces SELECT-only permissions and row limits.
   */
  public validateQuery(sql: string, maxLimit: number = 100): string {
    try {
      // 1. Parse the AST
      let ast = this.parser.astify(sql);
      
      // Handle multiple statements (we only want one)
      if (Array.isArray(ast)) {
        if (ast.length > 1) {
          throw new Error("Multiple SQL statements detected. Only single queries are allowed.");
        }
        ast = ast[0];
      }

      // 2. Ensure it's a SELECT statement
      if (ast.type !== 'select') {
        throw new Error(`Unsafe query type detected: ${ast.type}. Only SELECT statements are allowed.`);
      }

      // 3. Enforce Row Limits
      const selectAst = ast as any;
      if (!selectAst.limit) {
        // Automatically inject LIMIT if missing
        selectAst.limit = {
            seperator: "",
            value: [
                { type: "number", value: maxLimit }
            ]
        };
      } else {
        // Cap the limit if it exceeds our max
        const requestedLimit = selectAst.limit.value[0].value;
        if (requestedLimit > maxLimit) {
            selectAst.limit.value[0].value = maxLimit;
        }
      }

      // 4. Return the safe SQL string
      const safeSql = this.parser.sqlify(ast as any);
      return safeSql;
      
    } catch (error: any) {
      console.error("[SqlValidator] Security Block:", error.message);
      throw new Error(`SQL Validation Failed: ${error.message}`);
    }
  }
}
