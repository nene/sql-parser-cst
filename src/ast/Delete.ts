import { Alias } from "./Alias";
import { BaseNode } from "./Base";
import { EntityName, Expr, Identifier } from "./Expr";
import { SortSpecification, WithClause } from "./Select";

export type AllDeleteNodes = DeleteStmt;

export interface DeleteStmt extends BaseNode {
  type: "delete_stmt";
  with?: WithClause;
  table: EntityName | Alias<EntityName>;
  where?: Expr;
  orderBy?: (Identifier | SortSpecification)[];
  limit?: Expr;
  offset?: Expr;
  returning?: (Expr | Alias<Expr>)[];
}
