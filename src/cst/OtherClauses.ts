import { Alias } from "./Alias";
import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr } from "./Expr";
import { Node } from "./Node";

export type AllOtherClauses =
  | ReturningClause
  | IntoClause
  | AsClause
  | CommaClause
  | ClusterByClause
  | WhereCurrentOfClause;

export interface ReturningClause extends BaseNode {
  type: "returning_clause";
  returningKw: Keyword<"RETURNING">;
  columns: ListExpr<Expr | Alias<Expr>>;
}

export interface IntoClause extends BaseNode {
  type: "into_clause";
  intoKw: Keyword<"INTO">;
  strictKw?: Keyword<"STRICT">;
  variables: ListExpr<Identifier>;
}

export interface AsClause<T = Node> extends BaseNode {
  type: "as_clause";
  asKw: Keyword<"AS">;
  expr: T;
}

// Represents a leading comma
export interface CommaClause<T = Node> extends BaseNode {
  type: "comma_clause";
  expr: T;
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
