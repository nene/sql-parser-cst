import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import {
  Expr,
  Identifier,
  ListExpr,
  MemberExpr,
  ParenExpr,
  TableRef,
} from "./Expr";
import { Default, OrAlternateAction, UpsertOption } from "./Insert";
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
  options: UpsertOption[];
  orAction?: OrAlternateAction;
  tables: ListExpr<TableRef | Alias<TableRef>>;
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
