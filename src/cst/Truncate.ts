import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";

// TRUNCATE TABLE
export interface TruncateStmt extends BaseNode {
  type: "truncate_stmt";
  truncateTableKw: [Keyword<"TRUNCATE">, Keyword<"TABLE">];
  table: EntityName;
}
