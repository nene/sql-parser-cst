export interface BaseNode {
  range?: [number, number];
}

export interface AllColumns extends BaseNode {
  type: "all_columns";
}
