import { BaseNode, Keyword } from "./Base";
import { Identifier } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllVacuumNodes = VacuumStmt;

export type AllVacuumStatements = VacuumStmt;

// SQLite
export interface VacuumStmt extends BaseNode {
  type: "vacuum_stmt";
  vacuumKw: Keyword<"VACUUM">;
  schema?: Identifier;
  intoKw?: Keyword<"INTO">;
  file?: StringLiteral;
}
