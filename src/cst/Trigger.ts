import { BaseNode, Keyword } from "./Base";
import { RelationKind } from "./CreateTable";
import { Expr, Identifier, ListExpr, EntityName, ParenExpr } from "./Expr";
import { BlockStmt } from "./ProceduralLanguage";

export type AllTriggerNodes =
  | AllTriggerStatements
  | TriggerEvent
  | TriggerTarget
  | ForEachClause
  | WhenClause
  | FromReferencedTableClause
  | TriggerTimingClause
  | TriggerReferencingClause
  | TriggerTransition
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
  timeKw?: Keyword<"BEFORE" | "AFTER"> | [Keyword<"INSTEAD">, Keyword<"OF">];
  event: TriggerEvent;
  target: TriggerTarget;
  clauses: TriggerClause[];
  body: BlockStmt | ExecuteClause;
}

export interface TriggerEvent extends BaseNode {
  type: "trigger_event";
  eventKw: Keyword<"INSERT" | "DELETE" | "UPDATE" | "TRUNCATE">;
  ofKw?: Keyword<"OF">;
  columns?: ListExpr<Identifier>;
}

export interface TriggerTarget extends BaseNode {
  type: "trigger_target";
  onKw: Keyword<"ON">;
  table: EntityName;
}

type TriggerClause =
  | ForEachClause
  | WhenClause
  | FromReferencedTableClause
  | TriggerTimingClause
  | TriggerReferencingClause;

export interface ForEachClause extends BaseNode {
  type: "for_each_clause";
  forEachKw: [Keyword<"FOR">, Keyword<"EACH">] | Keyword<"FOR">;
  itemKw: Keyword<"ROW" | "STATEMENT">;
}

export interface WhenClause extends BaseNode {
  type: "when_clause";
  whenKw?: Keyword<"WHEN">;
  expr: Expr;
}

// PostgreSQL
export interface FromReferencedTableClause extends BaseNode {
  type: "from_referenced_table_clause";
  fromKw: Keyword<"FROM">;
  table: EntityName;
}

// PostgreSQL
export interface TriggerTimingClause extends BaseNode {
  type: "trigger_timing_clause";
  timingKw?:
    | [Keyword<"NOT">, Keyword<"DEFERRABLE">]
    | Keyword<"DEFERRABLE">
    | [Keyword<"INITIALLY">, Keyword<"DEFERRED">]
    | [Keyword<"INITIALLY">, Keyword<"IMMEDIATE">]
    | [Keyword<"DEFERRABLE">, Keyword<"INITIALLY">, Keyword<"DEFERRED">]
    | [Keyword<"DEFERRABLE">, Keyword<"INITIALLY">, Keyword<"IMMEDIATE">];
}

// PostgreSQL
export interface TriggerReferencingClause extends BaseNode {
  type: "trigger_referencing_clause";
  referencingKw: Keyword<"REFERENCING">;
  transitions: ListExpr<TriggerTransition>;
}

// PostgreSQL
export interface TriggerTransition extends BaseNode {
  type: "trigger_transition";
  oldOrNewKw: Keyword<"OLD" | "NEW">;
  rowOrTableKw: Keyword<"TABLE" | "ROW">;
  asKw?: Keyword<"AS">;
  name: Identifier;
}

// PostgreSQL
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
