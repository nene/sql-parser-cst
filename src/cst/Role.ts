import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";

export type AllRoleNodes = AllRoleStatements | RoleOption;

export type AllRoleStatements = CreateRoleStmt;

// CREATE ROLE
export interface CreateRoleStmt extends BaseNode {
  type: "create_role_stmt";
  createRoleKw: [Keyword<"CREATE">, Keyword<"ROLE">];
  name: EntityName;
  withKw?: Keyword<"WITH">;
  options?: RoleOption[];
}

export type RoleOption = RoleOptionKeyword;

export interface RoleOptionKeyword extends BaseNode {
  type: "role_option_keyword";
  kw: Keyword<
    | "SUPERUSER"
    | "NOSUPERUSER"
    | "CREATEDB"
    | "NOCREATEDB"
    | "CREATEROLE"
    | "NOCREATEROLE"
    | "INHERIT"
    | "NOINHERIT"
    | "LOGIN"
    | "NOLOGIN"
    | "REPLICATION"
    | "NOREPLICATION"
    | "BYPASSRLS"
    | "NOBYPASSRLS"
  >;
}
