import { BaseNode, Keyword } from "./Base";
import { Identifier } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllVacuumNodes = AllVacuumStatements | VacuumIntoClause;

export type AllVacuumStatements = VacuumDatabaseStmt;

// SQLite
export interface VacuumDatabaseStmt extends BaseNode {
  type: "vacuum_database_stmt";
  vacuumKw: Keyword<"VACUUM">;
  schema?: Identifier;
  into?: VacuumIntoClause;
}

// SQLite
export interface VacuumIntoClause extends BaseNode {
  type: "vacuum_into_clause";
  intoKw: Keyword<"INTO">;
  file: StringLiteral;
}
