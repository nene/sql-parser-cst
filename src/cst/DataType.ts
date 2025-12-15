import { BaseNode, Empty, Keyword } from "./Base";
import { ColumnConstraint } from "./Constraint";
import { ColumnDefinition } from "./CreateTable";
import { EntityName, Expr, Identifier, ListExpr, ParenExpr } from "./Expr";
import { IntervalUnit, IntervalUnitRange, NumberLiteral } from "./Literal";

export type AllDataTypeNodes =
  | DataTypeName
  | ModifiedDataType
  | ParametricDataType
  | ArrayDataType
  | SetofDataType
  | TimeDataType
  | IntervalDataType
  | TableDataType
  | GenericTypeParams
  | ArrayTypeParam
  | StructTypeParam
  | ArrayBounds;

export type DataType =
  // in PostgreSQL only builtin data types will be parsed DataTypeName,
  // the rest will be parsed as EntityName
  | EntityName
  | DataTypeName
  | ModifiedDataType
  | ParametricDataType
  | ArrayDataType
  | SetofDataType
  | TimeDataType
  | IntervalDataType
  | TableDataType;

export interface DataTypeName extends BaseNode {
  type: "data_type_name";
  name: Keyword | Keyword[];
}

export interface ModifiedDataType extends BaseNode {
  type: "modified_data_type";
  dataType: DataType;
  modifiers?: ParenExpr<ListExpr<Expr>> | GenericTypeParams;
}

// BigQuery
export interface ParametricDataType extends BaseNode {
  type: "parametric_data_type";
  typeKw: Keyword<"ARRAY" | "STRUCT" | "TABLE">;
  params?: GenericTypeParams;
}

// PostgreSQL
export interface ArrayDataType extends BaseNode {
  type: "array_data_type";
  dataType: DataType;
  bounds: ArrayBounds;
}

// PostgreSQL
export interface ArrayBounds extends BaseNode {
  type: "array_bounds";
  bounds: NumberLiteral | Empty;
}

// PostgreSQL
export interface TimeDataType extends BaseNode {
  type: "time_data_type";
  timeKw: Keyword<"TIME" | "TIMESTAMP">;
  precision?: ParenExpr<Expr>;
  timeZoneKw?: [Keyword<"WITH" | "WITHOUT">, Keyword<"TIME">, Keyword<"ZONE">];
}

// PostgreSQL
export interface IntervalDataType extends BaseNode {
  type: "interval_data_type";
  intervalKw: Keyword<"INTERVAL">;
  unit?: IntervalUnit | IntervalUnitRange;
}

// BigQuery
export interface GenericTypeParams extends BaseNode {
  type: "generic_type_params";
  params: ListExpr<ArrayTypeParam> | ListExpr<StructTypeParam>;
}

// BigQuery
export interface ArrayTypeParam extends BaseNode {
  type: "array_type_param";
  dataType: DataType;
  constraints: ColumnConstraint[];
}

// BigQuery
export interface StructTypeParam extends BaseNode {
  type: "struct_type_param";
  name: Identifier;
  dataType: DataType;
  constraints: ColumnConstraint[];
}

// PostgreSQL
export interface TableDataType extends BaseNode {
  type: "table_data_type";
  tableKw: Keyword<"TABLE">;
  columns: ParenExpr<ListExpr<ColumnDefinition>>;
}

export interface SetofDataType extends BaseNode {
  type: "setof_data_type";
  setofKw: Keyword<"SETOF">;
  dataType: DataType;
}
