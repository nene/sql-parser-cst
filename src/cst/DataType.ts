import { BaseNode, Keyword } from "./Base";
import { ColumnConstraint } from "./Constraint";
import { Identifier, ListExpr, ParenExpr } from "./Expr";
import { Literal } from "./Literal";

export type AllDataTypeNodes =
  | DataType
  | GenericTypeParams
  | ArrayTypeParam
  | StructTypeParam;

export interface DataType extends BaseNode {
  type: "data_type";
  nameKw: Keyword | Keyword[];
  params?: ParenExpr<ListExpr<Literal>> | GenericTypeParams;
}

export interface GenericTypeParams extends BaseNode {
  type: "generic_type_params";
  params: ListExpr<ArrayTypeParam> | ListExpr<StructTypeParam>;
}

export interface ArrayTypeParam extends BaseNode {
  type: "array_type_param";
  dataType: DataType;
  constraints: ColumnConstraint[];
}

export interface StructTypeParam extends BaseNode {
  type: "struct_type_param";
  name: Identifier;
  dataType: DataType;
  constraints: ColumnConstraint[];
}
