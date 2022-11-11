import { BaseNode, Keyword } from "./Base";
import { ColumnRef, Expr, ListExpr, ParenExpr, TableRef } from "./Expr";
import {
  Alias,
  ReturningClause,
  SetClause,
  SortSpecification,
  SubSelect,
  WhereClause,
  WithClause,
} from "./Node";

export type AllInsertNodes =
  | InsertStmt
  | InsertClause
  | UpsertOption
  | OrAlternateAction
  | ValuesClause
  | RowConstructor
  | DefaultValues
  | Default
  | UpsertClause
  | UpsertActionNothing
  | UpsertActionUpdate;

// INSERT INTO
export interface InsertStmt extends BaseNode {
  type: "insert_stmt";
  clauses: (
    | WithClause
    | InsertClause
    | (ValuesClause | SubSelect | DefaultValues)
    | UpsertClause
    | ReturningClause
  )[];
}

export interface InsertClause extends BaseNode {
  type: "insert_clause";
  insertKw: Keyword<"INSERT" | "REPLACE">;
  options: UpsertOption[];
  orAction?: OrAlternateAction;
  intoKw?: Keyword<"INTO">;
  table: TableRef | Alias<TableRef>;
  columns?: ParenExpr<ListExpr<ColumnRef>>;
}

// Only in MySQL INSERT & UPDATE clauses
export interface UpsertOption extends BaseNode {
  type: "upsert_option";
  kw: Keyword<"LOW_PRIORITY" | "DELAYED" | "HIGH_PRIORITY" | "IGNORE">;
}

// Only in SQLite
export interface OrAlternateAction extends BaseNode {
  type: "or_alternate_action";
  orKw: Keyword<"OR">;
  actionKw: Keyword<"ABORT" | "FAIL" | "IGNORE" | "REPLACE" | "ROLLBACK">;
}

export interface ValuesClause extends BaseNode {
  type: "values_clause";
  valuesKw: Keyword<"VALUES" | "VALUE">;
  values: ListExpr<ParenExpr<ListExpr<Expr | Default>> | RowConstructor>;
}

// only in MySQL
export interface RowConstructor extends BaseNode {
  type: "row_constructor";
  rowKw: Keyword<"ROW">;
  row: ParenExpr<ListExpr<Expr | Default>>;
}

export interface DefaultValues extends BaseNode {
  type: "default_values";
  kw: [Keyword<"DEFAULT">, Keyword<"VALUES">];
}

export interface Default extends BaseNode {
  type: "default";
  kw: Keyword<"DEFAULT">;
}

// only in SQLite
export interface UpsertClause extends BaseNode {
  type: "upsert_clause";
  onConflictKw: [Keyword<"ON">, Keyword<"CONFLICT">];
  columns?: ParenExpr<ListExpr<SortSpecification | ColumnRef>>;
  where?: WhereClause;
  doKw: Keyword<"DOR">;
  action: UpsertActionNothing | UpsertActionUpdate;
}

export interface UpsertActionNothing extends BaseNode {
  type: "upsert_action_nothing";
  nothingKw: Keyword<"NOTHING">;
}

export interface UpsertActionUpdate extends BaseNode {
  type: "upsert_action_update";
  updateKw: Keyword<"UPDATE">;
  set: SetClause;
  where?: WhereClause;
}
