import { Alias } from "./Alias";
import { AllColumns, BaseNode } from "./Base";
import { Expr, Identifier } from "./Expr";

export type AllSelectNodes = SelectStmt | SortSpecification;

export interface SelectStmt extends BaseNode {
  type: "select_stmt";
  distinct?: "all" | "distinct" | "distinctrow";
  columns: (AllColumns | Expr | Alias<Expr>)[];
  from?: Expr;
  where?: Expr;
  groupBy?: Identifier[];
  having?: Expr;
  orderBy?: (Identifier | SortSpecification)[];
  limit?: Expr;
  offset?: Expr;
}

export interface SortSpecification extends BaseNode {
  type: "sort_specification";
  expr: Expr;
  order: "asc" | "desc";
  nulls?: "first" | "last";
}
