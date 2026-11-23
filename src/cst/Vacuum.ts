import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";
import { StringLiteral } from "./Literal";
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
  tables?: ListExpr<TableWithColumns>;
}

// SQLite
export interface VacuumIntoClause extends BaseNode {
  type: "vacuum_into_clause";
  intoKw: Keyword<"INTO">;
  file: StringLiteral;
}
