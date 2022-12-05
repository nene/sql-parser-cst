import { AllColumns, BaseNode, Empty, Keyword } from "./Base";
import { DataType } from "./DataType";
import { Literal, StringLiteral } from "./Literal";
import { Node } from "./Node";
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
  | ExtractFrom
  | FilterArg
  | OverArg
  | CaseWhen
  | CaseElse
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
  TOperator = string | Keyword | Keyword[],
  TRight = Expr
> extends BaseNode {
  type: "binary_expr";
  left: TLeft;
  operator: TOperator;
  right: TRight;
}

export interface PrefixOpExpr extends BaseNode {
  type: "prefix_op_expr";
  operator: string | Keyword[];
  expr: Expr;
}

export interface PostfixOpExpr extends BaseNode {
  type: "postfix_op_expr";
  operator: string | Keyword[];
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
}

export interface RaiseExpr extends BaseNode {
  type: "raise_expr";
  raiseKw: Keyword<"RAISE">;
  args: ParenExpr<
    ListExpr<Keyword<"IGNORE" | "ROLLBACK" | "ABORT" | "FAIL"> | StringLiteral>
  >;
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
  expr?: Expr;
  caseKw: Keyword<"CASE">;
  endKw: Keyword<"END">;
  clauses: (CaseWhen | CaseElse)[];
}

export interface CaseWhen extends BaseNode {
  type: "case_when";
  whenKw: Keyword<"WHEN">;
  condition: Expr;
  thenKw: Keyword<"THEN">;
  result: Expr;
}

export interface CaseElse extends BaseNode {
  type: "case_else";
  elseKw: Keyword<"ELSE">;
  result: Expr;
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

// Type alias to use in places where MemberExpr or Identifier should refer to a table
export type Table = MemberExpr | Identifier | BigQueryQuotedMemberExpr;

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
