import { AllColumns, BaseNode, Empty, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Literal, StringLiteral } from "./Literal";
import { Node, Program } from "./Node";
import {
  LimitClause,
  OrderByClause,
  SubSelect,
  WhereClause,
  WindowDefinition,
} from "./Select";

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
  | CaseWhen<Expr | Program>
  | CaseElse<Expr | Program>
  | IntervalUnitRange
  | PairExpr
  | WeekExpr
  | ArraySubscript
  | ArraySubscriptSpecifier;

export type Expr =
  | ListExpr
  | ParenExpr
  | BinaryExpr
  | PrefixOpExpr
  | PostfixOpExpr
  | FuncCall
  | CastExpr
  | RaiseExpr
  | ExtractExpr
  | BetweenExpr
  | CaseExpr
  | IntervalExpr
  | StringWithCharset
  | Literal
  | MemberExpr
  | BigQueryQuotedMemberExpr
  | Identifier
  | Variable
  | Parameter
  | TypedExpr
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

export interface PairExpr<T1 = Node | Node[], T2 = Node> extends BaseNode {
  type: "pair_expr";
  expr1: T1;
  expr2: T2;
}

export interface BinaryExpr<
  TLeft = Expr,
  TOperator = SymbolOperator | KeywordOperator,
  TRight = Expr
> extends BaseNode {
  type: "binary_expr";
  left: TLeft;
  operator: TOperator;
  right: TRight;
}

type SymbolOperator =
  // standard arithmetics
  | "+"
  | "-"
  | "*"
  | "/"
  | "%" // SQLite, MySQL
  // comparison
  | "="
  | "==" // SQLite
  | "<"
  | ">"
  | ">="
  | "<="
  | "<>"
  | "!="
  | "<=>" // MySQL
  // string concat
  | "||" // OR in MySQL
  // Logic
  | "&&" // MySQL
  // JSON
  | "->" // SQLite, MySQL
  | "->>" // SQLite, MySQL
  // bitwise
  | "&"
  | "|"
  | ">>"
  | "<<"
  | "^"; // BigQuery, MySQL

type KeywordOperator =
  // arithmetic
  | Keyword<"DIV"> // SQLite, MySQL,
  | Keyword<"MOD"> // SQLite, MySQL
  // Logic
  | Keyword<"AND">
  | Keyword<"OR">
  | Keyword<"XOR"> // MySQL
  // Collation
  | Keyword<"COLLATE"> // SQLite, MySQL
  // Comparison
  | Keyword<"IS">
  | [Keyword<"IS">, Keyword<"NOT">]
  | [Keyword<"IS">, Keyword<"DISTINCT">, Keyword<"FROM">] // SQLite, BigQuery
  | [Keyword<"IS">, Keyword<"NOT">, Keyword<"DISTINCT">, Keyword<"FROM">] // SQLite, BigQuery
  | Keyword<"IN">
  | [Keyword<"NOT">, Keyword<"IN">]
  | Keyword<"LIKE" | "RLIKE" | "GLOB" | "MATCH"> // RLIKE is MySQL, GLOB/MATCH are SQLite
  | [Keyword<"NOT">, Keyword<"LIKE" | "RLIKE" | "GLOB" | "MATCH">]
  | Keyword<"ESCAPE">; // SQLite, MySQL

export interface PrefixOpExpr extends BaseNode {
  type: "prefix_op_expr";
  operator: "-" | "~" | "!" | Keyword<"NOT"> | Keyword<"EXISTS">;
  expr: Expr;
}

export interface PostfixOpExpr extends BaseNode {
  type: "postfix_op_expr";
  operator:
    | Keyword<"ISNULL"> // SQLite
    | Keyword<"NOTNULL"> // SQLite
    | [Keyword<"NOT">, Keyword<"NULL">] // SQLite
    | [Keyword<"IS">, Keyword<"UNKNOWN">] // BigQuery, MySQL
    | [Keyword<"IS">, Keyword<"NOT">, Keyword<"UNKNOWN">]; // BigQuery, MySQL
  expr: Expr;
}

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
  nullHandlingKw?: [Keyword<"IGNORE" | "RESPECT">, Keyword<"NULLS">];
  orderBy?: OrderByClause;
  limit?: LimitClause;
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

export interface NamedArg extends BaseNode {
  type: "named_arg";
  name: Identifier;
  value: Expr;
}

export interface CastExpr extends BaseNode {
  type: "cast_expr";
  castKw: Keyword<"CAST" | "SAFE_CAST">;
  args: ParenExpr<CastArg>;
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
  unit: IntervalUnitKeyword | WeekExpr;
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
  betweenKw: Keyword<"BETWEEN"> | [Keyword<"NOT">, Keyword<"BETWEEN">];
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

export interface IntervalExpr extends BaseNode {
  type: "interval_expr";
  intervalKw: Keyword<"INTERVAL">;
  expr: Expr;
  unit: IntervalUnitKeyword | IntervalUnitRange;
}

export interface IntervalUnitRange extends BaseNode {
  type: "interval_unit_range";
  fromUnitKw: IntervalUnitKeyword;
  toKw: Keyword<"TO">;
  toUnitKw: IntervalUnitKeyword;
}

type IntervalUnitKeyword = Keyword<
  | "YEAR"
  | "QUARTER"
  | "MONTH"
  | "WEEK"
  | "DAY"
  | "HOUR"
  | "MINUTE"
  | "SECOND"
  | "MICROSECOND"
  | "SECOND_MICROSECOND"
  | "MINUTE_MICROSECOND"
  | "MINUTE_SECOND"
  | "HOUR_MICROSECOND"
  | "HOUR_SECOND"
  | "HOUR_MINUTE"
  | "DAY_MICROSECOND"
  | "DAY_SECOND"
  | "DAY_MINUTE"
  | "DAY_HOUR"
  | "YEAR_MONTH"
>;

export interface StringWithCharset extends BaseNode {
  type: "string_with_charset";
  charset: string;
  string: StringLiteral;
}

export interface MemberExpr extends BaseNode {
  type: "member_expr";
  object: Expr;
  property: ArraySubscript | Identifier | AllColumns | Empty;
}

// Represents BigQuery-specific quated table path expressions like:
// `my project.dataset.my table`
export interface BigQueryQuotedMemberExpr extends BaseNode {
  type: "bigquery_quoted_member_expr";
  expr: MemberExpr;
}

// Type alias to use in places where MemberExpr or Identifier
// should refer to a table, view, stored procedure, or any other schema-qualified name
export type EntityName = MemberExpr | Identifier | BigQueryQuotedMemberExpr;

export interface ArraySubscript extends BaseNode {
  type: "array_subscript";
  expr: Expr | ArraySubscriptSpecifier;
}

export interface ArraySubscriptSpecifier extends BaseNode {
  type: "array_subscript_specifier";
  specifierKw: Keyword<"OFFSET" | "SAFE_OFFSET" | "ORDINAL" | "SAFE_ORDINAL">;
  args: ParenExpr<Expr>;
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
// ------------
export interface TypedExpr extends BaseNode {
  type: "typed_expr";
  dataType: DataType;
  expr: ArrayExpr | StructExpr;
}

export interface ArrayExpr extends BaseNode {
  type: "array_expr";
  expr: ListExpr<Expr>;
}

export interface StructExpr extends BaseNode {
  type: "struct_expr";
  expr: ListExpr<Expr>;
}
