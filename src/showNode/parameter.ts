import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllParameterNodes } from "src/cst/Parameter";

export const parameterMap: FullTransformMap<string, AllParameterNodes> = {
  set_parameter_stmt: (node) =>
    show([node.setKw, node.modifierKw, node.name, node.operator, node.value]),
  set_time_zone_parameter_stmt: (node) =>
    show([node.setKw, node.modifierKw, node.timeZoneKw, node.value]),
  reset_parameter_stmt: (node) => show([node.resetKw, node.name]),
  show_parameter_stmt: (node) => show([node.showKw, node.name]),
  set_parameter_clause: (node) =>
    show([node.setKw, node.name, node.operator, node.value]),
  set_parameter_from_current_clause: (node) =>
    show([node.setKw, node.name, node.fromCurrentKw]),
  reset_parameter_clause: (node) => show([node.resetKw, node.name]),
  all_parameters: (node) => show([node.allKw]),
  local_parameter_value: (node) => show([node.localKw]),
  boolean_on_off_literal: (node) => show([node.valueKw]),
};
