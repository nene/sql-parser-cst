import { AlterSequenceAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { RelationKind } from "./CreateTable";
import { DataType } from "./DataType";
import { EntityName, Expr, ListExpr } from "./Expr";

export type AllSequenceNodes =
  | AllSequenceStatements
  | SequenceOptionList
  | SequenceOption;

export type AllSequenceStatements =
  | CreateSequenceStmt
  | AlterSequenceStmt
  | DropSequenceStmt;

// CREATE SEQUENCE
export interface CreateSequenceStmt extends BaseNode {
  type: "create_sequence_stmt";
  createKw: Keyword<"CREATE">;
  kind?: RelationKind;
  sequenceKw: Keyword<"SEQUENCE">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
  options: SequenceOption[];
}

// A container to allow usage inside ParenExpr
export interface SequenceOptionList extends BaseNode {
  type: "sequence_option_list";
  options: SequenceOption[];
}

export type SequenceOption =
  | SequenceOptionAsType
  | SequenceOptionIncrement
  | SequenceOptionStart
  | SequenceOptionRestart
  | SequenceOptionMinvalue
  | SequenceOptionMaxvalue
  | SequenceOptionNoMinvalue
  | SequenceOptionNoMaxvalue
  | SequenceOptionCache
  | SequenceOptionCycle
  | SequenceOptionNoCycle
  | SequenceOptionOwnedBy;

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

interface SequenceOptionMinvalue extends BaseNode {
  type: "sequence_option_minvalue";
  minvalueKw: Keyword<"MINVALUE">;
  value: Expr;
}

interface SequenceOptionMaxvalue extends BaseNode {
  type: "sequence_option_maxvalue";
  maxvalueKw: Keyword<"MAXVALUE">;
  value: Expr;
}

interface SequenceOptionNoMinvalue extends BaseNode {
  type: "sequence_option_no_minvalue";
  noMinvalueKw: [Keyword<"NO">, Keyword<"MINVALUE">];
}

interface SequenceOptionNoMaxvalue extends BaseNode {
  type: "sequence_option_no_maxvalue";
  noMaxvalueKw: [Keyword<"NO">, Keyword<"MAXVALUE">];
}

interface SequenceOptionCache extends BaseNode {
  type: "sequence_option_cache";
  cacheKw: Keyword<"CACHE">;
  value: Expr;
}

interface SequenceOptionCycle extends BaseNode {
  type: "sequence_option_cycle";
  cycleKw: Keyword<"CYCLE">;
}

interface SequenceOptionNoCycle extends BaseNode {
  type: "sequence_option_no_cycle";
  noCycleKw: [Keyword<"NO">, Keyword<"CYCLE">];
}

interface SequenceOptionOwnedBy extends BaseNode {
  type: "sequence_option_owned_by";
  ownedByKw: [Keyword<"OWNED">, Keyword<"BY">];
  owner: EntityName;
}

export interface AlterSequenceStmt extends BaseNode {
  type: "alter_sequence_stmt";
  alterKw: Keyword<"ALTER">;
  sequenceKw: Keyword<"SEQUENCE">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  sequence: EntityName;
  actions: (SequenceOption | AlterSequenceAction)[];
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
