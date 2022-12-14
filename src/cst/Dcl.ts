import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr, EntityName } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllDclStatements = GrantStmt | RevokeStmt;

// GRANT
export interface GrantStmt extends BaseNode {
  type: "grant_stmt";
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
