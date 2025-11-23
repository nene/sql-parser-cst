import { BaseNode, Empty, Keyword } from "./Base";
import { ColumnConstraint } from "./Constraint";
import { ColumnDefinition } from "./CreateTable";
import { EntityName, Expr, Identifier, ListExpr, ParenExpr } from "./Expr";
import { NumberLiteral } from "./Literal";

export type AllDataTypeNodes =
  | DataType
  | GenericTypeParams
  | ArrayTypeParam
  | StructTypeParam
  | ArrayBounds
  | DataTypeIdentifier;

export type DataType =
  | NamedDataType
  | ArrayDataType
  | SetofDataType
  | DatetimeDataType
  | IntervalDataType
  | TableDataType;

export interface NamedDataType extends BaseNode {
  type: "named_data_type";
  // in PostgreSQL all data types will be parsed as DataTypeIdentifier
  name: Keyword | Keyword[] | DataTypeIdentifier;
  params?: ParenExpr<ListExpr<Expr>> | GenericTypeParams;
}

// PostgreSQL
export interface DataTypeIdentifier extends BaseNode {
  type: "data_type_identifier";
  name: EntityName | Identifier[];
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
export interface DatetimeDataType extends BaseNode {
  type: "datetime_data_type";
  dateKw: Keyword<"DATE" | "TIME" | "TIMESTAMP">;
  params?: ParenExpr<Expr>;
  timeZoneKw?: [Keyword<"WITH" | "WITHOUT">, Keyword<"TIME">, Keyword<"ZONE">];
}

// PostgreSQL
export interface IntervalDataType extends BaseNode {
  type: "interval_data_type";
  intervalKw: Keyword<"INTERVAL">;
  fieldsKw?:
    | Keyword<"YEAR" | "MONTH" | "DAY" | "HOUR" | "MINUTE" | "SECOND">
    | [
        Keyword<"YEAR" | "MONTH" | "DAY" | "HOUR" | "MINUTE" | "SECOND">,
        Keyword<"TO">,
        Keyword<"YEAR" | "MONTH" | "DAY" | "HOUR" | "MINUTE" | "SECOND">
      ];
  params?: ParenExpr<Expr>;
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
