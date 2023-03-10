import { show } from "../show";
import { AllProcClauseNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const procClauseMap: FullTransformMap<string, AllProcClauseNodes> = {
  returns_clause: (node) => show([node.returnsKw, node.dataType]),
  determinism_clause: (node) => show([node.deterministicKw]),
  language_clause: (node) => show([node.languageKw, node.name]),
  as_clause: (node) => show([node.asKw, node.expr]),
  with_connection_clause: (node) =>
    show([node.withConnectionKw, node.connection]),
};
