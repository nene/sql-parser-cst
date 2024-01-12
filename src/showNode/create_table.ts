import { show } from "../show";
import { AllCreateTableNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const createTableMap: FullTransformMap<string, AllCreateTableNodes> = {
  create_table_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.unloggedKw,
      node.externalKw,
      node.snapshotKw,
      node.virtualKw,
      node.tableKw,
      node.ifNotExistsKw,
      node.name,
      node.columns,
      node.options,
      node.clauses,
    ]),
  column_definition: (node) =>
    show([
      node.name,
      node.dataType,
      node.constraints.length > 0 ? node.constraints : undefined,
    ]),

  // options
  table_option: (node) =>
    show([node.name, node.hasEq ? "=" : undefined, node.value]),

  // additional clauses
  create_table_like_clause: (node) => show([node.likeKw, node.name]),
  create_table_copy_clause: (node) => show([node.copyKw, node.name]),
  create_table_clone_clause: (node) => show([node.cloneKw, node.table]),
  with_partition_columns_clause: (node) =>
    show([node.withPartitionColumnsKw, node.columns]),
  create_table_using_clause: (node) => show([node.usingKw, node.module]),
};
