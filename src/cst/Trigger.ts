import { BaseNode, Keyword } from "./Base";
import { RelationKind } from "./CreateTable";
import { Expr, Identifier, ListExpr, EntityName, ParenExpr } from "./Expr";
import { BlockStmt } from "./ProceduralLanguage";

export type AllTriggerNodes =
  | AllTriggerStatements
  | TriggerEvent
  | ForEachClause
  | WhenClause
  | ExecuteClause;

export type AllTriggerStatements = CreateTriggerStmt | DropTriggerStmt;

// CREATE TRIGGER
export interface CreateTriggerStmt extends BaseNode {
  type: "create_trigger_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  kind?: RelationKind;
  triggerKw: Keyword<"TRIGGER">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  event: TriggerEvent;
  clauses: TriggerClause[];
  body: BlockStmt | ExecuteClause;
}

export interface TriggerEvent extends BaseNode {
  type: "trigger_event";
  timeKw?: Keyword<"BEFORE" | "AFTER"> | [Keyword<"INSTEAD">, Keyword<"OF">];
  eventKw: Keyword<"INSERT" | "DELETE" | "UPDATE" | "TRUNCATE">;
  ofKw?: Keyword<"OF">;
  columns?: ListExpr<Identifier>;
  onKw: Keyword<"ON">;
  table: EntityName;
}

type TriggerClause = ForEachClause | WhenClause;

export interface ForEachClause extends BaseNode {
  type: "for_each_clause";
  forEachKw: [Keyword<"FOR">, Keyword<"EACH">];
  itemKw: Keyword<"ROW">;
}

export interface WhenClause extends BaseNode {
  type: "when_clause";
  whenKw?: Keyword<"WHEN">;
  expr: Expr;
}

export interface ExecuteClause extends BaseNode {
  type: "execute_clause";
  executeKw: Keyword<"EXECUTE">;
  functionKw: Keyword<"FUNCTION" | "PROCEDURE">;
  name: EntityName;
  args: ParenExpr<ListExpr<Expr>>;
}

// DROP TRIGGER
export interface DropTriggerStmt extends BaseNode {
  type: "drop_trigger_stmt";
  dropTriggerKw: [Keyword<"DROP">, Keyword<"TRIGGER">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  trigger: EntityName;
}
