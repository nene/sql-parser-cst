import { BaseNode, Keyword } from "./Base";
import { ListExpr } from "./Expr";
import { RelationExpr } from "./Select";

// ANALYZE
export interface AnalyzeStmt extends BaseNode {
  type: "analyze_stmt";
  analyzeKw: Keyword<"ANALYZE">;
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<RelationExpr>;
}
