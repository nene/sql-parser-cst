import { BaseNode, Keyword } from "./Base";
import { Constraint, DomainConstraint } from "./Constraint";
import { DataType } from "./DataType";
import { EntityName, ListExpr } from "./Expr";

export type AllDomainNodes = AllDomainStatements;

export type AllDomainStatements = CreateDomainStmt | DropDomainStmt;

// CREATE DOMAIN
export interface CreateDomainStmt extends BaseNode {
  type: "create_domain_stmt";
  createDomainKw: [Keyword<"CREATE">, Keyword<"DOMAIN">];
  name: EntityName;
  asKw?: Keyword<"AS">;
  dataType: DataType;
  constraints: (Constraint<DomainConstraint> | DomainConstraint)[];
}

// DROP DOMAIN
export interface DropDomainStmt extends BaseNode {
  type: "drop_domain_stmt";
  dropDomainKw: [Keyword<"DROP">, Keyword<"DOMAIN">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  domains: ListExpr<EntityName>;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
