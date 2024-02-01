import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";

export type AllSequenceNodes = AllSequenceStatements | SequenceKind;

export type AllSequenceStatements = CreateSequenceStmt;

// CREATE VIEW
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
