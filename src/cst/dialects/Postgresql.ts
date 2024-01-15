import { BaseNode, Keyword } from "../Base";
import { Identifier, MemberExpr, ParenExpr } from "../Expr";

export type AllPostgresqlNodes =
  | PostgresqlOperatorExpr
  | PostgresqlOperator
  | PostgresqlOperatorClass;

export interface PostgresqlOperatorExpr extends BaseNode {
  type: "postgresql_operator_expr";
  operatorKw: Keyword<"OPERATOR">;
  expr: ParenExpr<PostgresqlOperator | MemberExpr>;
}

export interface PostgresqlOperator extends BaseNode {
  type: "postgresql_operator";
  operator: string;
}

export interface PostgresqlOperatorClass extends BaseNode {
  type: "postgresql_operator_class";
  name: MemberExpr | Identifier;
}
