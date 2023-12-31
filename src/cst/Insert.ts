import { BaseNode, Keyword } from "./Base";
import {
  Expr,
  Identifier,
  ListExpr,
  ParenExpr,
  EntityName,
  RowConstructor,
} from "./Expr";
import { Alias } from "./Alias";
import {
  PartitionedTable,
  ReturningClause,
  SortSpecification,
  SubSelect,
  WhereClause,
  WithClause,
} from "./Select";
import { ColumnAssignment, SetClause } from "./Update";
import { MysqlHint } from "./Mysql";

export type AllInsertNodes =
  | InsertStmt
  | InsertClause
  | OrAlternateAction
  | ValuesClause
  | DefaultValues
  | Default
  | RowAliasClause
  | UpsertClause
  | UpsertActionNothing
  | UpsertActionUpdate
  | OnDuplicateKeyUpdateClause;

// INSERT INTO
export interface InsertStmt extends BaseNode {
  type: "insert_stmt";
  clauses: (
    | WithClause
    | InsertClause
    | (ValuesClause | SubSelect | DefaultValues | SetClause)
    | RowAliasClause
    | UpsertClause
    | OnDuplicateKeyUpdateClause
    | ReturningClause
  )[];
}

export interface InsertClause extends BaseNode {
  type: "insert_clause";
  insertKw: Keyword<"INSERT" | "REPLACE">;
  hints: MysqlHint[];
  orAction?: OrAlternateAction;
  intoKw?: Keyword<"INTO">;
  table: EntityName | Alias<EntityName> | PartitionedTable;
  columns?: ParenExpr<ListExpr<Identifier>>;
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

// only in MySQL
export interface RowAliasClause extends BaseNode {
  type: "row_alias_clause";
  asKw: Keyword<"AS">;
  rowAlias: Identifier;
  columnAliases?: ParenExpr<ListExpr<Identifier>>;
}
export interface OnDuplicateKeyUpdateClause extends BaseNode {
  type: "on_duplicate_key_update_clause";
  onDuplicateKeyUpdateKw: [
    Keyword<"ON">,
    Keyword<"DUPLICATE">,
    Keyword<"KEY">,
    Keyword<"UPDATE">
  ];
  assignments: ListExpr<ColumnAssignment>;
}
