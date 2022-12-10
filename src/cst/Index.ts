import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./Bigquery";
import { Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { SortSpecification, WhereClause } from "./Select";

export type AllIndexStatements = CreateIndexStmt | DropIndexStmt;

// CREATE INDEX
export interface CreateIndexStmt extends BaseNode {
  type: "create_index_stmt";
  createKw: Keyword<"CREATE">;
  indexTypeKw?: Keyword<"UNIQUE" | "FULLTEXT" | "SPATIAL" | "SEARCH">;
  indexKw: Keyword<"INDEX">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Table;
  onKw: Keyword<"ON">;
  table: Table;
  columns: ParenExpr<ListExpr<SortSpecification | Identifier>>;
  clauses: (WhereClause | BigqueryOptions)[];
}

// DROP INDEX
export interface DropIndexStmt extends BaseNode {
  type: "drop_index_stmt";
  dropKw: Keyword<"DROP">;
  indexTypeKw?: Keyword<"SEARCH">;
  indexKw: Keyword<"INDEX">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  indexes: ListExpr<Table>;
  onKw?: Keyword<"ON">;
  table?: Table;
}
