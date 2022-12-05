import { BaseNode, Keyword } from "./Base";
import { BinaryExpr, Expr, Identifier, ListExpr, ParenExpr } from "./Expr";
import { StringLiteral } from "./Literal";

export type AllBigqueryNodes = BigqueryOptions | BigqueryOptionDefaultCollate;

export interface BigqueryOptions extends BaseNode {
  type: "bigquery_options";
  optionsKw: Keyword<"OPTIONS">;
  options: ParenExpr<ListExpr<BinaryExpr<Identifier, "=", Expr>>>;
}

export interface BigqueryOptionDefaultCollate extends BaseNode {
  type: "bigquery_option_default_collate";
  defaultCollateKw: [Keyword<"DEFAULT">, Keyword<"COLLATE">];
  collation: StringLiteral;
}
