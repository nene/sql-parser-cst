import { show } from "../show";
import { AllOtherClauses } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const otherClausesMap: FullTransformMap<string, AllOtherClauses> = {
  where_current_of_clause: (node) => show([node.whereCurrentOfKw, node.cursor]),
};
