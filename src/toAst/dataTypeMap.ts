import { TransformMap } from "../cstTransformer";
import { AllDataTypeNodes } from "../cst/Node";
import { Literal, Node as AstNode } from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToString } from "./transformUtils";

export const dataTypeMap: TransformMap<AstNode, AllDataTypeNodes> = {
  data_type: (node) => ({
    type: "data_type",
    name: keywordToString(node.nameKw),
    params:
      node.params?.type === "paren_expr"
        ? cstToAst<Literal[]>(node.params.expr.items)
        : undefined,
  }),
};
