import { BaseNode, Keyword } from "./Base";
import { Identifier } from "./Expr";

export type AllPublicationNodes = AllPublicationStatements;

export type AllPublicationStatements = CreatePublicationStmt;

// CREATE PUBLICATION
export interface CreatePublicationStmt extends BaseNode {
  type: "create_publication_stmt";
  createPublicationKw: [Keyword<"CREATE">, Keyword<"PUBLICATION">];
  name: Identifier;
}
