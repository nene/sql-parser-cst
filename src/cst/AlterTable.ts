import { AlterTableAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { ListExpr } from "./Expr";
import { RelationExpr } from "./Select";

// ALTER TABLE
export interface AlterTableStmt extends BaseNode {
  type: "alter_table_stmt";
  alterTableKw: [Keyword<"ALTER">, Keyword<"TABLE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  table: RelationExpr;
  actions: ListExpr<AlterTableAction>;
}
