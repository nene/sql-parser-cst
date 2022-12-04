import { BaseNode, Keyword } from "./Base";
import { BinaryExpr, Expr, Identifier, ListExpr, ParenExpr } from "./Expr";

export type AllBigqueryNodes = BigqueryOptions;

export interface BigqueryOptions extends BaseNode {
  type: "bigquery_options";
  optionsKw: Keyword<"OPTIONS">;
  options: ParenExpr<ListExpr<BinaryExpr<Identifier, "=", Expr>>>;
}
