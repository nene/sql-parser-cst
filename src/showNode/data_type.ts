import { show } from "../show";
import { AllDataTypeNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const dataTypeMap: FullTransformMap<string, AllDataTypeNodes> = {
  data_type_name: (node) => show([node.name]),
  modified_data_type: (node) => show([node.dataType, node.modifiers]),
  parametric_data_type: (node) => show([node.typeKw, node.params]),
  array_data_type: (node) => show([node.dataType, node.bounds]),
  array_bounds: (node) => show(["[", node.bounds, "]"]),
  time_data_type: (node) =>
    show([node.timeKw, node.precision, node.timeZoneKw]),
  interval_data_type: (node) => show([node.intervalKw, node.unit]),
  generic_type_params: (node) => show(["<", node.params, ">"]),
  array_type_param: (node) => show([node.dataType, node.constraints]),
  struct_type_param: (node) =>
    show([node.name, node.dataType, node.constraints]),
  table_data_type: (node) => show([node.tableKw, node.columns]),
  setof_data_type: (node) => show([node.setofKw, node.dataType]),
};
