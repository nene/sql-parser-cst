import { BaseNode, Keyword } from "./Base";
import { IndexSpecification } from "./Constraint";
import { BigqueryOptions } from "./dialects/Bigquery";
import { ListExpr, ParenExpr, EntityName } from "./Expr";
import { WhereClause } from "./Select";

export type AllIndexNodes = AllIndexStatements | VerboseAllColumns;

export type AllIndexStatements = CreateIndexStmt | DropIndexStmt;

// CREATE INDEX
export interface CreateIndexStmt extends BaseNode {
  type: "create_index_stmt";
  createKw: Keyword<"CREATE">;
  indexTypeKw?: Keyword<"UNIQUE" | "FULLTEXT" | "SPATIAL" | "SEARCH">;
  indexKw: Keyword<"INDEX">;
  concurrentlyKw?: Keyword<"CONCURRENTLY">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  onKw: Keyword<"ON">;
  table: EntityName;
  columns:
    | ParenExpr<ListExpr<IndexSpecification>>
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
  concurrentlyKw?: Keyword<"CONCURRENTLY">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  indexes: ListExpr<EntityName>;
  onKw?: Keyword<"ON">;
  table?: EntityName;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
