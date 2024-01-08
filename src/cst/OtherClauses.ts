import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr } from "./Expr";

export type AllOtherClauses =
  | ReturningClause
  | ClusterByClause
  | WhereCurrentOfClause;

export interface ReturningClause extends BaseNode {
  type: "returning_clause";
  returningKw: Keyword<"RETURNING">;
  columns: ListExpr<Expr | Alias<Expr>>;
}

// BigQuery
export interface ClusterByClause extends BaseNode {
  type: "cluster_by_clause";
  clusterByKw: [Keyword<"CLUSTER">, Keyword<"BY">];
  columns: ListExpr<Identifier>;
}

// PostgreSQL
export interface WhereCurrentOfClause extends BaseNode {
  type: "where_current_of_clause";
  whereCurrentOfKw: [Keyword<"WHERE">, Keyword<"CURRENT">, Keyword<"OF">];
  cursor: Identifier;
}
