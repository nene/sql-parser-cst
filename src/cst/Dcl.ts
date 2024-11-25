import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr, EntityName } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllDclNodes =
  | AllDclStatements
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
  privileges: ListExpr<PrivilegeKeyword> | AllPrivileges;
  onKw: Keyword<"ON">;
  resource: GrantResource;
  toKw: Keyword<"TO">;
  roles: ListExpr<GrantRoleSpecification>;
  withGrantOptionKw?: [Keyword<"WITH">, Keyword<"GRANT">, Keyword<"OPTION">];
  grantedBy?: GrantedByClause;
}

type PrivilegeKeyword = Keyword<
  | "SELECT"
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "TRUNCATE"
  | "REFERENCES"
  | "TRIGGER"
  | "MAINTAIN"
>;

export interface AllPrivileges extends BaseNode {
  type: "all_privileges";
  allKw: Keyword<"ALL">;
  privilegesKw?: Keyword<"PRIVILEGES">;
}

export type GrantResource = GrantResourceTable | GrantResourceAllTablesInSchema;

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
