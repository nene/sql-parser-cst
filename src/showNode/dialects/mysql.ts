import { show } from "../../show";
import { AllMysqlNodes } from "../../cst/Node";
import { FullTransformMap } from "../../cstTransformer";

export const mysqlMap: FullTransformMap<string, AllMysqlNodes> = {
  mysql_modifier: (node) => show(node.modifierKw),
};
