import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr, MemberExpr, ParenExpr } from "./Expr";
import { Default, OrAlternateAction } from "./Insert";
import { MysqlModifier } from "./dialects/Mysql";
import {
  FromClause,
  LimitClause,
  OrderByClause,
  RelationExpr,
  WhereClause,
  WithClause,
} from "./Select";
import { ReturningClause } from "./OtherClauses";

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
  tables: ListExpr<RelationExpr | Alias<RelationExpr>>;
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
