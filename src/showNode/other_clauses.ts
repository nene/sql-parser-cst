import { show } from "../show";
import { AllOtherClauses } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const otherClausesMap: FullTransformMap<string, AllOtherClauses> = {
  returning_clause: (node) => show([node.returningKw, node.columns]),
  where_current_of_clause: (node) => show([node.whereCurrentOfKw, node.cursor]),
  cluster_by_clause: (node) => show([node.clusterByKw, node.columns]),
};
