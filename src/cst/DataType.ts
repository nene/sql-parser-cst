import { BaseNode, Keyword } from "./Base";
import { ColumnConstraint } from "./Constraint";
import { Identifier, ListExpr, ParenExpr } from "./Expr";
import { Literal, NumberLiteral } from "./Literal";

export type AllDataTypeNodes =
  | DataType
  | GenericTypeParams
  | ArrayTypeParam
  | StructTypeParam
  | ArrayBounds;

export type DataType = NamedDataType | ArrayDataType | WithTimeZoneDataType;

export interface NamedDataType extends BaseNode {
  type: "named_data_type";
  nameKw: Keyword | Keyword[];
  params?: ParenExpr<ListExpr<Literal>> | GenericTypeParams;
}

export interface ArrayDataType extends BaseNode {
  type: "array_data_type";
  dataType: DataType;
  bounds: ArrayBounds;
}

export interface ArrayBounds extends BaseNode {
  type: "array_bounds";
  // This can only contain one or zero items.
  // We use a list because we want to store whitespace and comments inside empty [] brackets.
  bounds: ListExpr<NumberLiteral>;
}

export interface WithTimeZoneDataType extends BaseNode {
  type: "with_time_zone_data_type";
  dataType: DataType;
  withTimeZoneKw: [
    Keyword<"WITH" | "WITHOUT">,
    Keyword<"TIME">,
    Keyword<"ZONE">
  ];
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
