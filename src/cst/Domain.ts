import { BaseNode, Keyword } from "./Base";
import { DataType } from "./DataType";
import { EntityName } from "./Expr";

export type AllDomainNodes = AllDomainStatements;

export type AllDomainStatements = CreateDomainStmt;

// CREATE DOMAIN
export interface CreateDomainStmt extends BaseNode {
  type: "create_domain_stmt";
  createDomainKw: [Keyword<"CREATE">, Keyword<"DOMAIN">];
  name: EntityName;
  asKw?: Keyword<"AS">;
  dataType: DataType;
}
