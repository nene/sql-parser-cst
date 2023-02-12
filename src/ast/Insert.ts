import { Alias } from "./Alias";
import { BaseNode } from "./Base";
import { EntityName, Expr, Identifier } from "./Expr";

export type AllInsertNodes = InsertStmt;

export interface InsertStmt extends BaseNode {
  type: "insert_stmt";
  table: EntityName | Alias<EntityName>;
  columns?: Identifier[];
  values: Expr[][];
}
