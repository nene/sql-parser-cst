import { AlterTableAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { ListExpr, EntityName } from "./Expr";

// ALTER TABLE
export interface AlterTableStmt extends BaseNode {
  type: "alter_table_stmt";
  alterTableKw: [Keyword<"ALTER">, Keyword<"TABLE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  table: EntityName;
  actions: ListExpr<AlterTableAction>;
}
