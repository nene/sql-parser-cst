import { BaseNode, Keyword } from "./Base";
import { ListExpr, ParenExpr } from "./Expr";
import { PostgresqlOptionElement } from "./Node";
import { TableWithColumns } from "./Select";

export type AllAnalyzeNodes = AnalyzeStmt;

// ANALYZE
export interface AnalyzeStmt extends BaseNode {
  type: "analyze_stmt";
  analyzeKw: Keyword<"ANALYZE">;
  verboseKw?: Keyword<"VERBOSE">;
  options?: ParenExpr<ListExpr<PostgresqlOptionElement>>; // PostgreSQL
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<TableWithColumns>;
}
