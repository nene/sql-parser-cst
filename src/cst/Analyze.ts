import { BaseNode, Keyword } from "./Base";
import { ListExpr } from "./Expr";
import { TableWithColumns } from "./Select";

// ANALYZE
export interface AnalyzeStmt extends BaseNode {
  type: "analyze_stmt";
  analyzeKw: Keyword<"ANALYZE">;
  verboseKw?: Keyword<"VERBOSE">;
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<TableWithColumns>;
}
