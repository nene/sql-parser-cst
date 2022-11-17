import { AllColumns, BaseNode, Keyword } from "./Base";
import { DataType } from "./CreateTable";
import { Literal, StringLiteral } from "./Literal";
import { Node } from "./Node";
import { WhereClause, WindowDefinition } from "./Select";

export type AllExprNodes =
  | Expr
  | DistinctArg
  | CastArg
  | FilterArg
  | OverArg
  | CaseWhen
  | CaseElse
  | IntervalUnitRange;

export type Expr =
  | ListExpr
  | ParenExpr
  | BinaryExpr
  | PrefixOpExpr
  | PostfixOpExpr
  | FuncCall
  | TableFuncCall
  | CastExpr
  | RaiseExpr
  | BetweenExpr
  | CaseExpr
  | IntervalExpr
  | StringWithCharset
  | Literal
  | ColumnRef
  | TableRef
  | Identifier
  | Parameter;

export interface ListExpr<T = Node> extends BaseNode {
  type: "list_expr";
  items: T[];
}

export interface ParenExpr<T = Node> extends BaseNode {
  type: "paren_expr";
  expr: T;
}

export interface BinaryExpr extends BaseNode {
  type: "binary_expr";
  left: Expr;
  operator: string | Keyword | Keyword[];
  right: Expr;
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
  name: Identifier;
  args?: ParenExpr<ListExpr<Expr | AllColumns | DistinctArg>>;
  filter?: FilterArg;
  over?: OverArg;
}

export interface TableFuncCall extends BaseNode {
  type: "table_func_call";
  name: TableRef;
  args: ParenExpr<ListExpr<Expr>>;
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

export interface DistinctArg extends BaseNode {
  type: "distinct_arg";
  distinctKw: Keyword<"DISTINCT">;
  value: Expr;
}

export interface CastExpr extends BaseNode {
  type: "cast_expr";
  castKw: Keyword<"CAST">;
  args: ParenExpr<CastArg>;
}

export interface CastArg extends BaseNode {
  type: "cast_arg";
  expr: Expr;
  asKw: Keyword<"AS">;
  dataType: DataType;
}

export interface RaiseExpr extends BaseNode {
  type: "raise_expr";
  raiseKw: Keyword<"RAISE">;
  args: ParenExpr<
    ListExpr<Keyword<"IGNORE" | "ROLLBACK" | "ABORT" | "FAIL"> | StringLiteral>
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

export interface ColumnRef extends BaseNode {
  type: "column_ref";
  table?: Identifier;
  column: Identifier | AllColumns;
}

export interface TableRef extends BaseNode {
  type: "table_ref";
  schema?: Identifier;
  table: Identifier;
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
