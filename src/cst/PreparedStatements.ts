import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { EntityName, Expr, Identifier, ListExpr, ParenExpr } from "./Expr";

export type AllPreparedStatementNodes =
  | AllPreparedStatements
  | PrepareFromClause
  | ExecuteIntoClause
  | ExecuteUsingClause;

export type AllPreparedStatements =
  | PrepareStmt
  | ExecuteStmt
  | ExecuteImmediateStmt;

// PREPARE in MySQL, MariaDB
export interface PrepareStmt extends BaseNode {
  type: "prepare_stmt";
  prepareKw: Keyword<"PREPARE">;
  name: EntityName;
  source: PrepareFromClause;
}

export interface PrepareFromClause extends BaseNode {
  type: "prepare_from_clause";
  fromKw: Keyword<"FROM">;
  expr: Expr;
}

// EXECUTE in MySQL, MariaDB, PostgreSQL
export interface ExecuteStmt extends BaseNode {
  type: "execute_stmt";
  executeKw: Keyword<"EXECUTE">;
  name: EntityName;
  args?: ExecuteUsingClause | ParenExpr<ListExpr<Expr>>;
}

// EXECUTE IMMEDIATE in BigQuery
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
