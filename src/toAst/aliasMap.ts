import { FullTransformMap } from "../cstTransformer";
import { Alias } from "../cst/Node";
import { Node as AstNode } from "../ast/Node";
import { cstToAst } from "../cstToAst";

export const aliasMap: FullTransformMap<AstNode, Alias> = {
  alias: (node) => ({
    type: "alias",
    expr: cstToAst(node.expr),
    alias: cstToAst(node.alias),
  }),
};
