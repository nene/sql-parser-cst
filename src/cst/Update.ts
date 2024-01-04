import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import {
  Expr,
  Identifier,
  ListExpr,
  MemberExpr,
  ParenExpr,
  EntityName,
} from "./Expr";
import { Default, OrAlternateAction } from "./Insert";
import { MysqlModifier } from "./Mysql";
import {
  FromClause,
  LimitClause,
  OrderByClause,
  ReturningClause,
  WhereClause,
  WithClause,
} from "./Select";

export type AllUpdateNodes =
  | UpdateStmt
  | UpdateClause
  | SetClause
  | ColumnAssignment;

// UPDATE
export interface UpdateStmt extends BaseNode {
  type: "update_stmt";
  clauses: (
    | WithClause
    | UpdateClause
    | SetClause
    | WhereClause
    | FromClause
    | OrderByClause
    | LimitClause
    | ReturningClause
  )[];
}

export interface UpdateClause extends BaseNode {
  type: "update_clause";
  updateKw: Keyword<"UPDATE">;
  modifiers: MysqlModifier[];
  orAction?: OrAlternateAction;
  tables: ListExpr<EntityName | Alias<EntityName>>;
}

export interface SetClause extends BaseNode {
  type: "set_clause";
  setKw: Keyword<"SET">;
  assignments: ListExpr<ColumnAssignment>;
}

export interface ColumnAssignment extends BaseNode {
  type: "column_assignment";
  column: Identifier | MemberExpr | ParenExpr<ListExpr<Identifier>>;
  expr: Expr | Default;
}
