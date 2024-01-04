import { show } from "../show";
import { AllDeleteNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const deleteMap: FullTransformMap<string, AllDeleteNodes> = {
  delete_stmt: (node) => show(node.clauses),
  delete_clause: (node) =>
    show([node.deleteKw, node.modifiers, node.fromKw, node.tables]),
};
