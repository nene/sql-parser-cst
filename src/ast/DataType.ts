import { BaseNode } from "./Base";
import { Literal } from "./Literal";

export type AllDataTypeNodes = DataType;

export interface DataType extends BaseNode {
  type: "data_type";
  name: string;
  params?: Literal[];
}
