import { show } from "../../show";
import { AllPostgresqlNodes } from "../../cst/Node";
import { FullTransformMap } from "../../cstTransformer";

export const postgresqlMap: FullTransformMap<string, AllPostgresqlNodes> = {
  postgresql_operator_expr: (node) => show([node.operatorKw, node.expr]),
  postgresql_operator: (node) => show(node.operator),
};
