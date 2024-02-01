import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";

export type AllSequenceNodes = AllSequenceStatements;

export type AllSequenceStatements = CreateSequenceStmt;

// CREATE VIEW
export interface CreateSequenceStmt extends BaseNode {
  type: "create_sequence_stmt";
  createKw: Keyword<"CREATE">;
  sequenceKw: Keyword<"SEQUENCE">;
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: EntityName;
}
