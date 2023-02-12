import { BaseNode } from "./Base";

export type AllExprNodes = Expr;

export type Expr =
  | BinaryExpr
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | Identifier;

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

export interface BinaryExpr extends BaseNode {
  type: "binary_expr";
  left: Expr;
  operator: string;
  right: Expr;
}
