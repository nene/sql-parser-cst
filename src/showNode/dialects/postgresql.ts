import { show } from "../../show";
import { AllPostgresqlNodes } from "../../cst/Node";
import { FullTransformMap } from "../../cstTransformer";

export const postgresqlMap: FullTransformMap<string, AllPostgresqlNodes> = {
  postgresql_operator_expr: (node) => show([node.operatorKw, node.expr]),
  postgresql_operator: (node) => show(node.operator),
  postgresql_operator_class: (node) => show(node.name),
  postgresql_options: (node) => show([node.optionsKw, node.options]),
  postgresql_option_element: (node) => show([node.name, node.value]),
  postgresql_with_options: (node) => show([node.withKw, node.options]),
};
