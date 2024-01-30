import { AlterActionSetOptions } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./dialects/Bigquery";
import { Identifier, ListExpr, ParenExpr, EntityName } from "./Expr";
import { PostgresqlWithOptions } from "./Node";
import { ClusterByClause } from "./OtherClauses";
import { AsClause } from "./ProcClause";
import { PartitionByClause, SubSelect } from "./Select";

export type AllViewNodes = AllViewStatements | WithCheckOptionClause;

export type AllViewStatements = CreateViewStmt | DropViewStmt | AlterViewStmt;

// CREATE VIEW
export interface CreateViewStmt extends BaseNode {
  type: "create_view_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  materializedKw?: Keyword<"MATERIALIZED">;
  viewKw: Keyword<"VIEW">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  columns?: ParenExpr<ListExpr<Identifier>>;
  clauses: CreateViewClause[];
}

type CreateViewClause =
  | BigqueryOptions
  | PostgresqlWithOptions
  | WithCheckOptionClause
  | ClusterByClause
  | PartitionByClause
  | AsClause<SubSelect>;

// PostgreSQL
export interface WithCheckOptionClause extends BaseNode {
  type: "with_check_option_clause";
  withKw: Keyword<"WITH">;
  levelKw?: Keyword<"CASCADED" | "LOCAL">;
  checkOptionKw: [Keyword<"CHECK">, Keyword<"OPTION">];
}

// DROP VIEW
export interface DropViewStmt extends BaseNode {
  type: "drop_view_stmt";
  dropKw: Keyword<"DROP">;
  materializedKw?: Keyword<"MATERIALIZED">;
  viewKw: Keyword<"VIEW">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  views: ListExpr<EntityName>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// ALTER VIEW
export interface AlterViewStmt extends BaseNode {
  type: "alter_view_stmt";
  alterKw: Keyword<"ALTER">;
  materializedKw?: Keyword<"MATERIALIZED">;
  viewKw: Keyword<"VIEW">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
  columns?: ParenExpr<ListExpr<Identifier>>;
  actions: (AlterActionSetOptions | AsClause<SubSelect>)[];
}
