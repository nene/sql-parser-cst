import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { EntityName, ListExpr } from "./Expr";
import { MysqlModifier } from "./dialects/Mysql";
import {
  FromClause,
  LimitClause,
  OrderByClause,
  PartitionedTable,
  ReturningClause,
  WhereClause,
  WithClause,
} from "./Select";

export type AllDeleteNodes = DeleteStmt | DeleteClause;

// DELETE FROM
export interface DeleteStmt extends BaseNode {
  type: "delete_stmt";
  clauses: (
    | WithClause
    | DeleteClause
    | WhereClause
    | ReturningClause
    | OrderByClause
    | LimitClause
    | FromClause
  )[];
}

export interface DeleteClause extends BaseNode {
  type: "delete_clause";
  deleteKw: Keyword<"DELETE">;
  modifiers: MysqlModifier[];
  fromKw?: Keyword<"FROM">;
  tables: ListExpr<EntityName | Alias<EntityName> | PartitionedTable>;
}
