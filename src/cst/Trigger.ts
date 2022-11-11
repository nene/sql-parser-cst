import { BaseNode, Keyword } from "./Base";
import { ColumnRef, Expr, ListExpr, TableRef } from "./Expr";
import { Statement } from "./Statement";

export type AllTriggerNodes =
  | CreateTriggerStmt
  | DropTriggerStmt
  | TriggerEvent
  | TriggerCondition
  | TriggerBody
  | TriggerCondition
  | TriggerBody;

// CREATE TRIGGER
export interface CreateTriggerStmt extends BaseNode {
  type: "create_trigger_stmt";
  createKw: Keyword<"CREATE">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  triggerKw: Keyword<"TRIGGER">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: TableRef;
  event: TriggerEvent;
  onKw: Keyword<"ON">;
  table: TableRef;
  forEachRowKw?: [Keyword<"FOR">, Keyword<"EACH">, Keyword<"ROW">];
  condition?: TriggerCondition;
  body: TriggerBody;
}

export interface TriggerEvent extends BaseNode {
  type: "trigger_event";
  timeKw?: Keyword<"BEFORE" | "AFTER"> | [Keyword<"INSTEAD">, Keyword<"OF">];
  eventKw: Keyword<"INSERT" | "DELETE" | "UPDATE">;
  ofKw?: Keyword<"OF">;
  columns?: ListExpr<ColumnRef>;
}

export interface TriggerCondition extends BaseNode {
  type: "trigger_condition";
  whenKw?: Keyword<"WHEN">;
  expr: Expr;
}

export interface TriggerBody extends BaseNode {
  type: "trigger_body";
  beginKw: Keyword<"BEGIN">;
  statements: Statement[];
  endKw: Keyword<"END">;
}

// DROP TRIGGER
export interface DropTriggerStmt extends BaseNode {
  type: "drop_trigger_stmt";
  dropTriggerKw: [Keyword<"DROP">, Keyword<"TRIGGER">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  trigger: TableRef;
}
