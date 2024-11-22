import { BaseNode, Keyword } from "./Base";
import { EntityName } from "./Expr";
import { NullLiteral, NumberLiteral, StringLiteral } from "./Literal";

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

export type RoleOption =
  | RoleOptionKeyword
  | RoleOptionConnectionLimit
  | RoleOptionPassword
  | RoleOptionValidUntil
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

export interface RoleOptionSysId extends BaseNode {
  type: "role_option_sysid";
  sysIdKw: Keyword<"SYSID">;
  sysId: NumberLiteral;
}
