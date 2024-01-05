import { BaseNode, Keyword } from "../Base";
import { MemberExpr, ParenExpr } from "../Expr";

export type AllPostgresqlNodes = PostgresqlOperatorExpr | PostgresqlOperator;

export interface PostgresqlOperatorExpr extends BaseNode {
  type: "postgresql_operator_expr";
  operatorKw: Keyword<"OPERATOR">;
  expr: ParenExpr<PostgresqlOperator | MemberExpr>;
}

export interface PostgresqlOperator extends BaseNode {
  type: "postgresql_operator";
  operator: string;
}
