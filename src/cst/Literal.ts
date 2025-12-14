import { BaseNode, Keyword } from "./Base";
import { ParenExpr } from "./Expr";

export type AllLiteralNodes = Literal | IntervalUnit | IntervalUnitRange;

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
  | JsonbLiteral
  | NumericLiteral
  | BignumericLiteral
  | IntervalLiteral;

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
  valueKw: Keyword<"TRUE" | "FALSE">;
  value: boolean;
}

export interface NullLiteral extends BaseNode {
  type: "null_literal";
  nullKw: Keyword<"NULL">;
  value: null;
}

// SQLite, MySQL, MariaDB, BigQuery
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

// PostgreSQL, BigQuery
export interface JsonLiteral extends BaseNode {
  type: "json_literal";
  jsonKw: Keyword<"JSON">;
  string: StringLiteral;
}

// PostgreSQL
export interface JsonbLiteral extends BaseNode {
  type: "jsonb_literal";
  jsonbKw: Keyword<"JSONB">;
  string: StringLiteral;
}

// BigQuery
export interface NumericLiteral extends BaseNode {
  type: "numeric_literal";
  numericKw: Keyword<"NUMERIC">;
  string: StringLiteral;
}

// BigQuery
export interface BignumericLiteral extends BaseNode {
  type: "bignumeric_literal";
  bignumericKw: Keyword<"BIGNUMERIC">;
  string: StringLiteral;
}

// PostgreSQL, BigQuery, MySQL, MariaDB
export interface IntervalLiteral extends BaseNode {
  type: "interval_literal";
  intervalKw: Keyword<"INTERVAL">;
  precision?: ParenExpr<NumberLiteral>;
  value: StringLiteral | NumberLiteral;
  unit?: IntervalUnit | IntervalUnitRange;
}

export interface IntervalUnitRange extends BaseNode {
  type: "interval_unit_range";
  fromUnit: IntervalUnit;
  toKw: Keyword<"TO">;
  toUnit: IntervalUnit;
}

export interface IntervalUnit extends BaseNode {
  type: "interval_unit";
  unitKw: Keyword<
    | "CENTURY"
    | "DAY_HOUR"
    | "DAY_MICROSECOND"
    | "DAY_MINUTE"
    | "DAY_SECOND"
    | "DAY"
    | "DECADE"
    | "DOW"
    | "DOY"
    | "EPOCH"
    | "HOUR_MICROSECOND"
    | "HOUR_MINUTE"
    | "HOUR_SECOND"
    | "HOUR"
    | "ISODOW"
    | "ISOYEAR"
    | "JULIAN"
    | "MICROSECOND"
    | "MICROSECONDS"
    | "MILLENNIUM"
    | "MILLISECONDS"
    | "MINUTE_MICROSECOND"
    | "MINUTE_SECOND"
    | "MINUTE"
    | "MONTH"
    | "QUARTER"
    | "SECOND_MICROSECOND"
    | "SECOND"
    | "TIMEZONE_HOUR"
    | "TIMEZONE_MINUTE"
    | "TIMEZONE"
    | "WEEK"
    | "YEAR_MONTH"
    | "YEAR"
  >;
  precision?: ParenExpr<NumberLiteral>;
}
