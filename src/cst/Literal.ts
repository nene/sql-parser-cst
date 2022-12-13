import { BaseNode, Keyword } from "./Base";

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

export interface DatetimeLiteral extends BaseNode {
  type: "datetime_literal";
  datetimeKw: Keyword<"DATETIME">;
  string: StringLiteral;
}

export interface TimeLiteral extends BaseNode {
  type: "time_literal";
  timeKw: Keyword<"TIME">;
  string: StringLiteral;
}

export interface DateLiteral extends BaseNode {
  type: "date_literal";
  dateKw: Keyword<"DATE">;
  string: StringLiteral;
}

export interface TimestampLiteral extends BaseNode {
  type: "timestamp_literal";
  timestampKw: Keyword<"TIMESTAMP">;
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
