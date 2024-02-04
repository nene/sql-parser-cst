import { BaseNode, Keyword } from "./Base";
import { TablespaceClause, UsingAccessMethodClause } from "./CreateTable";
import { BigqueryOptions } from "./dialects/Bigquery";
import { ListExpr, ParenExpr, EntityName, Identifier, Expr } from "./Expr";
import {
  PostgresqlOperatorClass,
  PostgresqlWithOptions,
} from "./dialects/Postgresql";
import {
  SortDirectionAsc,
  SortDirectionDesc,
  TableWithoutInheritance,
  WhereClause,
} from "./Select";
import { AlterIndexAction } from "./AlterAction";

export type AllIndexNodes =
  | AllIndexStatements
  | VerboseAllColumns
  | IndexSpecification
  | IndexIncludeClause
  | IndexNullsDistinctClause
  | IndexNullsNotDistinctClause;

export type AllIndexStatements =
  | CreateIndexStmt
  | DropIndexStmt
  | AlterIndexStmt;

// CREATE INDEX
export interface CreateIndexStmt extends BaseNode {
  type: "create_index_stmt";
  createKw: Keyword<"CREATE">;
  indexTypeKw?: Keyword<"UNIQUE" | "FULLTEXT" | "SPATIAL" | "SEARCH">;
  indexKw: Keyword<"INDEX">;
  concurrentlyKw?: Keyword<"CONCURRENTLY">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name?: EntityName;
  onKw: Keyword<"ON">;
  table: EntityName | TableWithoutInheritance;
  using?: UsingAccessMethodClause;
  columns:
    | ParenExpr<ListExpr<IndexSpecification>>
    | ParenExpr<VerboseAllColumns>;
  clauses: CreateIndexClause[];
}

type CreateIndexClause =
  | WhereClause
  | BigqueryOptions
  | IndexIncludeClause
  | IndexNullsDistinctClause
  | IndexNullsNotDistinctClause
  | TablespaceClause
  | PostgresqlWithOptions;

// In contrast to normal AllColumns node, which represents the star (*)
export interface VerboseAllColumns extends BaseNode {
  type: "verbose_all_columns";
  allColumnsKw: [Keyword<"ALL">, Keyword<"COLUMNS">];
}

export interface IndexSpecification extends BaseNode {
  type: "index_specification";
  expr: Expr;
  opclass?: PostgresqlOperatorClass;
  direction?: SortDirectionAsc | SortDirectionDesc;
  nullHandlingKw: [Keyword<"NULLS">, Keyword<"FIRST" | "LAST">];
}

export interface IndexIncludeClause extends BaseNode {
  type: "index_include_clause";
  includeKw: Keyword<"INCLUDE">;
  columns: ParenExpr<ListExpr<Identifier>>;
}

export interface IndexNullsDistinctClause extends BaseNode {
  type: "index_nulls_distinct_clause";
  nullsDistinctKw: [Keyword<"NULLS">, Keyword<"DISTINCT">];
}

export interface IndexNullsNotDistinctClause extends BaseNode {
  type: "index_nulls_not_distinct_clause";
  nullsNotDistinctKw: [Keyword<"NULLS">, Keyword<"NOT">, Keyword<"DISTINCT">];
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

// ALTER INDEX
export interface AlterIndexStmt extends BaseNode {
  type: "alter_index_stmt";
  alterKw: Keyword<"ALTER">;
  indexKw: Keyword<"INDEX">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  index: EntityName;
  action: AlterIndexAction;
}
