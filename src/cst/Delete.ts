import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";
import { Hint } from "./Mysql";
import {
  LimitClause,
  OrderByClause,
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
  )[];
}

export interface DeleteClause extends BaseNode {
  type: "delete_clause";
  deleteKw: Keyword<"DELETE">;
  hints: Hint[];
  fromKw?: Keyword<"FROM">;
  table: EntityName | Alias<EntityName>;
}
