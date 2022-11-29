import { BaseNode, Keyword } from "./Base";
import { Table } from "./Expr";

// TRUNCATE TABLE
export interface TruncateStmt extends BaseNode {
  type: "truncate_stmt";
  truncateTableKw: [Keyword<"TRUNCATE">, Keyword<"TABLE">];
  table: Table;
}
