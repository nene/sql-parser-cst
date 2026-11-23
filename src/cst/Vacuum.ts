import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr, ParenExpr } from "./Expr";
import { StringLiteral } from "./Literal";
import { PostgresqlOptionElement } from "./Node";
import { TableWithColumns } from "./Select";

export type AllVacuumNodes = AllVacuumStatements | VacuumIntoClause;

export type AllVacuumStatements = VacuumDatabaseStmt | VacuumTableStmt;

// SQLite
export interface VacuumDatabaseStmt extends BaseNode {
  type: "vacuum_database_stmt";
  vacuumKw: Keyword<"VACUUM">;
  schema?: Identifier;
  into?: VacuumIntoClause;
}

// PostgreSQL
export interface VacuumTableStmt extends BaseNode {
  type: "vacuum_table_stmt";
  vacuumKw: Keyword<"VACUUM">;
  options?: ParenExpr<ListExpr<PostgresqlOptionElement>>;
  tables?: ListExpr<TableWithColumns>;
}

// SQLite
export interface VacuumIntoClause extends BaseNode {
  type: "vacuum_into_clause";
  intoKw: Keyword<"INTO">;
  file: StringLiteral;
}
