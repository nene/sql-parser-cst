import {
  AlterActionOwnerTo,
  AlterActionRename,
  AlterActionSetPostgresqlOptions,
} from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr, ParenExpr } from "./Expr";
import { PostgresqlWithOptions } from "./Node";
import { RelationExpr, WhereClause } from "./Select";

export type AllPublicationNodes =
  | AllPublicationStatements
  | ForPublicationObjectsClause
  | AllPublicationObject
  | PublicationObjectTable
  | PublicationObjectTablesInSchema
  | AlterActionAddPublicationObjects
  | AlterActionDropPublicationObjects;

export type AllPublicationStatements =
  | CreatePublicationStmt
  | AlterPublicationStmt
  | DropPublicationStmt;

// CREATE PUBLICATION
export interface CreatePublicationStmt extends BaseNode {
  type: "create_publication_stmt";
  createPublicationKw: [Keyword<"CREATE">, Keyword<"PUBLICATION">];
  name: Identifier;
  clauses: (ForPublicationObjectsClause | PostgresqlWithOptions)[];
}

export interface ForPublicationObjectsClause extends BaseNode {
  type: "for_publication_objects_clause";
  forKw: Keyword<"FOR">;
  publicationObjects:
    | ListExpr<AllPublicationObject>
    | ListExpr<PublicationObjectTable | PublicationObjectTablesInSchema>;
}

export interface AllPublicationObject extends BaseNode {
  type: "all_publication_object";
  allKw: Keyword<"ALL">;
  typesKw: Keyword<"TABLES" | "SEQUENCES">;
}

export interface PublicationObjectTable extends BaseNode {
  type: "publication_object_table";
  tableKw: Keyword<"TABLE">;
  table: RelationExpr;
  columns?: ParenExpr<ListExpr<Identifier>>;
  where?: WhereClause;
}

export interface PublicationObjectTablesInSchema extends BaseNode {
  type: "publication_object_tables_in_schema";
  tablesInSchemaKw: [Keyword<"TABLES">, Keyword<"IN">, Keyword<"SCHEMA">];
  schema: Identifier | Keyword<"CURRENT_SCHEMA">;
}

// ALTER PUBLICATION
export interface AlterPublicationStmt extends BaseNode {
  type: "alter_publication_stmt";
  alterPublicationKw: [Keyword<"ALTER">, Keyword<"PUBLICATION">];
  name: Identifier;
  action: AlterPublicationAction;
}

type AlterPublicationAction =
  | AlterActionRename
  | AlterActionOwnerTo
  | AlterActionSetPostgresqlOptions
  | AlterActionAddPublicationObjects
  | AlterActionDropPublicationObjects;

export interface AlterActionAddPublicationObjects extends BaseNode {
  type: "alter_action_add_publication_objects";
  addKw: Keyword<"ADD">;
  publicationObjects: ListExpr<
    PublicationObjectTable | PublicationObjectTablesInSchema
  >;
}

export interface AlterActionDropPublicationObjects extends BaseNode {
  type: "alter_action_drop_publication_objects";
  dropKw: Keyword<"DROP">;
  publicationObjects: ListExpr<
    PublicationObjectTable | PublicationObjectTablesInSchema
  >;
}

// DROP PUBLICATION
export interface DropPublicationStmt extends BaseNode {
  type: "drop_publication_stmt";
  dropPublicationKw: [Keyword<"DROP">, Keyword<"PUBLICATION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  names: ListExpr<Identifier>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
