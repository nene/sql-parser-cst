import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./Bigquery";
import { Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { SortSpecification, WhereClause } from "./Select";

export type AllIndexNodes = AllIndexStatements | VerboseAllColumns;

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
  columns:
    | ParenExpr<ListExpr<SortSpecification | Identifier>>
    | ParenExpr<VerboseAllColumns>;
  clauses: (WhereClause | BigqueryOptions)[];
}

// In contrast to normal AllColumns node, which represents the star (*)
export interface VerboseAllColumns extends BaseNode {
  type: "verbose_all_columns";
  allColumnsKw: [Keyword<"ALL">, Keyword<"COLUMNS">];
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
