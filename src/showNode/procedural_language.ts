import { show } from "../show";
import { AllProceduralNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const proceduralLanguageMap: FullTransformMap<
  string,
  AllProceduralNodes
> = {
  labeled_stmt: (node) =>
    show([node.beginLabel, ":", node.statement, node.endLabel]),
  block_stmt: (node) =>
    show([node.beginKw, node.program, node.exception, node.endKw]),
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
    show([node.declareKw, node.names, node.dataType, node.default]),
  declare_default: (node) => show([node.defaultKw, node.expr]),
  set_stmt: (node) => show([node.setKw, node.assignments]),
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
  break_stmt: (node) => show([node.breakKw, node.label]),
  continue_stmt: (node) => show([node.continueKw, node.label]),
  call_stmt: (node) => show([node.callKw, node.func]),
  return_stmt: (node) => show([node.returnKw, node.expr]),
  raise_stmt: (node) => show([node.raiseKw, node.message]),
  raise_message: (node) => show([node.usingMessageKw, "=", node.string]),
};
