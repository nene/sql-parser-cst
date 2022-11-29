import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { SubSelect } from "./Select";

// CREATE VIEW
export interface CreateViewStmt extends BaseNode {
  type: "create_view_stmt";
  createKw: Keyword<"CREATE">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  viewKw: Keyword<"VIEW">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Table;
  columns?: ParenExpr<ListExpr<Identifier>>;
  asKw: Keyword<"AS">;
  expr: SubSelect;
}

// DROP VIEW
export interface DropViewStmt extends BaseNode {
  type: "drop_view_stmt";
  dropViewKw: [Keyword<"DROP">, Keyword<"VIEW">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  views: ListExpr<Table>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
