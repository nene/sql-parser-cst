import { BaseNode, Keyword } from "./Base";
import { ListExpr, ParenExpr } from "./Expr";
import { BooleanLiteral, NumberLiteral } from "./Literal";
import { PostgresqlBooleanOnOffLiteral } from "./Node";
import { Statement } from "./Statement";

export type AllExplainNodes = ExplainStmt | ExplainOption;

// EXPLAIN
export interface ExplainStmt extends BaseNode {
  type: "explain_stmt";
  explainKw: Keyword<"EXPLAIN" | "DESCRIBE" | "DESC">; // DESCRIBE & DESC are MySQL-specific
  analyzeKw?: Keyword<"ANALYZE">;
  verboseKw?: Keyword<"VERBOSE">; // PostgreSQL
  queryPlanKw?: [Keyword<"QUERY">, Keyword<"PLAN">]; // SQLite
  options: ParenExpr<ListExpr<ExplainOption>>; // PostgreSQL
  statement: Statement;
}

export interface ExplainOption extends BaseNode {
  type: "explain_option";
  name: Keyword<
    | "ANALYZE"
    | "VERBOSE"
    | "COSTS"
    | "SETTINGS"
    | "GENERIC_PLAN"
    | "BUFFERS"
    | "SERIALIZE"
    | "WAL"
    | "TIMING"
    | "SUMMARY"
    | "MEMORY"
    | "IO"
    | "FORMAT"
  >;
  value?:
    | Keyword<"NONE" | "TEXT" | "BINARY" | "XML" | "JSON" | "YAML">
    | BooleanLiteral
    | PostgresqlBooleanOnOffLiteral
    | NumberLiteral;
}
