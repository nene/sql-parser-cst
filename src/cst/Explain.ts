import { BaseNode, Keyword } from "./Base";
import { ListExpr, ParenExpr } from "./Expr";
import { BooleanLiteral, NumberLiteral, StringLiteral } from "./Literal";
import { Statement } from "./Statement";

export type AllExplainNodes = ExplainStmt | ExplainOption;

// EXPLAIN
export interface ExplainStmt extends BaseNode {
  type: "explain_stmt";
  explainKw: Keyword<"EXPLAIN" | "DESCRIBE" | "DESC">;
  analyzeKw?: Keyword<"ANALYZE">;
  verboseKw?: Keyword<"VERBOSE">; // PostgreSQL
  options?: ParenExpr<ListExpr<ExplainOption>>; // PostgreSQL
  queryPlanKw?: [Keyword<"QUERY">, Keyword<"PLAN">];
  statement: Statement;
}

// PostgreSQL
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
    | "FORMAT"
  >;
  value?:
    | BooleanLiteral
    | NumberLiteral
    | StringLiteral
    | Keyword<
        "ON" | "OFF" | "NONE" | "TEXT" | "BINARY" | "XML" | "JSON" | "YAML"
      >;
}
