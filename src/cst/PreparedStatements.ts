import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { EntityName, Expr, Identifier, ListExpr, ParenExpr } from "./Expr";
import { AsClause } from "./ProcClause";
import { Statement } from "./Statement";

export type AllPreparedStatementNodes =
  | AllPreparedStatements
  | PrepareFromClause
  | DeallocateAll
  | ExecuteIntoClause
  | ExecuteUsingClause;

export type AllPreparedStatements =
  | PrepareStmt
  | DeallocateStmt
  | ExecuteStmt
  | ExecuteImmediateStmt;

// PREPARE in MySQL, MariaDB
export interface PrepareStmt extends BaseNode {
  type: "prepare_stmt";
  prepareKw: Keyword<"PREPARE">;
  name: EntityName;
  params?: ParenExpr<ListExpr<DataType>>;
  source: PrepareFromClause | AsClause<Statement>;
}

export interface PrepareFromClause extends BaseNode {
  type: "prepare_from_clause";
  fromKw: Keyword<"FROM">;
  expr: Expr;
}

// DEALLOCATE PREPARE in MySQL, MariaDB, PostgreSQL
export interface DeallocateStmt extends BaseNode {
  type: "deallocate_stmt";
  deallocateKw:
    | Keyword<"DEALLOCATE">
    | [Keyword<"DEALLOCATE">, Keyword<"PREPARE">]
    | [Keyword<"DROP">, Keyword<"PREPARE">];
  name: EntityName | DeallocateAll;
}

export interface DeallocateAll extends BaseNode {
  type: "deallocate_all";
  allKw: Keyword<"ALL">;
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
