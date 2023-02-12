import { Alias } from "./Alias";
import { AllColumns, BaseNode } from "./Base";
import { EntityName, Expr, Identifier } from "./Expr";

export type AllSelectNodes =
  | SelectStmt
  | WithClause
  | CommonTableExpression
  | SortSpecification
  | JoinExpr
  | JoinOnSpecification
  | JoinUsingSpecification
  | NamedWindow
  | WindowDefinition;

export type SubSelect = SelectStmt;

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
  window?: NamedWindow[];
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

export type TableExpr = JoinExpr | TableOrSubquery;

export interface JoinExpr extends BaseNode {
  type: "join_expr";
  left: TableExpr;
  operator: JoinOp;
  right: TableOrSubquery;
  specification?: JoinOnSpecification | JoinUsingSpecification;
}

export type JoinOp =
  | ","
  | "join"
  | "left join"
  | "right join"
  | "full join"
  | "left outer join"
  | "right outer join"
  | "full outer join"
  | "inner join"
  | "cross join"
  | "natural join"
  | "natural left join"
  | "natural right join"
  | "natural full join"
  | "natural left outer join"
  | "natural right outer join"
  | "natural full outer join"
  | "natural inner join"
  | "straight_join";

export type TableOrSubquery = EntityName | SubSelect | Alias<TableOrSubquery>;

export interface JoinOnSpecification extends BaseNode {
  type: "join_on_specification";
  expr: Expr;
}

export interface JoinUsingSpecification extends BaseNode {
  type: "join_using_specification";
  columns: Identifier[];
}

export interface NamedWindow extends BaseNode {
  type: "named_window";
  name: Identifier;
  window: WindowDefinition;
}

export interface WindowDefinition extends BaseNode {
  type: "window_definition";
  baseWindowName?: Identifier;
  partitionBy?: Identifier[];
  orderBy?: (Identifier | SortSpecification)[];
  // frame?: FrameClause;
}
