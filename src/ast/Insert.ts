import { Alias } from "./Alias";
import { BaseNode } from "./Base";
import { EntityName, Expr, Identifier } from "./Expr";
import { SubSelect, WithClause } from "./Select";

export type AllInsertNodes = InsertStmt | ValuesClause | DefaultValues;

export interface InsertStmt extends BaseNode {
  type: "insert_stmt";
  with?: WithClause;
  orAction?: "abort" | "fail" | "ignore" | "replace" | "rollback";
  table: EntityName | Alias<EntityName>;
  columns?: Identifier[];
  values: ValuesClause | DefaultValues | SubSelect;
  // upsert?: UpsertClause;
  returning?: (Expr | Alias<Expr>)[];
}

export interface ValuesClause extends BaseNode {
  type: "values_clause";
  values: Expr[][];
}

export interface DefaultValues extends BaseNode {
  type: "default_values";
}

// only in SQLite
// export interface UpsertClause extends BaseNode {
//   type: "upsert_clause";
//   columns?: (SortSpecification | Identifier)[];
//   where?: Expr;
//   action: UpsertActionNothing | UpsertActionUpdate;
// }

// export interface UpsertActionNothing extends BaseNode {
//   type: "upsert_action_nothing";
// }

// export interface UpsertActionUpdate extends BaseNode {
//   type: "upsert_action_update";
//   set: SetClause;
//   where?: Expr;
// }
