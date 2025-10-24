import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { SetParameterStmt } from "src/cst/SetParameter";

export const setParameterMap: FullTransformMap<string, SetParameterStmt> = {
  set_parameter_stmt: (node) =>
    show([node.setKw, node.modifierKw, node.name, node.operator, node.value]),
};
