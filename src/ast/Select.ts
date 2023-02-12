import { Alias } from "./Alias";
import { AllColumns, BaseNode } from "./Base";
import { Expr, Identifier } from "./Expr";

export type AllSelectNodes =
  | SelectStmt
  | WithClause
  | CommonTableExpression
  | SortSpecification
  | JoinExpr
  | JoinOnSpecification
  | JoinUsingSpecification;

export interface SelectStmt extends BaseNode {
  type: "select_stmt";
  distinct?: "all" | "distinct" | "distinctrow";
  with?: WithClause;
  columns: (AllColumns | Expr | Alias<Expr>)[];
  from?: TableExpr;
  where?: Expr;
  groupBy?: Identifier[];
  having?: Expr;
  orderBy?: (Identifier | SortSpecification)[];
  limit?: Expr;
  offset?: Expr;
}

export interface WithClause extends BaseNode {
  type: "with_clause";
  recursive?: boolean;
  tables: CommonTableExpression[];
}

export interface CommonTableExpression extends BaseNode {
  type: "common_table_expression";
  table: Identifier;
  expr: SelectStmt;
}

export interface SortSpecification extends BaseNode {
  type: "sort_specification";
  expr: Expr;
  order?: "asc" | "desc";
  nulls?: "first" | "last";
}

export type TableExpr = JoinExpr | Identifier;

export interface JoinExpr extends BaseNode {
  type: "join_expr";
  left: TableExpr;
  operator: "," | "natural join";
  right: Identifier;
  specification?: JoinOnSpecification | JoinUsingSpecification;
}

export interface JoinOnSpecification extends BaseNode {
  type: "join_on_specification";
  expr: Expr;
}

export interface JoinUsingSpecification extends BaseNode {
  type: "join_using_specification";
  columns: Identifier[];
}
