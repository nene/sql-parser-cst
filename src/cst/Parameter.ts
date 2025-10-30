import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr } from "./Expr";
import { Default } from "./Insert";
import { Literal } from "./Literal";

export type AllParameterNodes =
  | AllParameterStatements
  | SetParameterClause
  | SetParameterFromCurrentClause
  | ResetParameterClause
  | AllParameters
  | LocalParameterValue
  | BooleanOnOffLiteral;

export type AllParameterStatements =
  | SetParameterStmt
  | SetTimeZoneParameterStmt
  | ResetParameterStmt
  | ShowParameterStmt;

// These are all PostgreSQL specific
export interface SetParameterStmt extends BaseNode {
  type: "set_parameter_stmt";
  setKw: Keyword<"SET">;
  modifierKw?: Keyword<"LOCAL" | "SESSION">;
  name: Identifier;
  operator: Keyword<"TO"> | "=";
  value: ListExpr<Literal | BooleanOnOffLiteral | Identifier | Default>;
}

export interface SetTimeZoneParameterStmt extends BaseNode {
  type: "set_time_zone_parameter_stmt";
  setKw: Keyword<"SET">;
  modifierKw?: Keyword<"LOCAL" | "SESSION">;
  timeZoneKw: [Keyword<"TIME">, Keyword<"ZONE">];
  value: Default | LocalParameterValue | Expr;
}

export interface ResetParameterStmt extends BaseNode {
  type: "reset_parameter_stmt";
  resetKw: Keyword<"RESET">;
  name: Identifier | AllParameters;
}

export interface ShowParameterStmt extends BaseNode {
  type: "show_parameter_stmt";
  showKw: Keyword<"SHOW">;
  name: Identifier | AllParameters;
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
  name: Identifier | AllParameters;
}

export interface AllParameters extends BaseNode {
  type: "all_parameters";
  allKw: Keyword<"ALL">;
}

export interface LocalParameterValue extends BaseNode {
  type: "local_parameter_value";
  localKw: Keyword<"LOCAL">;
}

export interface BooleanOnOffLiteral extends BaseNode {
  type: "boolean_on_off_literal";
  valueKw: Keyword<"ON" | "OFF">;
  value: boolean;
}
