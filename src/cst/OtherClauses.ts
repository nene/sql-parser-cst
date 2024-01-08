import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr } from "./Expr";

export type AllOtherClauses = ReturningClause | WhereCurrentOfClause;

export interface ReturningClause extends BaseNode {
  type: "returning_clause";
  returningKw: Keyword<"RETURNING">;
  columns: ListExpr<Expr | Alias<Expr>>;
}

// PostgreSQL
export interface WhereCurrentOfClause extends BaseNode {
  type: "where_current_of_clause";
  whereCurrentOfKw: [Keyword<"WHERE">, Keyword<"CURRENT">, Keyword<"OF">];
  cursor: Identifier;
}
