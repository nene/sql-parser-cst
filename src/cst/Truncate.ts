import { BaseNode, Keyword } from "./Base";
import { TableFactor } from "./Select";

// TRUNCATE TABLE
export interface TruncateStmt extends BaseNode {
  type: "truncate_stmt";
  truncateKw: Keyword<"TRUNCATE">;
  tableKw?: Keyword<"TABLE">;
  table: TableFactor;
}
