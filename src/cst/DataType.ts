import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr, PairExpr, ParenExpr } from "./Expr";
import { Literal } from "./Literal";

export type AllDataTypeNodes = DataType | GenericTypeParams;

export interface DataType extends BaseNode {
  type: "data_type";
  nameKw: Keyword | Keyword[];
  params?: ParenExpr<ListExpr<Literal>> | GenericTypeParams;
}

export interface GenericTypeParams extends BaseNode {
  type: "generic_type_params";
  params: ListExpr<DataType | PairExpr<Identifier, DataType>>;
}
