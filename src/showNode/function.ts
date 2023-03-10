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
  function_param: (node) => show([node.name, node.dataType]),
  drop_function_stmt: (node) =>
    show([
      node.dropKw,
      node.tableKw,
      node.functionKw,
      node.ifExistsKw,
      node.name,
    ]),
};
