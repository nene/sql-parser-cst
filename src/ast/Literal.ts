import { BaseNode } from "./Base";

export type Literal =
  | StringLiteral
  | NumberLiteral
  | BlobLiteral
  | BooleanLiteral
  | NullLiteral
  | DatetimeLiteral
  | TimeLiteral
  | DateLiteral
  | TimestampLiteral
  | JsonLiteral
  | NumericLiteral
  | BignumericLiteral;

export interface StringLiteral extends BaseNode {
  type: "string_literal";
  value: string;
}

export interface NumberLiteral extends BaseNode {
  type: "number_literal";
  value: number;
}

export interface BlobLiteral extends BaseNode {
  type: "blob_literal";
  value: number[];
}

export interface BooleanLiteral extends BaseNode {
  type: "boolean_literal";
  value: boolean;
}

export interface NullLiteral extends BaseNode {
  type: "null_literal";
  value: null;
}

export interface DatetimeLiteral extends BaseNode {
  type: "datetime_literal";
  value: string;
}

export interface TimeLiteral extends BaseNode {
  type: "time_literal";
  value: string;
}

export interface DateLiteral extends BaseNode {
  type: "date_literal";
  value: string;
}

export interface TimestampLiteral extends BaseNode {
  type: "timestamp_literal";
  value: string;
}

export interface JsonLiteral extends BaseNode {
  type: "json_literal";
  value: string;
}

export interface NumericLiteral extends BaseNode {
  type: "numeric_literal";
  value: string;
}

export interface BignumericLiteral extends BaseNode {
  type: "bignumeric_literal";
  value: string;
}
