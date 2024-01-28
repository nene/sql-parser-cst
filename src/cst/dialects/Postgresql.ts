import { BaseNode, Keyword } from "../Base";
import { Identifier, ListExpr, MemberExpr, ParenExpr } from "../Expr";
import { StringLiteral } from "../Literal";

export type AllPostgresqlNodes =
  | PostgresqlOperatorExpr
  | PostgresqlOperator
  | PostgresqlOperatorClass
  | PostgresqlOptions
  | PostgresqlOptionElement;

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

export interface PostgresqlOptions extends BaseNode {
  type: "postgresql_options";
  optionsKw: Keyword<"OPTIONS">;
  options: ParenExpr<ListExpr<PostgresqlOptionElement>>;
}

export interface PostgresqlOptionElement extends BaseNode {
  type: "postgresql_option_element";
  name: Identifier;
  value: StringLiteral;
}
