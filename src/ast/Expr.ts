import { AllColumns, BaseNode } from "./Base";
import { SubSelect } from "./Select";

export type AllExprNodes = Expr;

export type Expr =
  | BinaryExpr
  | FuncCall
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | Identifier;

export interface BinaryExpr extends BaseNode {
  type: "binary_expr";
  left: Expr;
  operator: string;
  right: Expr;
}

export interface FuncCall extends BaseNode {
  type: "func_call";
  name: Identifier;
  args?: (Expr | AllColumns | SubSelect)[];
  distinct?: boolean;
}

export type EntityName = Identifier;

export interface Identifier extends BaseNode {
  type: "identifier";
  name: string;
}

export interface StringLiteral extends BaseNode {
  type: "string_literal";
  value: string;
}

export interface NumberLiteral extends BaseNode {
  type: "number_literal";
  value: number;
}

export interface BooleanLiteral extends BaseNode {
  type: "boolean_literal";
  value: boolean;
}
