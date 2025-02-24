import { AlterPolicyAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { Grantee } from "./Dcl";
import { Identifier, EntityName, Expr, ParenExpr, ListExpr } from "./Expr";

export type AllPolicyNodes = AllPolicyStatements | CreatePolicyClause;

export type AllPolicyStatements =
  | CreatePolicyStmt
  | AlterPolicyStmt
  | DropPolicyStmt;

// CREATE POLICY name ON table
export interface CreatePolicyStmt extends BaseNode {
  type: "create_policy_stmt";
  createPolicyKw: [Keyword<"CREATE">, Keyword<"POLICY">];
  name: Identifier;
  onKw: Keyword<"ON">;
  table: EntityName;
  clauses: CreatePolicyClause[];
}

export type CreatePolicyClause =
  | PolicyPermissiveClause
  | PolicyRestrictiveClause
  | PolicyCommandClause
  | PolicyRolesClause
  | PolicyUsingClause
  | PolicyCheckClause;

export interface PolicyPermissiveClause extends BaseNode {
  type: "policy_permissive_clause";
  asKw: Keyword<"AS">;
  permissiveKw: Keyword<"PERMISSIVE">;
}

export interface PolicyRestrictiveClause extends BaseNode {
  type: "policy_restrictive_clause";
  asKw: Keyword<"AS">;
  restrictiveKw: Keyword<"RESTRICTIVE">;
}

export interface PolicyCommandClause extends BaseNode {
  type: "policy_command_clause";
  forKw: Keyword<"FOR">;
  commandKw: Keyword<"ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE">;
}

export interface PolicyRolesClause extends BaseNode {
  type: "policy_roles_clause";
  toKw: Keyword<"TO">;
  roles: ListExpr<Grantee>;
}

export interface PolicyUsingClause extends BaseNode {
  type: "policy_using_clause";
  usingKw: Keyword<"USING">;
  expr: ParenExpr<Expr>;
}

export interface PolicyCheckClause extends BaseNode {
  type: "policy_check_clause";
  withKw: Keyword<"WITH">;
  checkKw: Keyword<"CHECK">;
  expr: ParenExpr<Expr>;
}

export interface AlterPolicyStmt extends BaseNode {
  type: "alter_policy_stmt";
  alterPolicyKw: [Keyword<"ALTER">, Keyword<"POLICY">];
  name: Identifier;
  onKw: Keyword<"ON">;
  table: EntityName;
  actions: (
    | AlterPolicyAction
    | PolicyRolesClause
    | PolicyUsingClause
    | PolicyCheckClause
  )[];
}

export interface DropPolicyStmt extends BaseNode {
  type: "drop_policy_stmt";
  dropPolicyKw: [Keyword<"DROP">, Keyword<"POLICY">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Identifier;
  onKw: Keyword<"ON">;
  table: EntityName;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
