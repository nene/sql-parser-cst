import { BaseNode, Keyword } from "./Base";
import { Expr, Identifier, ListExpr, ParenExpr } from "./Expr";

export type AllBigqueryNodes = BigqueryOptions | NameValuePair;

export interface BigqueryOptions extends BaseNode {
  type: "bigquery_options";
  optionsKw: Keyword<"OPTIONS">;
  options: ParenExpr<ListExpr<NameValuePair>>;
}

export interface NameValuePair extends BaseNode {
  type: "name_value_pair";
  name: Identifier;
  value: Expr;
}
