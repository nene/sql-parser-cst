import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr, EntityName } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllDclNodes =
  | AllDclStatements
  | Privilege
  | AllPrivileges
  | GrantResource
  | GrantedByClause;

export type AllDclStatements = GrantRoleStmt | GrantPrivilegeStmt | RevokeStmt;

// GRANT role ON resource TO user
export interface GrantRoleStmt extends BaseNode {
  type: "grant_role_stmt";
  grantKw: Keyword<"GRANT">;
  roles: ListExpr<Identifier>;
  onKw: Keyword<"ON">;
  resourceType:
    | Keyword<"SCHEMA" | "TABLE" | "VIEW">
    | [Keyword<"EXTERNAL">, Keyword<"TABLE">];
  resourceName: EntityName;
  toKw: Keyword<"TO">;
  users: ListExpr<StringLiteral>;
}

// GRANT privilege ON resource TO roles
export interface GrantPrivilegeStmt extends BaseNode {
  type: "grant_privilege_stmt";
  grantKw: Keyword<"GRANT">;
  privileges: ListExpr<Privilege> | AllPrivileges;
  onKw: Keyword<"ON">;
  resource: GrantResource;
  toKw: Keyword<"TO">;
  roles: ListExpr<GrantRoleSpecification>;
  withGrantOptionKw?: [Keyword<"WITH">, Keyword<"GRANT">, Keyword<"OPTION">];
  grantedBy?: GrantedByClause;
}

export interface Privilege extends BaseNode {
  type: "privilege";
  privilegeKw: Keyword<
    | "SELECT"
    | "INSERT"
    | "UPDATE"
    | "DELETE"
    | "TRUNCATE"
    | "REFERENCES"
    | "TRIGGER"
    | "MAINTAIN"
    | "USAGE"
    | "CREATE"
    | "CONNECT"
    | "TEMPORARY"
    | "TEMP"
  >;
}

export interface AllPrivileges extends BaseNode {
  type: "all_privileges";
  allKw: Keyword<"ALL">;
  privilegesKw?: Keyword<"PRIVILEGES">;
}

export type GrantResource =
  | GrantResourceTable
  | GrantResourceAllTablesInSchema
  | GrantResourceSequence
  | GrantResourceAllSequencesInSchema
  | GrantResourceDatabase
  | GrantResourceDomain
  | GrantResourceForeignDataWrapper
  | GrantResourceForeignServer
  | GrantResourceLanguage;

export interface GrantResourceTable extends BaseNode {
  type: "grant_resource_table";
  tableKw?: Keyword<"TABLE">;
  tables: ListExpr<EntityName>;
}

export interface GrantResourceAllTablesInSchema extends BaseNode {
  type: "grant_resource_all_tables_in_schema";
  allTablesInSchemaKw: [
    Keyword<"ALL">,
    Keyword<"TABLES">,
    Keyword<"IN">,
    Keyword<"SCHEMA">
  ];
  schemas: ListExpr<Identifier>;
}

export interface GrantResourceSequence extends BaseNode {
  type: "grant_resource_sequence";
  sequenceKw: Keyword<"SEQUENCE">;
  sequences: ListExpr<EntityName>;
}

export interface GrantResourceAllSequencesInSchema extends BaseNode {
  type: "grant_resource_all_sequences_in_schema";
  allSequencesInSchemaKw: [
    Keyword<"ALL">,
    Keyword<"SEQUENCES">,
    Keyword<"IN">,
    Keyword<"SCHEMA">
  ];
  schemas: ListExpr<Identifier>;
}

export interface GrantResourceDatabase extends BaseNode {
  type: "grant_resource_database";
  databaseKw: Keyword<"DATABASE">;
  databases: ListExpr<Identifier>;
}

export interface GrantResourceDomain extends BaseNode {
  type: "grant_resource_domain";
  domainKw: Keyword<"DOMAIN">;
  domains: ListExpr<EntityName>;
}

export interface GrantResourceForeignDataWrapper extends BaseNode {
  type: "grant_resource_foreign_data_wrapper";
  foreignDataWrapperKw: [
    Keyword<"FOREIGN">,
    Keyword<"DATA">,
    Keyword<"WRAPPER">
  ];
  dataWrappers: ListExpr<Identifier>;
}

export interface GrantResourceForeignServer extends BaseNode {
  type: "grant_resource_foreign_server";
  foreignServerKw: [Keyword<"FOREIGN">, Keyword<"SERVER">];
  servers: ListExpr<Identifier>;
}

export interface GrantResourceLanguage extends BaseNode {
  type: "grant_resource_language";
  languageKw: Keyword<"LANGUAGE">;
  languages: ListExpr<Identifier>;
}

export interface GrantedByClause extends BaseNode {
  type: "granted_by_clause";
  grantedByKw: [Keyword<"GRANTED">, Keyword<"BY">];
  role: GrantRoleSpecification;
}

type GrantRoleSpecification = Identifier;

// REVOKE
export interface RevokeStmt extends BaseNode {
  type: "revoke_stmt";
  revokeKw: Keyword<"REVOKE">;
  roles: ListExpr<Identifier>;
  onKw: Keyword<"ON">;
  resourceType:
    | Keyword<"SCHEMA" | "TABLE" | "VIEW">
    | [Keyword<"EXTERNAL">, Keyword<"TABLE">];
  resourceName: EntityName;
  fromKw: Keyword<"FROM">;
  users: ListExpr<StringLiteral>;
}
