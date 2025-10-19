import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { EntityName, Expr, Identifier, ListExpr } from "./Expr";

export type AllPreparedStatementNodes =
  | AllPreparedStatements
  | ExecuteIntoClause
  | ExecuteUsingClause;

export type AllPreparedStatements = ExecuteStmt | ExecuteImmediateStmt;

// EXECUTE
export interface ExecuteStmt extends BaseNode {
  type: "execute_stmt";
  executeKw: Keyword<"EXECUTE">;
  name: EntityName;
}

export interface ExecuteImmediateStmt extends BaseNode {
  type: "execute_immediate_stmt";
  executeKw: Keyword<"EXECUTE">;
  immediateKw: Keyword<"IMMEDIATE">;
  expr: Expr;
  into?: ExecuteIntoClause;
  using?: ExecuteUsingClause;
}

export interface ExecuteIntoClause extends BaseNode {
  type: "execute_into_clause";
  intoKw: Keyword<"INTO">;
  variables: ListExpr<Identifier>;
}

export interface ExecuteUsingClause extends BaseNode {
  type: "execute_using_clause";
  usingKw: Keyword<"USING">;
  values: ListExpr<Expr | Alias<Expr>>;
}
