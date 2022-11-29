import { BaseNode, Keyword } from "./Base";
import { Expr, FuncCall, Identifier, ParenExpr, Table } from "./Expr";
import { Literal, StringLiteral } from "./Literal";

export type AllSqliteNodes = SqliteStmt | PragmaAssignment | PragmaFuncCall;

// SQLite-specific statements
export type SqliteStmt =
  | AttachDatabaseStmt
  | DetachDatabaseStmt
  | VacuumStmt
  | ReindexStmt
  | PragmaStmt
  | CreateVirtualTableStmt;

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

export interface ReindexStmt extends BaseNode {
  type: "reindex_stmt";
  reindexKw: Keyword<"REINDEX">;
  table?: Table;
}

export interface PragmaStmt extends BaseNode {
  type: "pragma_stmt";
  pragmaKw: Keyword<"PRAGMA">;
  pragma: Table | PragmaAssignment | PragmaFuncCall;
}

export interface PragmaAssignment extends BaseNode {
  type: "pragma_assignment";
  name: Table;
  value: Literal | Keyword;
}

export interface PragmaFuncCall extends BaseNode {
  type: "pragma_func_call";
  name: Table;
  args: ParenExpr<Literal | Keyword>;
}

export interface CreateVirtualTableStmt extends BaseNode {
  type: "create_virtual_table_stmt";
  createVirtualTableKw: [
    Keyword<"CREATE">,
    Keyword<"VIRTUAL">,
    Keyword<"TABLE">
  ];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  table: Table;
  usingKw: Keyword<"USING">;
  module: FuncCall;
}
