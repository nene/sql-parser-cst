import { show } from "../show";
import { ExplainStmt } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const explainMap: FullTransformMap<string, ExplainStmt> = {
  explain_stmt: (node) =>
    show([node.explainKw, node.analyzeKw, node.queryPlanKw, node.statement]),
};
