import { show } from "../show";
import { AlterTableStmt } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const alterTableMap: FullTransformMap<string, AlterTableStmt> = {
  alter_table_stmt: (node) =>
    show([node.alterTableKw, node.ifExistsKw, node.table, node.actions]),
};
