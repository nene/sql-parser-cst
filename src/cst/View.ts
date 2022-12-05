import { AlterActionSetOptions } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { BigqueryOptions } from "./Bigquery";
import { Identifier, ListExpr, ParenExpr, Table } from "./Expr";
import { ClusterByClause, PartitionByClause, SubSelect } from "./Select";

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
  name: Table;
  columns?: ParenExpr<ListExpr<Identifier>>;
  options: CreateViewOption[];
  asKw: Keyword<"AS">;
  expr: SubSelect;
}

type CreateViewOption = BigqueryOptions | ClusterByClause | PartitionByClause;

// DROP VIEW
export interface DropViewStmt extends BaseNode {
  type: "drop_view_stmt";
  dropKw: Keyword<"DROP">;
  materializedKw?: Keyword<"MATERIALIZED">;
  viewKw: Keyword<"VIEW">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  views: ListExpr<Table>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// ALTER VIEW
export interface AlterViewStmt extends BaseNode {
  type: "alter_view_stmt";
  alterKw: Keyword<"ALTER">;
  materializedKw?: Keyword<"MATERIALIZED">;
  viewKw: Keyword<"VIEW">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
  actions: AlterActionSetOptions[];
}
