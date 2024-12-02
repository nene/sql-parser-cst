import { show } from "../show";
import { AllTriggerNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const triggerMap: FullTransformMap<string, AllTriggerNodes> = {
  create_trigger_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.kind,
      node.triggerKw,
      node.ifNotExistsKw,
      node.name,
      node.timeKw,
      node.event,
      node.target,
      node.clauses,
      node.body,
    ]),
  trigger_event: (node) => show([node.eventKw, node.ofKw, node.columns]),
  trigger_target: (node) => show([node.onKw, node.table]),
  for_each_clause: (node) => show([node.forEachKw, node.itemKw]),
  when_clause: (node) => show([node.whenKw, node.expr]),
  from_referenced_table_clause: (node) => show([node.fromKw, node.table]),
  trigger_timing_clause: (node) => show([node.timingKw]),
  trigger_referencing_clause: (node) =>
    show([node.referencingKw, node.transitions]),
  trigger_transition: (node) =>
    show([node.oldOrNewKw, node.rowOrTableKw, node.asKw, node.name]),
  execute_clause: (node) =>
    show([node.executeKw, node.functionKw, node.name, node.args]),

  // ALTER TRIGGER
  alter_trigger_stmt: (node) =>
    show([node.alterTriggerKw, node.trigger, node.target, node.action]),

  // DROP TRIGGER
  drop_trigger_stmt: (node) =>
    show([
      node.dropTriggerKw,
      node.ifExistsKw,
      node.trigger,
      node.target,
      node.behaviorKw,
    ]),
};
