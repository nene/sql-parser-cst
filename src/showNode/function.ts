import { show } from "../show";
import { AllFunctionNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const functionMap: FullTransformMap<string, AllFunctionNodes> = {
  create_function_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.tableKw,
      node.functionKw,
      node.ifNotExistsKw,
      node.name,
      node.params,
      node.clauses,
    ]),
  function_signature: (node) => show([node.name, node.params]),
  function_param: (node) =>
    show([node.mode, node.name, node.dataType, node.default]),
  function_param_default: (node) => show([node.operator, node.expr]),
  return_clause: (node) => show([node.returnKw, node.expr]),
  dynamically_loaded_function: (node) =>
    show([node.objectFile, ",", node.symbol]),
  function_window_clause: (node) => show([node.windowKw]),
  function_behavior_clause: (node) => show([node.behaviorKw]),
  function_security_clause: (node) => show([node.externalKw, node.securityKw]),
  function_cost_clause: (node) => show([node.costKw, node.cost]),
  function_rows_clause: (node) => show([node.rowsKw, node.rows]),
  function_support_clause: (node) => show([node.supportKw, node.name]),
  function_transform_clause: (node) => show([node.transformKw, node.types]),
  transform_type: (node) => show([node.forTypeKw, node.dataType]),

  drop_function_stmt: (node) =>
    show([
      node.dropKw,
      node.tableKw,
      node.functionKw,
      node.ifExistsKw,
      node.name,
      node.params,
      node.behaviorKw,
    ]),

  alter_function_stmt: (node) =>
    show([
      node.alterKw,
      node.functionKw,
      node.name,
      node.params,
      node.actions,
      node.behaviorKw,
    ]),
};
