import { BaseNode, Keyword } from "./Base";
import { EntityName, ListExpr } from "./Expr";
import { NullLiteral, NumberLiteral, StringLiteral } from "./Literal";

export type AllRoleNodes = AllRoleStatements | RoleOption;

export type AllRoleStatements = CreateRoleStmt | DropRoleStmt;

// CREATE ROLE
export interface CreateRoleStmt extends BaseNode {
  type: "create_role_stmt";
  createRoleKw: [Keyword<"CREATE">, Keyword<"ROLE">];
  name: EntityName;
  withKw?: Keyword<"WITH">;
  options?: RoleOption[];
}

export type RoleOption =
  | RoleOptionKeyword
  | RoleOptionConnectionLimit
  | RoleOptionPassword
  | RoleOptionValidUntil
  | RoleOptionInRole
  | RoleOptionRole
  | RoleOptionAdmin
  | RoleOptionSysId;

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

export interface RoleOptionConnectionLimit extends BaseNode {
  type: "role_option_connection_limit";
  connectionLimitKw: [Keyword<"CONNECTION">, Keyword<"LIMIT">];
  limit: NumberLiteral;
}

export interface RoleOptionPassword extends BaseNode {
  type: "role_option_password";
  encryptedKw?: Keyword<"ENCRYPTED">;
  passwordKw: Keyword<"PASSWORD">;
  password: StringLiteral | NullLiteral;
}

export interface RoleOptionValidUntil extends BaseNode {
  type: "role_option_valid_until";
  validUntilKw: [Keyword<"VALID">, Keyword<"UNTIL">];
  timestamp: StringLiteral;
}

export interface RoleOptionInRole extends BaseNode {
  type: "role_option_in_role";
  inRoleKw: [Keyword<"IN">, Keyword<"ROLE">];
  names: ListExpr<EntityName>;
}

export interface RoleOptionRole extends BaseNode {
  type: "role_option_role";
  roleKw: Keyword<"ROLE">;
  names: ListExpr<EntityName>;
}

export interface RoleOptionAdmin extends BaseNode {
  type: "role_option_admin";
  adminKw: Keyword<"ADMIN">;
  names: ListExpr<EntityName>;
}

export interface RoleOptionSysId extends BaseNode {
  type: "role_option_sysid";
  sysIdKw: Keyword<"SYSID">;
  sysId: NumberLiteral;
}

// DROP ROLE
export interface DropRoleStmt extends BaseNode {
  type: "drop_role_stmt";
  dropRoleKw: [Keyword<"DROP">, Keyword<"ROLE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  names: ListExpr<EntityName>;
}
