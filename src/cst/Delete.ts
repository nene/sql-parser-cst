import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";
import { ReturningClause, WhereClause, WithClause } from "./Select";

// DELETE FROM
export interface DeleteStmt extends BaseNode {
  type: "delete_stmt";
  with?: WithClause;
  deleteKw: Keyword<"DELETE">;
  fromKw?: Keyword<"FROM">;
  table: EntityName | Alias<EntityName>;
  where?: WhereClause;
  returning?: ReturningClause;
}
