import { show } from "../show";
import { AllFrameNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const frameMap: FullTransformMap<string, AllFrameNodes> = {
  frame_clause: (node) => show([node.unitKw, node.extent, node.exclusion]),
  frame_between: (node) =>
    show([node.betweenKw, node.begin, node.andKw, node.end]),
  frame_bound_current_row: (node) => show(node.currentRowKw),
  frame_bound_preceding: (node) => show([node.expr, node.precedingKw]),
  frame_bound_following: (node) => show([node.expr, node.followingKw]),
  frame_unbounded: (node) => show(node.unboundedKw),
  frame_exclusion: (node) => show([node.excludeKw, node.kindKw]),
};
