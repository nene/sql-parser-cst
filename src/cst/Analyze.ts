import { BaseNode, Keyword } from "./Base";
import { ListExpr, ParenExpr } from "./Expr";
import { BooleanLiteral, NumberLiteral } from "./Literal";
import { PostgresqlBooleanOnOffLiteral } from "./Node";
import { TableWithColumns } from "./Select";

export type AllAnalyzeNodes = AnalyzeStmt | AnalyzeOption;

// ANALYZE
export interface AnalyzeStmt extends BaseNode {
  type: "analyze_stmt";
  analyzeKw: Keyword<"ANALYZE">;
  verboseKw?: Keyword<"VERBOSE">;
  options?: ParenExpr<ListExpr<AnalyzeOption>>; // PostgreSQL
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<TableWithColumns>;
}

export interface AnalyzeOption extends BaseNode {
  type: "analyze_option";
  name: Keyword<"VERBOSE" | "SKIP_LOCKED" | "BUFFER_USAGE_LIMIT">;
  value?: BooleanLiteral | PostgresqlBooleanOnOffLiteral | NumberLiteral;
}
