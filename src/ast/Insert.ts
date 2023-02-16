import { Alias } from "./Alias";
import { BaseNode } from "./Base";
import { EntityName, Expr, Identifier } from "./Expr";
import { WithClause } from "./Select";

export type AllInsertNodes = InsertStmt | ValuesClause;

export interface InsertStmt extends BaseNode {
  type: "insert_stmt";
  with?: WithClause;
  orAction?: "abort" | "fail" | "ignore" | "replace" | "rollback";
  table: EntityName | Alias<EntityName>;
  columns?: Identifier[];
  values: ValuesClause;
}

export interface ValuesClause extends BaseNode {
  type: "values_clause";
  values: Expr[][];
}
