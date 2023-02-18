import { FullTransformMap } from "../cstTransformer";
import { Program } from "../cst/Node";
import { Node as AstNode } from "../ast/Node";
import { cstToAst } from "../cstToAst";

export const programMap: FullTransformMap<AstNode, Program> = {
  program: (node) => ({
    type: "program",
    statements: cstToAst(node.statements),
  }),
};
