import { AlterPublicationAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";

export type AllPublicationNodes = AllPublicationStatements;

export type AllPublicationStatements =
  | CreatePublicationStmt
  | AlterPublicationStmt
  | DropPublicationStmt;

// CREATE PUBLICATION
export interface CreatePublicationStmt extends BaseNode {
  type: "create_publication_stmt";
  createPublicationKw: [Keyword<"CREATE">, Keyword<"PUBLICATION">];
  name: Identifier;
}

// ALTER PUBLICATION
export interface AlterPublicationStmt extends BaseNode {
  type: "alter_publication_stmt";
  alterPublicationKw: [Keyword<"ALTER">, Keyword<"PUBLICATION">];
  name: Identifier;
  action: AlterPublicationAction;
}

// DROP PUBLICATION
export interface DropPublicationStmt extends BaseNode {
  type: "drop_publication_stmt";
  dropPublicationKw: [Keyword<"DROP">, Keyword<"PUBLICATION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  names: ListExpr<Identifier>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
