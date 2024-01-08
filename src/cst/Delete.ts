import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { ListExpr } from "./Expr";
import { MysqlModifier } from "./dialects/Mysql";
import {
  FromClause,
  LimitClause,
  OrderByClause,
  PartitionedTable,
  RelationExpr,
  WhereClause,
  WithClause,
} from "./Select";
import { ReturningClause, WhereCurrentOfClause } from "./OtherClauses";

export type AllDeleteNodes = DeleteStmt | DeleteClause;

// DELETE FROM
export interface DeleteStmt extends BaseNode {
  type: "delete_stmt";
  clauses: (
    | WithClause
    | DeleteClause
    | WhereClause
    | WhereCurrentOfClause
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
  tables: ListExpr<RelationExpr | Alias<RelationExpr> | PartitionedTable>;
}
