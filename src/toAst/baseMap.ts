import { FullTransformMap } from "../cstTransformer";
import { AllColumns } from "../cst/Node";
import { Node as AstNode } from "../ast/Node";

export const baseMap: FullTransformMap<AstNode, AllColumns> = {
  all_columns: (node) => node,
};
