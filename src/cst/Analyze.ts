import { BaseNode, Keyword } from "./Base";
import { ListExpr, EntityName } from "./Expr";

// ANALYZE
export interface AnalyzeStmt extends BaseNode {
  type: "analyze_stmt";
  analyzeKw: Keyword<"ANALYZE">;
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<EntityName>;
}
