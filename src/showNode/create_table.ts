import { show } from "../show";
import { AllCreateTableNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const createTableMap: FullTransformMap<string, AllCreateTableNodes> = {
  create_table_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.kind,
      node.tableKw,
      node.ifNotExistsKw,
      node.name,
      node.partitionOf,
      node.ofType,
      node.columns,
      node.options,
      node.clauses,
    ]),
  table_kind: (node) => show(node.kindKw),
  column_definition: (node) =>
    show([
      node.name,
      node.dataType,
      node.withOptionsKw,
      node.constraints.length > 0 ? node.constraints : undefined,
    ]),

  // options
  table_option: (node) =>
    show([node.name, node.hasEq ? "=" : undefined, node.value]),

  // additional clauses
  create_table_like_clause: (node) =>
    show([node.likeKw, node.name, node.options]),
  table_like_option: (node) =>
    show([node.includingOrExcludingKw, node.optionKw]),
  create_table_copy_clause: (node) => show([node.copyKw, node.name]),
  create_table_clone_clause: (node) => show([node.cloneKw, node.table]),
  with_partition_columns_clause: (node) =>
    show([node.withPartitionColumnsKw, node.columns]),
  create_table_using_clause: (node) => show([node.usingKw, node.module]),
  create_table_inherits_clause: (node) => show([node.inheritsKw, node.tables]),
  create_table_partition_by_clause: (node) =>
    show([node.partitionByKw, node.strategyKw, node.columns]),
  create_table_partition_of_clause: (node) =>
    show([node.partitionOfKw, node.table]),
  create_table_partition_bound_clause: (node) =>
    show([node.forValuesKw, node.bound]),
  partition_bound_from_to: (node) =>
    show([node.fromKw, node.from, node.toKw, node.to]),
  partition_bound_minvalue: (node) => show([node.minvalueKw]),
  partition_bound_maxvalue: (node) => show([node.maxvalueKw]),
  partition_bound_in: (node) => show([node.inKw, node.values]),
  partition_bound_with: (node) => show([node.withKw, node.values]),
  partition_bound_modulus: (node) => show([node.modulusKw, node.value]),
  partition_bound_remainder: (node) => show([node.remainderKw, node.value]),
  create_table_default_partition_clause: (node) => show(node.defaultKw),
  create_table_on_commit_clause: (node) =>
    show([node.onCommitKw, node.actionKw]),
  tablespace_clause: (node) => show([node.tablespaceKw, node.name]),
  using_access_method_clause: (node) => show([node.usingKw, node.method]),
  create_table_without_oids_clause: (node) => show(node.withoutOidsKw),
  create_table_with_data_clause: (node) => show(node.withDataKw),
  create_table_of_type_clause: (node) => show([node.ofKw, node.typeName]),
  create_table_server_clause: (node) => show([node.serverKw, node.name]),
};
