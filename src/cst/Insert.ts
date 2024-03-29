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
import { PartitionedTable, SubSelect, WhereClause, WithClause } from "./Select";
import { ColumnAssignment, SetClause } from "./Update";
import { MysqlModifier } from "./dialects/Mysql";
import { ReturningClause } from "./OtherClauses";
import { IndexSpecification } from "./Index";

export type AllInsertNodes =
  | InsertStmt
  | InsertClause
  | OrAlternateAction
  | ValuesClause
  | DefaultValues
  | Default
  | OverridingClause
  | RowAliasClause
  | UpsertClause
  | ConflictTargetOnConstraint
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
    | OverridingClause
    | RowAliasClause
    | UpsertClause
    | OnDuplicateKeyUpdateClause
    | ReturningClause
  )[];
}

export interface InsertClause extends BaseNode {
  type: "insert_clause";
  insertKw: Keyword<"INSERT" | "REPLACE">;
  modifiers: MysqlModifier[];
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

// PostgreSQL
export interface OverridingClause extends BaseNode {
  type: "overriding_clause";
  overridingKw: [
    Keyword<"OVERRIDING">,
    Keyword<"SYSTEM" | "USER">,
    Keyword<"VALUE">
  ];
}

// SQLite, PostgreSQL
export interface UpsertClause extends BaseNode {
  type: "upsert_clause";
  onConflictKw: [Keyword<"ON">, Keyword<"CONFLICT">];
  conflictTarget?:
    | ConflictTargetOnConstraint
    | ParenExpr<ListExpr<IndexSpecification>>;
  where?: WhereClause;
  doKw: Keyword<"DO">;
  action: UpsertActionNothing | UpsertActionUpdate;
}

export interface ConflictTargetOnConstraint extends BaseNode {
  type: "conflict_target_on_constraint";
  onConstraintKw: [Keyword<"ON">, Keyword<"CONSTRAINT">];
  constraint: Identifier;
}

// SQLite, PostgreSQL
export interface UpsertActionNothing extends BaseNode {
  type: "upsert_action_nothing";
  nothingKw: Keyword<"NOTHING">;
}

// SQLite, PostgreSQL
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
