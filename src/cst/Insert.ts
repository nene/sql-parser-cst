import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr, ParenExpr, EntityName } from "./Expr";
import { Alias } from "./Alias";
import {
  ReturningClause,
  SortSpecification,
  SubSelect,
  WhereClause,
  WithClause,
} from "./Select";
import { SetClause } from "./Update";
import { MysqlHint } from "./Mysql";

export type AllInsertNodes =
  | InsertStmt
  | InsertClause
  | InsertColumnsClause
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
    | InsertColumnsClause
    | (ValuesClause | SubSelect | DefaultValues | SetClause)
    | UpsertClause
    | ReturningClause
  )[];
}

export interface InsertClause extends BaseNode {
  type: "insert_clause";
  insertKw: Keyword<"INSERT" | "REPLACE">;
  hints: MysqlHint[];
  orAction?: OrAlternateAction;
  intoKw?: Keyword<"INTO">;
  table: EntityName | Alias<EntityName>;
}

export interface InsertColumnsClause extends BaseNode {
  type: "insert_columns_clause";
  columns: ParenExpr<ListExpr<Identifier>>;
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
  defaultValuesKw: [Keyword<"DEFAULT">, Keyword<"VALUES">];
}

export interface Default extends BaseNode {
  type: "default";
  defaultKw: Keyword<"DEFAULT">;
}

// only in SQLite
export interface UpsertClause extends BaseNode {
  type: "upsert_clause";
  onConflictKw: [Keyword<"ON">, Keyword<"CONFLICT">];
  columns?: ParenExpr<ListExpr<SortSpecification | Identifier>>;
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
