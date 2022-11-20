import { BaseNode, Keyword } from "./Base";
import { DataType } from "./CreateTable";
import { Expr, ListExpr, ParenExpr } from "./Expr";

export type Literal =
  | StringLiteral
  | NumberLiteral
  | BlobLiteral
  | BooleanLiteral
  | NullLiteral
  | DateTimeLiteral
  | TypedStructLiteral
  | TypedArrayLiteral
  | ArrayLiteral;

export interface StringLiteral extends BaseNode {
  type: "string";
  text: string;
  value: string;
}

export interface NumberLiteral extends BaseNode {
  type: "number";
  text: string;
  value: number;
}

export interface BlobLiteral extends BaseNode {
  type: "blob";
  text: string;
  value: number[];
}

export interface BooleanLiteral extends BaseNode {
  type: "boolean";
  text: string;
  value: boolean;
}

export interface NullLiteral extends BaseNode {
  type: "null";
  text: string;
  value: null;
}

export interface DateTimeLiteral extends BaseNode {
  type: "datetime";
  kw: Keyword<"TIME" | "DATE" | "TIMESTAMP" | "DATETIME">;
  string: StringLiteral;
}

export interface TypedStructLiteral extends BaseNode {
  type: "typed_struct";
  dataType: DataType;
  struct: ParenExpr<ListExpr<Expr>>;
}

export interface TypedArrayLiteral extends BaseNode {
  type: "typed_array";
  dataType: DataType;
  array: ArrayLiteral;
}

export interface ArrayLiteral extends BaseNode {
  type: "array";
  expr: ListExpr<Expr>;
}
