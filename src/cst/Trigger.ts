import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr, EntityName } from "./Expr";
import { BlockStmt } from "./ProceduralLanguage";

export type AllTriggerNodes =
  | AllTriggerStatements
  | TriggerEvent
  | TriggerCondition;

export type AllTriggerStatements = CreateTriggerStmt | DropTriggerStmt;

// CREATE TRIGGER
export interface CreateTriggerStmt extends BaseNode {
  type: "create_trigger_stmt";
  createKw: Keyword<"CREATE">;
  temporaryKw?: Keyword<"TEMP" | "TEMPORARY">;
  triggerKw: Keyword<"TRIGGER">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  event: TriggerEvent;
  forEachRowKw?: [Keyword<"FOR">, Keyword<"EACH">, Keyword<"ROW">];
  condition?: TriggerCondition;
  body: BlockStmt;
}

export interface TriggerEvent extends BaseNode {
  type: "trigger_event";
  timeKw?: Keyword<"BEFORE" | "AFTER"> | [Keyword<"INSTEAD">, Keyword<"OF">];
  eventKw: Keyword<"INSERT" | "DELETE" | "UPDATE">;
  ofKw?: Keyword<"OF">;
  columns?: ListExpr<Identifier>;
  onKw: Keyword<"ON">;
  table: EntityName;
}

export interface TriggerCondition extends BaseNode {
  type: "trigger_condition";
  whenKw?: Keyword<"WHEN">;
  expr: Expr;
}

// DROP TRIGGER
export interface DropTriggerStmt extends BaseNode {
  type: "drop_trigger_stmt";
  dropTriggerKw: [Keyword<"DROP">, Keyword<"TRIGGER">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  trigger: EntityName;
}
