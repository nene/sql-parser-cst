import { BaseNode, Keyword } from "./Base";
import { ColumnRef, ListExpr, ParenExpr, TableRef } from "./Expr";
import { SortSpecification, WhereClause } from "./Select";

// CREATE INDEX
export interface CreateIndexStmt extends BaseNode {
  type: "create_index_stmt";
  createKw: Keyword<"CREATE">;
  indexTypeKw?: Keyword<"UNIQUE" | "FULLTEXT" | "SPATIAL">;
  indexKw: Keyword<"INDEX">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: TableRef;
  onKw: Keyword<"ON">;
  table: TableRef;
  columns: ParenExpr<ListExpr<SortSpecification | ColumnRef>>;
  where?: WhereClause;
}

// DROP INDEX
export interface DropIndexStmt extends BaseNode {
  type: "drop_index_stmt";
  dropIndexKw: [Keyword<"DROP">, Keyword<"INDEX">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  indexes: ListExpr<TableRef>;
  onKw?: Keyword<"ON">;
  table?: TableRef;
}
