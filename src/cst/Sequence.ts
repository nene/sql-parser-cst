import { BaseNode, Keyword } from "./Base";
import { EntityName, ListExpr } from "./Expr";

export type AllSequenceNodes = AllSequenceStatements | SequenceKind;

export type AllSequenceStatements = CreateSequenceStmt | DropSequenceStmt;

// CREATE SEQUENCE
export interface CreateSequenceStmt extends BaseNode {
  type: "create_sequence_stmt";
  createKw: Keyword<"CREATE">;
  kind?: SequenceKind;
  sequenceKw: Keyword<"SEQUENCE">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
}

export interface SequenceKind extends BaseNode {
  type: "sequence_kind";
  kindKw: Keyword<"TEMP" | "TEMPORARY" | "UNLOGGED">;
}

// DROP SEQUENCE
export interface DropSequenceStmt extends BaseNode {
  type: "drop_sequence_stmt";
  dropKw: Keyword<"DROP">;
  sequenceKw: Keyword<"SEQUENCE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  sequences: ListExpr<EntityName>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
