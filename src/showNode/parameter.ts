import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllParameterNodes } from "src/cst/Parameter";

export const parameterMap: FullTransformMap<string, AllParameterNodes> = {
  set_parameter_stmt: (node) =>
    show([node.setKw, node.modifierKw, node.name, node.operator, node.value]),
  set_time_zone_parameter_stmt: (node) =>
    show([node.setKw, node.modifierKw, node.timeZoneKw, node.value]),
  reset_parameter_stmt: (node) => show([node.resetKw, node.name]),
  reset_all_parameters_stmt: (node) => show(node.resetAllKw),
  show_parameter_stmt: (node) => show([node.showKw, node.name]),
  show_all_parameters_stmt: (node) => show(node.showAllKw),
};
