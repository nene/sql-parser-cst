import { AlterSchemaAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import {
  BigqueryOptionDefaultCollate,
  BigqueryOptions,
} from "./dialects/Bigquery";
import { EntityName, FuncCall, Identifier, ListExpr } from "./Expr";

export type AllSchemaStatements =
  | CreateSchemaStmt
  | CreateSchemaAuthorizationClause
  | DropSchemaStmt
  | AlterSchemaStmt;

// CREATE SCHEMA
export interface CreateSchemaStmt extends BaseNode {
  type: "create_schema_stmt";
  createSchemaKw: [Keyword<"CREATE">, Keyword<"SCHEMA" | "DATABASE">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name?: EntityName;
  clauses: CreateSchemaClause[];
}

type CreateSchemaClause =
  | BigqueryOptions
  | BigqueryOptionDefaultCollate
  | CreateSchemaAuthorizationClause;

// PostgreSQL
export interface CreateSchemaAuthorizationClause extends BaseNode {
  type: "create_schema_authorization_clause";
  authorizationKw: Keyword<"AUTHORIZATION">;
  role: Identifier | FuncCall;
}

// DROP SCHEMA
export interface DropSchemaStmt extends BaseNode {
  type: "drop_schema_stmt";
  dropSchemaKw: [Keyword<"DROP">, Keyword<"SCHEMA" | "DATABASE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  schemas: ListExpr<EntityName>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// ALTER SCHEMA
export interface AlterSchemaStmt extends BaseNode {
  type: "alter_schema_stmt";
  alterSchemaKw: [Keyword<"ALTER">, Keyword<"SCHEMA" | "DATABASE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
  actions: AlterSchemaAction[];
}
