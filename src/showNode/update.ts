import { show } from "../show";
import { AllUpdateNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const updateMap: FullTransformMap<string, AllUpdateNodes> = {
  update_stmt: (node) => show(node.clauses),
  update_clause: (node) =>
    show([node.updateKw, node.options, node.orAction, node.tables]),
  set_clause: (node) => show([node.setKw, node.assignments]),
  column_assignment: (node) => show([node.column, "=", node.expr]),
};
