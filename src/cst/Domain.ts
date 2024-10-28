import { AlterDomainAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { Constraint, DomainConstraint } from "./Constraint";
import { DataType } from "./DataType";
import { EntityName, ListExpr } from "./Expr";

export type AllDomainNodes = AllDomainStatements;

export type AllDomainStatements =
  | CreateDomainStmt
  | AlterDomainStmt
  | DropDomainStmt;

// CREATE DOMAIN
export interface CreateDomainStmt extends BaseNode {
  type: "create_domain_stmt";
  createDomainKw: [Keyword<"CREATE">, Keyword<"DOMAIN">];
  name: EntityName;
  asKw?: Keyword<"AS">;
  dataType: DataType;
  constraints: (Constraint<DomainConstraint> | DomainConstraint)[];
}

// ALTER DOMAIN
export interface AlterDomainStmt extends BaseNode {
  type: "alter_domain_stmt";
  alterDomainKw: [Keyword<"ALTER">, Keyword<"DOMAIN">];
  name: EntityName;
  action: AlterDomainAction;
}

// DROP DOMAIN
export interface DropDomainStmt extends BaseNode {
  type: "drop_domain_stmt";
  dropDomainKw: [Keyword<"DROP">, Keyword<"DOMAIN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  domains: ListExpr<EntityName>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
