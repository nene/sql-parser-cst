import { AlterSchemaAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { CreateTableStmt } from "./CreateTable";
import { GrantRoleStmt } from "./Dcl";
import {
  BigqueryOptionDefaultCollate,
  BigqueryOptions,
} from "./dialects/Bigquery";
import { EntityName, FuncCall, Identifier, ListExpr } from "./Expr";
import { CreateIndexStmt } from "./Index";
import { CreateSequenceStmt } from "./Sequence";
import { CreateTriggerStmt } from "./Trigger";
import { CreateViewStmt } from "./View";

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
  statements: SchemaScopedStatement[];
}

type CreateSchemaClause =
  | BigqueryOptions
  | BigqueryOptionDefaultCollate
  | CreateSchemaAuthorizationClause;

type SchemaScopedStatement =
  | CreateTableStmt
  | CreateViewStmt
  | CreateIndexStmt
  | CreateSequenceStmt
  | CreateTriggerStmt
  | GrantRoleStmt;

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
