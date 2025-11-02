import { AlterPublicationAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";

export type AllPublicationNodes =
  | AllPublicationStatements
  | ForPublicationObjectsClause
  | AllPublicationObject;

export type AllPublicationStatements =
  | CreatePublicationStmt
  | AlterPublicationStmt
  | DropPublicationStmt;

// CREATE PUBLICATION
export interface CreatePublicationStmt extends BaseNode {
  type: "create_publication_stmt";
  createPublicationKw: [Keyword<"CREATE">, Keyword<"PUBLICATION">];
  name: Identifier;
  clauses: ForPublicationObjectsClause[];
}

export interface ForPublicationObjectsClause extends BaseNode {
  type: "for_publication_objects_clause";
  forKw: Keyword<"FOR">;
  publicationObjects: ListExpr<AllPublicationObject>;
}

export interface AllPublicationObject extends BaseNode {
  type: "all_publication_object";
  allKw: Keyword<"ALL">;
  typesKw: Keyword<"TABLES" | "SEQUENCES">;
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
