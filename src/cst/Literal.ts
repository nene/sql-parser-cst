import { BaseNode, Keyword } from "./Base";

export type Literal =
  | StringLiteral
  | NumberLiteral
  | BlobLiteral
  | BooleanLiteral
  | NullLiteral
  | DateTimeLiteral
  | JsonLiteral
  | NumericLiteral
  | BignumericLiteral;

export interface StringLiteral extends BaseNode {
  type: "string_literal";
  text: string;
  value: string;
}

export interface NumberLiteral extends BaseNode {
  type: "number_literal";
  text: string;
  value: number;
}

export interface BlobLiteral extends BaseNode {
  type: "blob_literal";
  text: string;
  value: number[];
}

export interface BooleanLiteral extends BaseNode {
  type: "boolean_literal";
  text: string;
  value: boolean;
}

export interface NullLiteral extends BaseNode {
  type: "null_literal";
  text: string;
  value: null;
}

export interface DateTimeLiteral extends BaseNode {
  type: "datetime_literal";
  kw: Keyword<"TIME" | "DATE" | "TIMESTAMP" | "DATETIME">;
  string: StringLiteral;
}

export interface JsonLiteral extends BaseNode {
  type: "json_literal";
  jsonKw: Keyword<"JSON">;
  string: StringLiteral;
}

export interface NumericLiteral extends BaseNode {
  type: "numeric_literal";
  numericKw: Keyword<"NUMERIC">;
  string: StringLiteral;
}

export interface BignumericLiteral extends BaseNode {
  type: "bignumeric_literal";
  bignumericKw: Keyword<"BIGNUMERIC">;
  string: StringLiteral;
}
