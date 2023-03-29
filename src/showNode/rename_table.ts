import { show } from "../show";
import { AllRenameTableNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const renameTableMap: FullTransformMap<string, AllRenameTableNodes> = {
  rename_table_stmt: (node) =>
    show([node.renameKw, node.tableKw, node.actions]),
  rename_action: (node) => show([node.from, node.toKw, node.to]),
};
