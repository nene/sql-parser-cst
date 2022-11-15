import { BaseNode, Keyword } from "./Base";

export type Literal =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NullLiteral
  | DateTimeLiteral;

export interface StringLiteral extends BaseNode {
  type: "string";
  text: string;
}

export interface NumberLiteral extends BaseNode {
  type: "number";
  text: string;
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
