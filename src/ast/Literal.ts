import { BaseNode } from "./Base";

export type Literal = StringLiteral | NumberLiteral | BooleanLiteral;

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
