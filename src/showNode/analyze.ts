import { show } from "../show";
import { AllAnalyzeNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const analyzeMap: FullTransformMap<string, AllAnalyzeNodes> = {
  analyze_stmt: (node) =>
    show([
      node.analyzeKw,
      node.verboseKw,
      node.options,
      node.tableKw,
      node.tables,
    ]),
};
