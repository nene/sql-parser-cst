import { BaseNode, Keyword } from "./Base";
import { ListExpr, EntityName } from "./Expr";

export type AllRenameTableNodes = RenameTableStmt | RenameAction;

export interface RenameTableStmt extends BaseNode {
  type: "rename_table_stmt";
  renameKw: Keyword<"RENAME">;
  tableKw: Keyword<"TABLE">;
  actions: ListExpr<RenameAction>;
}

export interface RenameAction extends BaseNode {
  type: "rename_action";
  from: EntityName;
  toKw: Keyword<"TO">;
  to: EntityName;
}
