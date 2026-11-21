import { BaseNode, Keyword } from "./Base";
import { Statement } from "./Statement";

// EXPLAIN
export interface ExplainStmt extends BaseNode {
  type: "explain_stmt";
  explainKw: Keyword<"EXPLAIN" | "DESCRIBE" | "DESC">; // DESCRIBE & DESC are MySQL-specific
  analyzeKw?: Keyword<"ANALYZE">;
  verboseKw?: Keyword<"VERBOSE">; // PostgreSQL
  queryPlanKw?: [Keyword<"QUERY">, Keyword<"PLAN">]; // SQLite
  statement: Statement;
}
