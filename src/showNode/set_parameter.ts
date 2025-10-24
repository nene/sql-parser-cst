import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllSetParameterNodes } from "src/cst/SetParameter";

export const setParameterMap: FullTransformMap<string, AllSetParameterNodes> = {
  set_parameter_stmt: (node) =>
    show([node.setKw, node.modifierKw, node.name, node.operator, node.value]),
  set_time_zone_parameter_stmt: (node) =>
    show([node.setKw, node.modifierKw, node.timeZoneKw, node.value]),
};
