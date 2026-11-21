import { show } from "../show";
import { AllExplainNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const explainMap: FullTransformMap<string, AllExplainNodes> = {
  explain_stmt: (node) =>
    show([
      node.explainKw,
      node.analyzeKw,
      node.verboseKw,
      node.queryPlanKw,
      node.options,
      node.statement,
    ]),
  explain_option: (node) => show([node.name, node.value]),
};
