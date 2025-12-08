import { AllColumns, BaseNode, Empty, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Literal, StringLiteral } from "./Literal";
import { Node, Program, TriggerEventExpr } from "./Node";
import {
  LimitClause,
  OrderByClause,
  SubSelect,
  WhereClause,
  WindowDefinition,
} from "./Select";
import { Default } from "./Insert";
import {
  PostgresqlOperator,
  PostgresqlOperatorExpr,
} from "./dialects/Postgresql";

export type AllExprNodes =
  | Expr
  | FuncArgs
  | NamedArg
  | CastArg
  | CastFormat
  | CastFormatTimezone
  | RaiseExprType
  | ExtractFrom
  | FilterArg
  | OverArg
  | HavingArg
  | CaseWhen<Expr | Program>
  | CaseElse<Expr | Program>
  | IntervalUnitRange
  | IntervalUnit
  | WeekExpr
  | FullTextMatchArgs
  | ArraySubscript
  | ArraySubscriptSpecifier
  | ArraySliceSpecifier;

export type Expr =
  | ListExpr
  | ParenExpr
  | BinaryExpr
  | BinaryExpr<TriggerEventExpr, Keyword<"OR">, TriggerEventExpr>
  | PrefixOpExpr
  | PostfixOpExpr
  | FuncCall
  | CastExpr
  | CastOperatorExpr
  | RaiseExpr
  | ExtractExpr
  | BetweenExpr
  | CaseExpr
  | RowConstructor
  | ArrayConstructor
  | IntervalExpr
  | StringWithCharset
  | QuantifierExpr
  | FullTextMatchExpr
  | Literal
  | MemberExpr
  | BigQueryQuotedMemberExpr
  | Identifier
  | Variable
  | Parameter
  | TypedExpr
  | ArrayLiteralExpr
  | ArrayExpr
  | StructExpr;

export interface ListExpr<T = Node> extends BaseNode {
  type: "list_expr";
  items: T[];
}

export interface ParenExpr<T = Node> extends BaseNode {
  type: "paren_expr";
  expr: T;
}

export interface BinaryExpr<
  TLeft = Expr,
  TOperator = SymbolOperator | KeywordOperator | PostgresqlOperatorExpr,
  TRight = Expr
> extends BaseNode {
  type: "binary_expr";
  left: TLeft;
  operator: TOperator;
  right: TRight;
}

/**
 * We can't enumerate all operators because PostgreSQL allows custom operators.
 * So this type is just alias for string.
 *
 * However, for reference, here's a list of the usual operators and to which dialects they apply:
 *
 * arithmetics:
 *   + - * /
 *   % (SQLite, MySQL, PostgreSQL)
 *   ^ (PostgreSQL)
 * comparison:
 *   = < > >= <= <> !=
 *   == (SQLite)
 *   <=> (MySQL)
 * string concatenation:
 *   || (except in MySQL)
 *   "" (empty string - in MySQL adjecent strings get concatenated)
 *   "\n" (in PostgreSQL newline-separated strings strings get concatenated)
 * logic:
 *   && (MySQL AND)
 *   || (MySQL)
 * JSON:
 *   ->  (SQLite, MySQL, PostgreSQL)
 *   ->> (SQLite, MySQL, PostgreSQL)
 *   #>  (PostgreSQL)
 *   #>> (PostgreSQL)
 * bitwise:
 *   & | >> <<
 *   ^ (BigQuery and MySQL)
 *   # (PostgreSQL)
 * assignment:
 *   := (MySQL)
 */
type SymbolOperator = string;

type KeywordOperator =
  // arithmetic
  | Keyword<"DIV"> // SQLite, MySQL,
  | Keyword<"MOD"> // SQLite, MySQL
  // Logic
  | Keyword<"AND">
  | Keyword<"OR">
  | Keyword<"XOR"> // MySQL
  // Collation
  | Keyword<"COLLATE"> // SQLite, MySQL, PostgreSQL
  // Comparison
  | Keyword<"IS">
  | [Keyword<"IS">, Keyword<"NOT">]
  | [Keyword<"IS">, Keyword<"DISTINCT">, Keyword<"FROM">] // SQLite, BigQuery, PostgreSQL
  | [Keyword<"IS">, Keyword<"NOT">, Keyword<"DISTINCT">, Keyword<"FROM">] // SQLite, BigQuery, PostgreSQL
  | Keyword<"IN">
  | [Keyword<"NOT">, Keyword<"IN">]
  | Keyword<"LIKE" | "RLIKE" | "ILIKE" | "GLOB" | "MATCH"> // RLIKE is MySQL, GLOB/MATCH are SQLite, ILIKE in PostgreSQL
  | [Keyword<"NOT">, Keyword<"LIKE" | "RLIKE" | "ILIKE" | "GLOB" | "MATCH">]
  | [Keyword<"SIMILAR">, Keyword<"TO">] // PostgreSQL
  | [Keyword<"NOT">, Keyword<"SIMILAR">, Keyword<"TO">] // PostgreSQL
  | [Keyword<"MEMBER">, Keyword<"OF">] // MySQL
  | [Keyword<"SOUNDS">, Keyword<"LIKE">] // MySQL
  | Keyword<"ESCAPE"> // SQLite, MySQL, PostgreSQL
  | Keyword<"UESCAPE"> // PostgreSQL
  // Timezone
  | [Keyword<"AT">, Keyword<"TIME">, Keyword<"ZONE">]; // PostgreSQL

export interface PrefixOpExpr extends BaseNode {
  type: "prefix_op_expr";
  operator:
    | "-"
    | "+"
    | "~"
    | "!"
    | Keyword<"NOT">
    | Keyword<"EXISTS">
    | PostgresqlOperatorExpr;
  expr: Expr;
}

export interface PostfixOpExpr extends BaseNode {
  type: "postfix_op_expr";
  operator:
    | Keyword<"ISNULL"> // SQLite, PostgreSQL
    | Keyword<"NOTNULL"> // SQLite, PostgreSQL
    | [Keyword<"NOT">, Keyword<"NULL">] // SQLite
    | [Keyword<"IS">, Keyword<"UNKNOWN">] // BigQuery, MySQL, PostgreSQL
    | [Keyword<"IS">, Keyword<"NOT">, Keyword<"UNKNOWN">] // BigQuery, MySQL, PostgreSQL
    | [Keyword<"IS">, Keyword<"NORMALIZED">] // PostgreSQL
    | [Keyword<"IS">, Keyword<"NOT">, Keyword<"NORMALIZED">] // PostgreSQL
    | [Keyword<"IS">, NormalizationForm, Keyword<"NORMALIZED">] // PostgreSQL
    | [Keyword<"IS">, Keyword<"NOT">, NormalizationForm, Keyword<"NORMALIZED">]; // PostgreSQL
  expr: Expr;
}

type NormalizationForm = Keyword<"NFC" | "NFD" | "NFKC" | "NFKD">;

export interface FuncCall extends BaseNode {
  type: "func_call";
  name: Identifier | MemberExpr;
  args?: ParenExpr<FuncArgs>;
  filter?: FilterArg;
  over?: OverArg;
}

export interface FuncArgs extends BaseNode {
  type: "func_args";
  distinctKw?: Keyword<"DISTINCT">;
  args: ListExpr<Expr | AllColumns | SubSelect | NamedArg>;
  nullHandlingKw?: [Keyword<"IGNORE" | "RESPECT">, Keyword<"NULLS">]; // BigQuery
  orderBy?: OrderByClause; // BigQuery
  limit?: LimitClause; // BigQuery
  having?: HavingArg; // BigQuery
}

export interface FilterArg extends BaseNode {
  type: "filter_arg";
  filterKw: Keyword<"FILTER">;
  where: ParenExpr<WhereClause>;
}

export interface OverArg extends BaseNode {
  type: "over_arg";
  overKw: Keyword<"OVER">;
  window: ParenExpr<WindowDefinition> | Identifier;
}

// BigQuery, PostgreSQL
export interface NamedArg extends BaseNode {
  type: "named_arg";
  name: Identifier;
  operator: "=>" | ":="; // The := operator is only used in PostgreSQL
  value: Expr;
}

// BigQuery
export interface HavingArg extends BaseNode {
  type: "having_arg";
  havingKw: Keyword<"HAVING">;
  minMaxKw: Keyword<"MIN" | "MAX">;
  expr: Expr;
}

// Standard SQL CAST(foo AS TYPE)
export interface CastExpr extends BaseNode {
  type: "cast_expr";
  castKw: Keyword<"CAST" | "SAFE_CAST">;
  args: ParenExpr<CastArg>;
}

// PostgreSQL foo :: TYPE
export interface CastOperatorExpr extends BaseNode {
  type: "cast_operator_expr";
  left: Expr;
  operator: "::";
  right: DataType;
}

export interface CastArg extends BaseNode {
  type: "cast_arg";
  expr: Expr;
  asKw: Keyword<"AS">;
  dataType: DataType;
  format?: CastFormat;
}

export interface CastFormat extends BaseNode {
  type: "cast_format";
  formatKw: Keyword<"FORMAT">;
  string: Expr;
  timezone?: CastFormatTimezone;
}

export interface CastFormatTimezone extends BaseNode {
  type: "cast_format_timezone";
  atTimeZoneKw: [Keyword<"AT">, Keyword<"TIME">, Keyword<"ZONE">];
  timezone: StringLiteral;
}

export interface RaiseExpr extends BaseNode {
  type: "raise_expr";
  raiseKw: Keyword<"RAISE">;
  args: ParenExpr<ListExpr<RaiseExprType | StringLiteral>>;
}

export interface RaiseExprType extends BaseNode {
  type: "raise_expr_type";
  typeKw: Keyword<"IGNORE" | "ROLLBACK" | "ABORT" | "FAIL">;
}

export interface ExtractExpr extends BaseNode {
  type: "extract_expr";
  extractKw: Keyword<"EXTRACT">;
  args: ParenExpr<ExtractFrom>;
}

export interface ExtractFrom extends BaseNode {
  type: "extract_from";
  unit: IntervalUnit | WeekExpr;
  fromKw: Keyword<"FROM">;
  expr: Expr;
}

export interface WeekExpr extends BaseNode {
  type: "week_expr";
  weekKw: Keyword<"WEEK">;
  args: ParenExpr<
    Keyword<
      | "SUNDAY"
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY"
    >
  >;
}

export interface BetweenExpr extends BaseNode {
  type: "between_expr";
  left: Expr;
  betweenKw:
    | Keyword<"BETWEEN">
    | [Keyword<"NOT">, Keyword<"BETWEEN">]
    | [Keyword<"BETWEEN">, Keyword<"SYMMETRIC">] // PostgreSQL
    | [Keyword<"NOT">, Keyword<"BETWEEN">, Keyword<"SYMMETRIC">]; // PostgreSQL
  begin: Expr;
  andKw: Keyword<"AND">;
  end: Expr;
}

export interface CaseExpr extends BaseNode {
  type: "case_expr";
  caseKw: Keyword<"CASE">;
  expr?: Expr;
  clauses: (CaseWhen<Expr> | CaseElse<Expr>)[];
  endKw: Keyword<"END">;
}

export interface CaseWhen<T> extends BaseNode {
  type: "case_when";
  whenKw: Keyword<"WHEN">;
  condition: Expr;
  thenKw: Keyword<"THEN">;
  result: T;
}

export interface CaseElse<T> extends BaseNode {
  type: "case_else";
  elseKw: Keyword<"ELSE">;
  result: T;
}

// in MySQL, MariaDB & PostgreSQL
export interface RowConstructor extends BaseNode {
  type: "row_constructor";
  rowKw: Keyword<"ROW">;
  row: ParenExpr<ListExpr<Expr | Default>>;
}

// PostgreSQL
export interface ArrayConstructor extends BaseNode {
  type: "array_constructor";
  arrayKw: Keyword<"ARRAY">;
  expr: ParenExpr<SubSelect>;
}

// MySQL, MariaDB, BigQuery
export interface IntervalExpr extends BaseNode {
  type: "interval_expr";
  intervalKw: Keyword<"INTERVAL">;
  expr: Expr;
  unit: IntervalUnit | IntervalUnitRange;
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
}

// MySQL, MariaDB
export interface StringWithCharset extends BaseNode {
  type: "string_with_charset";
  charset: string;
  string: StringLiteral;
}

// MySQL, MariaDB, PostgreSQL, BigQuery
export interface QuantifierExpr extends BaseNode {
  type: "quantifier_expr";
  quantifierKw: Keyword<"ANY" | "SOME" | "ALL">;
  expr: ParenExpr<SubSelect | ListExpr<Expr>>;
}

// MySQL, MariaDB
export interface FullTextMatchExpr extends BaseNode {
  type: "full_text_match_expr";
  matchKw: Keyword<"MATCH">;
  columns: ParenExpr<ListExpr<Identifier>>;
  againstKw: Keyword<"AGAINST">;
  args: ParenExpr<FullTextMatchArgs>;
}

export interface FullTextMatchArgs extends BaseNode {
  type: "full_text_match_args";
  expr: Expr;
  modifier?:
    | [Keyword<"IN">, Keyword<"NATURAL">, Keyword<"LANGUAGE">, Keyword<"MODE">]
    | [
        Keyword<"IN">,
        Keyword<"NATURAL">,
        Keyword<"LANGUAGE">,
        Keyword<"MODE">,
        Keyword<"WITH">,
        Keyword<"QUERY">,
        Keyword<"EXPANSION">
      ]
    | [Keyword<"IN">, Keyword<"BOOLEAN">, Keyword<"MODE">]
    | [Keyword<"WITH">, Keyword<"QUERY">, Keyword<"EXPANSION">];
}

export interface MemberExpr extends BaseNode {
  type: "member_expr";
  object: Expr;
  // The Empty node is only used inside BigQueryQuotedMemberExpr to allow for repeated .. syntax
  // The PostgresqlOperator is only used inside PostgreSQL OPERATOR(foo.bar.>>) syntax
  property:
    | ArraySubscript
    | Identifier
    | AllColumns
    | Empty
    | PostgresqlOperator;
}

// Represents BigQuery-specific quoted table path expressions like:
// `my project.dataset.my table`
export interface BigQueryQuotedMemberExpr extends BaseNode {
  type: "bigquery_quoted_member_expr";
  expr: MemberExpr;
}

// Type alias to use in places where MemberExpr or Identifier
// should refer to a table, view, stored procedure, or any other schema-qualified name
export type EntityName = MemberExpr | Identifier | BigQueryQuotedMemberExpr;

// PostgreSQL, BigQuery
export interface ArraySubscript extends BaseNode {
  type: "array_subscript";
  expr: Expr | ArraySubscriptSpecifier | ArraySliceSpecifier;
}

// In BigQuery
export interface ArraySubscriptSpecifier extends BaseNode {
  type: "array_subscript_specifier";
  specifierKw: Keyword<"OFFSET" | "SAFE_OFFSET" | "ORDINAL" | "SAFE_ORDINAL">;
  args: ParenExpr<Expr>;
}

// In PostgreSQL
export interface ArraySliceSpecifier extends BaseNode {
  type: "array_slice_specifier";
  from?: Expr;
  to?: Expr;
}

export interface Identifier extends BaseNode {
  type: "identifier";
  text: string;
  name: string;
}

export interface Variable extends BaseNode {
  type: "variable";
  text: string;
  name: string;
}

export interface Parameter extends BaseNode {
  type: "parameter";
  text: string;
}

// BigQuery
export interface TypedExpr extends BaseNode {
  type: "typed_expr";
  dataType: DataType;
  expr: ArrayExpr | StructExpr;
}

// PostgreSQL
export interface ArrayLiteralExpr extends BaseNode {
  type: "array_literal_expr";
  arrayKw: Keyword<"ARRAY">;
  expr: ArrayExpr;
}

// BigQuery, PostgreSQL
export interface ArrayExpr extends BaseNode {
  type: "array_expr";
  expr: ListExpr<Expr>;
}

// BigQuery
export interface StructExpr extends BaseNode {
  type: "struct_expr";
  expr: ListExpr<Expr>;
}
