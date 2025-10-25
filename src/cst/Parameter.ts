import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr } from "./Expr";
import { Default } from "./Insert";
import { Literal } from "./Literal";

export type AllParameterNodes =
  | AllParameterStatements
  | SetParameterClause
  | SetParameterFromCurrentClause
  | ResetParameterClause
  | ResetAllParametersClause;

export type AllParameterStatements =
  | SetParameterStmt
  | SetTimeZoneParameterStmt
  | ResetParameterStmt
  | ResetAllParametersStmt
  | ShowParameterStmt
  | ShowAllParametersStmt;

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

export interface ShowParameterStmt extends BaseNode {
  type: "show_parameter_stmt";
  showKw: Keyword<"SHOW">;
  name: Identifier;
}

export interface ShowAllParametersStmt extends BaseNode {
  type: "show_all_parameters_stmt";
  showAllKw: [Keyword<"SHOW">, Keyword<"ALL">];
}

export interface SetParameterClause extends BaseNode {
  type: "set_parameter_clause";
  setKw: Keyword<"SET">;
  name: Identifier;
  operator: Keyword<"TO"> | "=";
  value: ListExpr<Literal | Identifier | Default>;
}

export interface SetParameterFromCurrentClause extends BaseNode {
  type: "set_parameter_from_current_clause";
  setKw: Keyword<"SET">;
  name: Identifier;
  fromCurrentKw: [Keyword<"FROM">, Keyword<"CURRENT">];
}

export interface ResetParameterClause extends BaseNode {
  type: "reset_parameter_clause";
  resetKw: Keyword<"RESET">;
  name: Identifier;
}

export interface ResetAllParametersClause extends BaseNode {
  type: "reset_all_parameters_clause";
  resetAllKw: [Keyword<"RESET">, Keyword<"ALL">];
}
