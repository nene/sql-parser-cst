import { AlterViewAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import {
  TablespaceClause,
  WithDataClause,
  UsingAccessMethodClause,
  RelationKind,
  ColumnDefinition,
} from "./CreateTable";
import { BigqueryOptions } from "./dialects/Bigquery";
import { PostgresqlWithOptions } from "./dialects/Postgresql";
import { Identifier, ListExpr, ParenExpr, EntityName } from "./Expr";
import { ClusterByClause } from "./OtherClauses";
import { AsClause } from "./ProcClause";
import { PartitionByClause, SubSelect } from "./Select";

export type AllViewNodes =
  | AllViewStatements
  | WithCheckOptionClause
  | AsReplicaOfClause;

export type AllViewStatements =
  | CreateViewStmt
  | DropViewStmt
  | AlterViewStmt
  | RefreshMaterializedViewStmt;

// CREATE VIEW
export interface CreateViewStmt extends BaseNode {
  type: "create_view_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  kinds: RelationKind[];
  viewKw: Keyword<"VIEW">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  columns?: ParenExpr<ListExpr<ColumnDefinition>>;
  clauses: CreateViewClause[];
}

type CreateViewClause =
  | BigqueryOptions
  | PostgresqlWithOptions
  | WithCheckOptionClause
  | ClusterByClause
  | PartitionByClause
  | UsingAccessMethodClause
  | TablespaceClause
  | WithDataClause
  | AsReplicaOfClause
  | AsClause<SubSelect>;

// PostgreSQL
export interface WithCheckOptionClause extends BaseNode {
  type: "with_check_option_clause";
  withKw: Keyword<"WITH">;
  levelKw?: Keyword<"CASCADED" | "LOCAL">;
  checkOptionKw: [Keyword<"CHECK">, Keyword<"OPTION">];
}

// BigQuery
export interface AsReplicaOfClause extends BaseNode {
  type: "as_replica_of_clause";
  asReplicaOfKw: [Keyword<"AS">, Keyword<"REPLICA">, Keyword<"OF">];
  view: EntityName;
}

// DROP VIEW
export interface DropViewStmt extends BaseNode {
  type: "drop_view_stmt";
  dropKw: Keyword<"DROP">;
  kind?: RelationKind;
  viewKw: Keyword<"VIEW">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  views: ListExpr<EntityName>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// ALTER VIEW
export interface AlterViewStmt extends BaseNode {
  type: "alter_view_stmt";
  alterKw: Keyword<"ALTER">;
  kind?: RelationKind;
  viewKw: Keyword<"VIEW">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
  columns?: ParenExpr<ListExpr<Identifier>>;
  actions: ListExpr<AlterViewAction | AsClause<SubSelect>>;
}

// REFRESH MATERIALIZED VIEW
export interface RefreshMaterializedViewStmt extends BaseNode {
  type: "refresh_materialized_view_stmt";
  refreshMaterializedViewKw: [
    Keyword<"REFRESH">,
    Keyword<"MATERIALIZED">,
    Keyword<"VIEW">
  ];
  concurrentlyKw?: Keyword<"CONCURRENTLY">;
  name: EntityName;
  clauses: WithDataClause[];
}
