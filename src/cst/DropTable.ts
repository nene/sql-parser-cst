import { BaseNode, Keyword } from "./Base";
import { ListExpr, EntityName } from "./Expr";

// DROP TABLE
export interface DropTableStmt extends BaseNode {
  type: "drop_table_stmt";
  dropKw: Keyword<"DROP">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  tableKw: Keyword<"TABLE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  tables: ListExpr<EntityName>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
