import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";

// TRUNCATE TABLE
export interface TruncateStmt extends BaseNode {
  type: "truncate_stmt";
  truncateKw: Keyword<"TRUNCATE">;
  tableKw?: Keyword<"TABLE">;
  table: EntityName;
}
