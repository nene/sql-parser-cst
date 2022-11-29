import { BaseNode, Keyword } from "./Base";
import { ListExpr, Table } from "./Expr";

// DROP TABLE
export interface DropTableStmt extends BaseNode {
  type: "drop_table_stmt";
  dropKw: Keyword<"DROP">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  tableKw: Keyword<"TABLE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  tables: ListExpr<Table>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
