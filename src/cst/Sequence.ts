import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { EntityName, Expr, ListExpr } from "./Expr";

export type AllSequenceNodes =
  | AllSequenceStatements
  | SequenceKind
  | SequenceOption;

export type AllSequenceStatements = CreateSequenceStmt | DropSequenceStmt;

// CREATE SEQUENCE
export interface CreateSequenceStmt extends BaseNode {
  type: "create_sequence_stmt";
  createKw: Keyword<"CREATE">;
  kind?: SequenceKind;
  sequenceKw: Keyword<"SEQUENCE">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  options: SequenceOption[];
}

export interface SequenceKind extends BaseNode {
  type: "sequence_kind";
  kindKw: Keyword<"TEMP" | "TEMPORARY" | "UNLOGGED">;
}

type SequenceOption = SequenceOptionAsType | SequenceOptionIncrement;

interface SequenceOptionAsType extends BaseNode {
  type: "sequence_option_as_type";
  asKw: Keyword<"AS">;
  dataType: DataType;
}

interface SequenceOptionIncrement extends BaseNode {
  type: "sequence_option_increment";
  incrementKw: Keyword<"INCREMENT">;
  byKw?: Keyword<"BY">;
  value: Expr;
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
