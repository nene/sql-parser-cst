import { show } from "../show";
import { AllDataTypeNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const dataTypeMap: FullTransformMap<string, AllDataTypeNodes> = {
  data_type: (node) => show([node.nameKw, node.params]),
  generic_type_params: (node) => show(["<", node.params, ">"]),
  array_type_param: (node) => show([node.dataType, node.constraints]),
  struct_type_param: (node) =>
    show([node.name, node.dataType, node.constraints]),
};
