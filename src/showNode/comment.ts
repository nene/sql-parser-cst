import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllCommentNodes } from "../cst/Node";

export const commentMap: FullTransformMap<string, AllCommentNodes> = {
  comment_stmt: (node) =>
    show([node.commentKw, node.onKw, node.target, node.isKw, node.message]),
  comment_target_column: (node) => show([node.columnKw, node.name]),
  comment_target_schema: (node) => show([node.schemaKw, node.name]),
  comment_target_table: (node) => show([node.tableKw, node.name]),
};
