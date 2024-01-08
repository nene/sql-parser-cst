import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr, ParenExpr, EntityName } from "./Expr";
import { DefaultValues, ValuesClause } from "./Insert";
import { SelectStmt, WithClause } from "./Select";
import { SetClause } from "./Update";

export type AllMergeNodes =
  | MergeStmt
  | MergeClause
  | MergeWhenClause
  | MergeWhenCondition
  | MergeActionDoNothing
  | MergeActionDelete
  | MergeActionUpdate
  | MergeActionInsert
  | MergeActionInsertRowClause;

// BigQuery, PostgreSQL
export interface MergeStmt extends BaseNode {
  type: "merge_stmt";
  clauses: (WithClause | MergeClause | MergeWhenClause)[];
}

export interface MergeClause extends BaseNode {
  type: "merge_clause";
  mergeKw: Keyword<"MERGE">;
  intoKw: Keyword<"INTO">;
  target: EntityName | Alias<EntityName>;
  usingKw: Keyword<"USING">;
  source:
    | EntityName
    | ParenExpr<SelectStmt>
    | Alias<EntityName | ParenExpr<SelectStmt>>;
  onKw: Keyword<"ON">;
  condition: Expr;
}

export interface MergeWhenClause extends BaseNode {
  type: "merge_when_clause";
  whenKw: Keyword<"WHEN">;
  matchedKw: Keyword<"MATCHED"> | [Keyword<"NOT">, Keyword<"MATCHED">];
  byKw?:
    | [Keyword<"BY">, Keyword<"TARGET">]
    | [Keyword<"BY">, Keyword<"SOURCE">];
  condition?: MergeWhenCondition;
  thenKw: Keyword<"THEN">;
  action:
    | MergeActionDoNothing
    | MergeActionDelete
    | MergeActionUpdate
    | MergeActionInsert;
}

export interface MergeWhenCondition extends BaseNode {
  type: "merge_when_condition";
  andKw: Keyword<"AND">;
  expr: Expr;
}

// PostgreSQL
export interface MergeActionDoNothing extends BaseNode {
  type: "merge_action_do_nothing";
  doNothingKw: [Keyword<"DO">, Keyword<"NOTHING">];
}

// PostgreSQL, BigQuery
export interface MergeActionDelete extends BaseNode {
  type: "merge_action_delete";
  deleteKw: Keyword<"DELETE">;
}

// PostgreSQL, BigQuery
export interface MergeActionUpdate extends BaseNode {
  type: "merge_action_update";
  updateKw: Keyword<"UPDATE">;
  set: SetClause;
}

// PostgreSQL, BigQuery
export interface MergeActionInsert extends BaseNode {
  type: "merge_action_insert";
  insertKw: Keyword<"INSERT">;
  columns?: ParenExpr<ListExpr<Identifier>>;
  clauses: (ValuesClause | DefaultValues | MergeActionInsertRowClause)[];
}

// BigQuery
export interface MergeActionInsertRowClause extends BaseNode {
  type: "merge_action_insert_row_clause";
  rowKw: Keyword<"ROW">;
}
