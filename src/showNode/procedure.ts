import { show } from "../show";
import { AllProcedureNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const procedureMap: FullTransformMap<string, AllProcedureNodes> = {
  create_procedure_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.procedureKw,
      node.ifNotExistsKw,
      node.name,
      node.params,
      node.clauses,
    ]),
  drop_procedure_stmt: (node) =>
    show([
      node.dropKw,
      node.procedureKw,
      node.ifExistsKw,
      node.name,
      node.params,
      node.behaviorKw,
    ]),
  alter_procedure_stmt: (node) =>
    show([
      node.alterKw,
      node.procedureKw,
      node.name,
      node.params,
      node.actions,
      node.behaviorKw,
    ]),
};
