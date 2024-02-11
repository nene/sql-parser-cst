import { show } from "../show";
import { AllTriggerNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const triggerMap: FullTransformMap<string, AllTriggerNodes> = {
  create_trigger_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.triggerKw,
      node.ifNotExistsKw,
      node.name,
      node.event,
      node.forEachRowKw,
      node.condition,
      node.body,
    ]),
  trigger_event: (node) =>
    show([
      node.timeKw,
      node.eventKw,
      node.ofKw,
      node.columns,
      node.onKw,
      node.table,
    ]),
  trigger_condition: (node) => show([node.whenKw, node.expr]),
  execute_clause: (node) =>
    show([node.executeKw, node.functionKw, node.name, node.args]),

  // DROP TRIGGER
  drop_trigger_stmt: (node) =>
    show([node.dropTriggerKw, node.ifExistsKw, node.trigger]),
};
