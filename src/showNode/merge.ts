import { show } from "../show";
import { AllMergeNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const mergeMap: FullTransformMap<string, AllMergeNodes> = {
  merge_stmt: (node) =>
    show([
      node.mergeKw,
      node.intoKw,
      node.target,
      node.usingKw,
      node.source,
      node.onKw,
      node.condition,
      node.clauses,
    ]),
  merge_when_clause: (node) =>
    show([
      node.whenKw,
      node.matchedKw,
      node.byKw,
      node.condition,
      node.thenKw,
      node.action,
    ]),
  merge_when_condition: (node) => show([node.andKw, node.expr]),
  merge_action_delete: (node) => show([node.deleteKw]),
  merge_action_insert: (node) =>
    show([node.insertKw, node.columns, node.values]),
  merge_action_update: (node) => show([node.updateKw, node.set]),
  merge_action_insert_row_clause: (node) => show(node.rowKw),
};
