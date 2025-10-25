import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr } from "./Expr";
import { Default } from "./Insert";
import { Literal } from "./Literal";

export type AllSetParameterNodes = AllSetParameterStatements;

export type AllSetParameterStatements =
  | SetParameterStmt
  | SetTimeZoneParameterStmt
  | ResetParameterStmt
  | ResetAllParametersStmt;

// These are all PostgreSQL specific
export interface SetParameterStmt extends BaseNode {
  type: "set_parameter_stmt";
  setKw: Keyword<"SET">;
  modifierKw?: Keyword<"LOCAL" | "SESSION">;
  name: Identifier;
  operator: Keyword<"TO"> | "=";
  value: ListExpr<Literal | Identifier | Default>;
}

export interface SetTimeZoneParameterStmt extends BaseNode {
  type: "set_time_zone_parameter_stmt";
  setKw: Keyword<"SET">;
  modifierKw?: Keyword<"LOCAL" | "SESSION">;
  timeZoneKw: [Keyword<"TIME">, Keyword<"ZONE">];
  value: Default | Keyword<"LOCAL"> | Expr;
}

export interface ResetParameterStmt extends BaseNode {
  type: "reset_parameter_stmt";
  resetKw: Keyword<"RESET">;
  name: Identifier;
}

export interface ResetAllParametersStmt extends BaseNode {
  type: "reset_all_parameters_stmt";
  resetAllKw: [Keyword<"RESET">, Keyword<"ALL">];
}
