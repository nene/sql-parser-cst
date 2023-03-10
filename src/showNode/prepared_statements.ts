import { show } from "../show";
import { AllPreparedStatementNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const preparedStatementsMap: FullTransformMap<
  string,
  AllPreparedStatementNodes
> = {
  execute_stmt: (node) =>
    show([node.executeKw, node.immediateKw, node.expr, node.into, node.using]),
  execute_into_clause: (node) => show([node.intoKw, node.variables]),
  execute_using_clause: (node) => show([node.usingKw, node.values]),
};
