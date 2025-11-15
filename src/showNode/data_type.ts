import { show } from "../show";
import { AllDataTypeNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const dataTypeMap: FullTransformMap<string, AllDataTypeNodes> = {
  named_data_type: (node) => show([node.name, node.params]),
  data_type_identifier: (node) => show([node.name]),
  array_data_type: (node) => show([node.dataType, node.bounds]),
  array_bounds: (node) => show(["[", node.bounds, "]"]),
  with_time_zone_data_type: (node) =>
    show([node.dataType, node.withTimeZoneKw]),
  generic_type_params: (node) => show(["<", node.params, ">"]),
  array_type_param: (node) => show([node.dataType, node.constraints]),
  struct_type_param: (node) =>
    show([node.name, node.dataType, node.constraints]),
  table_data_type: (node) => show([node.tableKw, node.columns]),
  setof_data_type: (node) => show([node.setofKw, node.dataType]),
};
