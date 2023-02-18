import { TransformMap } from "../cstTransformer";
import { AllFrameNodes } from "../cst/Node";
import { Node as AstNode } from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToString } from "./transformUtils";

export const windowFrameMap: TransformMap<AstNode, AllFrameNodes> = {
  frame_clause: (node) => ({
    type: "frame_clause",
    unit: keywordToString(node.unitKw),
    extent: cstToAst(node.extent),
    exclude: keywordToString(node.exclusion?.kindKw),
  }),
  frame_between: (node) => ({
    type: "frame_between",
    begin: cstToAst(node.begin),
    end: cstToAst(node.end),
  }),
  frame_bound_current_row: () => ({
    type: "frame_bound_current_row",
  }),
  frame_bound_preceding: (node) => ({
    type: "frame_bound_preceding",
    expr: cstToAst(node.expr),
  }),
  frame_bound_following: (node) => ({
    type: "frame_bound_following",
    expr: cstToAst(node.expr),
  }),
  frame_unbounded: () => ({
    type: "frame_unbounded",
  }),
};
