import { AllColumns, BaseNode } from "./Base";
import { DataType } from "./DataType";
import { Literal } from "./Literal";
import { SubSelect, WindowDefinition } from "./Select";

export type AllExprNodes = Expr;

export type Expr =
  | BinaryExpr
  | PrefixOpExpr
  | PostfixOpExpr
  | BetweenExpr
  | FuncCall
  | CastExpr
  | Literal
  | Identifier;

export interface BinaryExpr extends BaseNode {
  type: "binary_expr";
  left: Expr;
  operator: string;
  right: Expr;
}

export interface PrefixOpExpr extends BaseNode {
  type: "prefix_op_expr";
  operator: "-" | "~" | "!" | "not" | "exists";
  expr: Expr;
}

export interface PostfixOpExpr extends BaseNode {
  type: "postfix_op_expr";
  operator:
    | "isnull" // SQLite
    | "notnull" // SQLite
    | "not null" // SQLite
    | "is unknown" // BigQuery, MySQL
    | "is not unknown"; // BigQuery, MySQL
  expr: Expr;
}

export interface BetweenExpr extends BaseNode {
  type: "between_expr";
  left: Expr;
  operator: "between" | "not between";
  begin: Expr;
  end: Expr;
}

export interface FuncCall extends BaseNode {
  type: "func_call";
  name: Identifier;
  args?: (Expr | AllColumns | SubSelect)[];
  distinct?: boolean;
  over?: Identifier | WindowDefinition;
}

export interface CastExpr extends BaseNode {
  type: "cast_expr";
  expr: Expr;
  dataType: DataType;
}

export type EntityName = Identifier;

export interface Identifier extends BaseNode {
  type: "identifier";
  name: string;
}
