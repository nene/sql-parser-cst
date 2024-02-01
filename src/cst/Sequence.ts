import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { EntityName, Expr, ListExpr } from "./Expr";

export type AllSequenceNodes =
  | AllSequenceStatements
  | SequenceKind
  | SequenceOption;

export type AllSequenceStatements =
  | CreateSequenceStmt
  | AlterSequenceStmt
  | DropSequenceStmt;

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

type SequenceOption =
  | SequenceOptionAsType
  | SequenceOptionIncrement
  | SequenceOptionStart
  | SequenceOptionRestart;

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

interface SequenceOptionStart extends BaseNode {
  type: "sequence_option_start";
  startKw: Keyword<"START">;
  withKw?: Keyword<"WITH">;
  value: Expr;
}

interface SequenceOptionRestart extends BaseNode {
  type: "sequence_option_restart";
  restartKw: Keyword<"RESTART">;
  withKw?: Keyword<"WITH">;
  value?: Expr;
}

export interface AlterSequenceStmt extends BaseNode {
  type: "alter_sequence_stmt";
  alterKw: Keyword<"ALTER">;
  sequenceKw: Keyword<"SEQUENCE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  sequence: EntityName;
  actions: SequenceOption[];
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
