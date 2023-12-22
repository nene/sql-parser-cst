import { show } from "../show";
import { AllDataTypeNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const dataTypeMap: FullTransformMap<string, AllDataTypeNodes> = {
  named_data_type: (node) => show([node.nameKw, node.params]),
  array_data_type: (node) => show([node.dataType, node.bounds]),
  array_bounds: (node) => show(["[", node.bounds, "]"]),
  generic_type_params: (node) => show(["<", node.params, ">"]),
  array_type_param: (node) => show([node.dataType, node.constraints]),
  struct_type_param: (node) =>
    show([node.name, node.dataType, node.constraints]),
};
