import { BaseNode, Keyword } from "./Base";
import { ListExpr } from "./Expr";
import { TableFactor } from "./Select";

// TRUNCATE TABLE
export interface TruncateStmt extends BaseNode {
  type: "truncate_stmt";
  truncateKw: Keyword<"TRUNCATE">;
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<TableFactor>;
  restartOrContinueKw?: [Keyword<"RESTART" | "CONTINUE">, Keyword<"IDENTITY">];
}
