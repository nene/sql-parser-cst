import { show } from "../show";
import { AllMysqlNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const mysqlMap: FullTransformMap<string, AllMysqlNodes> = {
  hint: (node) => show(node.hintKw),
};
