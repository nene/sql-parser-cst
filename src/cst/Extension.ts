import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllExtensionNodes = AllExtensionStatements | CreateExtensionClause;

export type AllExtensionStatements = CreateExtensionStmt | DropExtensionStmt;

// CREATE EXTENSION
export interface CreateExtensionStmt extends BaseNode {
  type: "create_extension_stmt";
  createExtensionKw: [Keyword<"CREATE">, Keyword<"EXTENSION">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Identifier;
  withKw?: Keyword<"WITH">;
  clauses: CreateExtensionClause[];
}

type CreateExtensionClause =
  | ExtensionSchemaClause
  | ExtensionVersionClause
  | ExtensionCascadeClause;

export interface ExtensionSchemaClause extends BaseNode {
  type: "extension_schema_clause";
  schemaKw: Keyword<"SCHEMA">;
  name: Identifier;
}

export interface ExtensionVersionClause extends BaseNode {
  type: "extension_version_clause";
  versionKw: Keyword<"VERSION">;
  name: Identifier | StringLiteral;
}

export interface ExtensionCascadeClause extends BaseNode {
  type: "extension_cascade_clause";
  cascadeKw: Keyword<"CASCADE">;
}

// DROP EXTENSION
export interface DropExtensionStmt extends BaseNode {
  type: "drop_extension_stmt";
  dropExtensionKw: [Keyword<"DROP">, Keyword<"EXTENSION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  names: ListExpr<Identifier>;
  behaviorKw?: Keyword<"CASCADE"> | Keyword<"RESTRICT">;
}
