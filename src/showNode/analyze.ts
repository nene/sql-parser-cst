import { show } from "../show";
import { AnalyzeStmt } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const analyzeMap: FullTransformMap<string, AnalyzeStmt> = {
  analyze_stmt: (node) => show([node.analyzeKw, node.tableKw, node.tables]),
};
