import { show } from "../show";
import { AllAlterTableNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const alterTableMap: FullTransformMap<string, AllAlterTableNodes> = {
  alter_table_stmt: (node) =>
    show([node.alterTableKw, node.ifExistsKw, node.table, node.actions]),
  alter_table_all_in_tablespace_stmt: (node) =>
    show([
      node.alterTableKw,
      node.allInTablespaceKw,
      node.tablespace,
      node.ownedBy,
      node.action,
    ]),
  owned_by_clause: (node) => show([node.ownedByKw, node.owners]),
};
