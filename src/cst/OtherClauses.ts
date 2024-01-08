import { BaseNode, Keyword } from "./Base";
import { Identifier } from "./Expr";

export type AllOtherClauses = WhereCurrentOfClause;

// PostgreSQL
export interface WhereCurrentOfClause extends BaseNode {
  type: "where_current_of_clause";
  whereCurrentOfKw: [Keyword<"WHERE">, Keyword<"CURRENT">, Keyword<"OF">];
  cursor: Identifier;
}
