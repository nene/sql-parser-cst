import { BaseNode, Keyword } from "./Base";
import { ListExpr, ParenExpr } from "./Expr";
import { PostgresqlOptionElement } from "./Node";
import { Statement } from "./Statement";

export type AllExplainNodes = ExplainStmt;

// EXPLAIN
export interface ExplainStmt extends BaseNode {
  type: "explain_stmt";
  explainKw: Keyword<"EXPLAIN" | "DESCRIBE" | "DESC">; // DESCRIBE & DESC are MySQL-specific
  analyzeKw?: Keyword<"ANALYZE">;
  verboseKw?: Keyword<"VERBOSE">; // PostgreSQL
  queryPlanKw?: [Keyword<"QUERY">, Keyword<"PLAN">]; // SQLite
  options: ParenExpr<ListExpr<PostgresqlOptionElement>>; // PostgreSQL
  statement: Statement;
}
