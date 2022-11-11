import { BaseNode, Keyword } from "./Base";
import { Statement } from "./Statement";

// EXPLAIN
export interface ExplainStmt extends BaseNode {
  type: "explain_stmt";
  explainKw: Keyword<"EXPLAIN" | "DESCRIBE" | "DESC">;
  analyzeKw?: Keyword<"ANALYZE">;
  queryPlanKw?: [Keyword<"QUERY">, Keyword<"PLAN">];
  statement: Statement;
}
