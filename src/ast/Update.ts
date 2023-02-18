import { Alias } from "./Alias";
import { BaseNode } from "./Base";
import { Expr, Identifier, MemberExpr, EntityName } from "./Expr";
import { SortSpecification, TableExpr, WithClause } from "./Select";

export type AllUpdateNodes = UpdateStmt | ColumnAssignment;

export interface UpdateStmt extends BaseNode {
  type: "update_stmt";
  with?: WithClause;
  orAction?: "abort" | "fail" | "ignore" | "replace" | "rollback";
  tables: (EntityName | Alias<EntityName>)[];
  assignments: ColumnAssignment[];
  from?: TableExpr;
  where?: Expr;
  orderBy?: (Identifier | SortSpecification)[];
  limit?: Expr;
  offset?: Expr;
}

export interface ColumnAssignment extends BaseNode {
  type: "column_assignment";
  column: Identifier | MemberExpr | Identifier[];
  expr: Expr;
}
