import { show } from "../show";
import { AllProceduralNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const proceduralLanguageMap: FullTransformMap<
  string,
  AllProceduralNodes
> = {
  labeled_stmt: (node) =>
    show([node.beginLabel, node.statement, node.endLabel]),
  colon_label: (node) => show([node.label, ":"]),
  chevron_label: (node) => show(["<<", node.label, ">>"]),
  block_stmt: (node) =>
    show([
      node.declareClause,
      node.beginKw,
      node.atomicKw,
      node.program,
      node.exception,
      node.endKw,
    ]),
  declare_clause: (node) => show([node.declareKw, node.program]),
  exception_clause: (node) =>
    show([
      node.exceptionKw,
      node.whenKw,
      node.condition,
      node.thenKw,
      node.program,
    ]),
  error_category: (node) => show(node.errorKw),
  declare_stmt: (node) =>
    show([
      node.declareKw,
      node.names,
      node.constantKw,
      node.dataType,
      node.constraints,
      node.init,
    ]),
  declare_init: (node) => show([node.operator, node.expr]),
  set_stmt: (node) => show([node.setKw, node.assignments]),
  assignment_stmt: (node) => show([node.target, node.operator, node.expr]),
  if_stmt: (node) => show([node.clauses, node.endIfKw]),
  if_clause: (node) =>
    show([node.ifKw, node.condition, node.thenKw, node.consequent]),
  elseif_clause: (node) =>
    show([node.elseifKw, node.condition, node.thenKw, node.consequent]),
  else_clause: (node) => show([node.elseKw, node.consequent]),
  case_stmt: (node) =>
    show([node.caseKw, node.expr, node.clauses, node.endCaseKw]),
  loop_stmt: (node) => show([node.loopKw, node.body, node.endLoopKw]),
  repeat_stmt: (node) =>
    show([
      node.repeatKw,
      node.body,
      node.untilKw,
      node.condition,
      node.endRepeatKw,
    ]),
  while_stmt: (node) =>
    show([node.whileKw, node.condition, node.doKw, node.body, node.endWhileKw]),
  while_loop_stmt: (node) => show([node.whileKw, node.condition, node.loop]),
  for_stmt: (node) =>
    show([
      node.forKw,
      node.left,
      node.inKw,
      node.right,
      node.doKw,
      node.body,
      node.endForKw,
    ]),
  for_loop_stmt: (node) =>
    show([node.forKw, node.left, node.inKw, node.right, node.loop]),
  for_range: (node) =>
    show([node.reverseKw, node.from, "..", node.to, node.by]),
  for_by_clause: (node) => show([node.byKw, node.expr]),
  foreach_stmt: (node) =>
    show([
      node.foreachKw,
      node.left,
      node.slice,
      node.inArrayKw,
      node.right,
      node.loop,
    ]),
  foreach_slice: (node) => show([node.sliceKw, node.count]),
  break_stmt: (node) => show([node.breakKw, node.label, node.when]),
  continue_stmt: (node) => show([node.continueKw, node.label, node.when]),
  call_stmt: (node) => show([node.callKw, node.func]),
  return_stmt: (node) => show([node.returnKw, node.expr]),
  return_next_stmt: (node) => show([node.returnNextKw, node.expr]),
  return_query_stmt: (node) => show([node.returnQueryKw, node.expr]),
  raise_stmt: (node) =>
    show([node.raiseKw, node.level, node.error, node.using]),
  raise_level: (node) => show(node.levelKw),
  raise_sqlstate: (node) => show([node.sqlstateKw, node.code]),
  raise_format_string: (node) =>
    show([node.format, node.args ? "," : "", node.args]),
  raise_using_clause: (node) => show([node.usingKw, node.options]),
  raise_option_element: (node) =>
    show([node.nameKw, node.operator, node.value]),
  null_stmt: (node) => show([node.nullKw]),
};
