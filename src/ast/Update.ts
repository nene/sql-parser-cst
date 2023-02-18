import { Alias } from "./Alias";
import { BaseNode } from "./Base";
import { Expr, Identifier, MemberExpr, EntityName } from "./Expr";

export type AllUpdateNodes = UpdateStmt | ColumnAssignment;

export interface UpdateStmt extends BaseNode {
  type: "update_stmt";
  orAction?: "abort" | "fail" | "ignore" | "replace" | "rollback";
  tables: (EntityName | Alias<EntityName>)[];
  assignments: ColumnAssignment[];
  where?: Expr;
}

export interface ColumnAssignment extends BaseNode {
  type: "column_assignment";
  column: Identifier | MemberExpr | Identifier[];
  expr: Expr;
}
