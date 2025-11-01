import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";

export type AllPublicationNodes = AllPublicationStatements;

export type AllPublicationStatements =
  | CreatePublicationStmt
  | DropPublicationStmt;

// CREATE PUBLICATION
export interface CreatePublicationStmt extends BaseNode {
  type: "create_publication_stmt";
  createPublicationKw: [Keyword<"CREATE">, Keyword<"PUBLICATION">];
  name: Identifier;
}

export interface DropPublicationStmt extends BaseNode {
  type: "drop_publication_stmt";
  dropPublicationKw: [Keyword<"DROP">, Keyword<"PUBLICATION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  names: ListExpr<Identifier>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
