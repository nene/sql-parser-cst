import { BaseNode, Keyword } from "../Base";
import { Expr, Identifier, ParenExpr, EntityName } from "../Expr";
import { Literal, StringLiteral } from "../Literal";

export type AllSqliteNodes =
  | AllSqliteStatements
  | PragmaAssignment
  | PragmaFuncCall;

// SQLite-specific statements
export type AllSqliteStatements =
  | AttachDatabaseStmt
  | DetachDatabaseStmt
  | VacuumStmt
  | PragmaStmt;

export interface AttachDatabaseStmt extends BaseNode {
  type: "attach_database_stmt";
  attachKw: Keyword<"ATTACH">;
  databaseKw?: Keyword<"DATABASE">;
  file: Expr;
  asKw: Keyword<"AS">;
  schema: Identifier;
}

export interface DetachDatabaseStmt extends BaseNode {
  type: "detach_database_stmt";
  detachKw: Keyword<"DETACH">;
  databaseKw?: Keyword<"DATABASE">;
  schema: Identifier;
}

export interface VacuumStmt extends BaseNode {
  type: "vacuum_stmt";
  vacuumKw: Keyword<"VACUUM">;
  schema?: Identifier;
  intoKw?: Keyword<"INTO">;
  file?: StringLiteral;
}

export interface PragmaStmt extends BaseNode {
  type: "pragma_stmt";
  pragmaKw: Keyword<"PRAGMA">;
  pragma: EntityName | PragmaAssignment | PragmaFuncCall;
}

export interface PragmaAssignment extends BaseNode {
  type: "pragma_assignment";
  name: EntityName;
  value: Literal | Keyword;
}

export interface PragmaFuncCall extends BaseNode {
  type: "pragma_func_call";
  name: EntityName;
  args: ParenExpr<Literal | Keyword>;
}
