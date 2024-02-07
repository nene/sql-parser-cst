import { show } from "../show";
import { AllIndexNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const indexMap: FullTransformMap<string, AllIndexNodes> = {
  create_index_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.indexTypeKw,
      node.indexKw,
      node.concurrentlyKw,
      node.ifNotExistsKw,
      node.name,
      node.onKw,
      node.table,
      node.using,
      node.columns,
      node.clauses,
    ]),
  verbose_all_columns: (node) => show(node.allColumnsKw),
  index_specification: (node) =>
    show([node.expr, node.opclass, node.direction, node.nullHandlingKw]),
  index_include_clause: (node) => show([node.includeKw, node.columns]),
  index_nulls_distinct_clause: (node) => show([node.nullsDistinctKw]),
  index_nulls_not_distinct_clause: (node) => show([node.nullsNotDistinctKw]),

  drop_index_stmt: (node) =>
    show([
      node.dropKw,
      node.indexTypeKw,
      node.indexKw,
      node.concurrentlyKw,
      node.ifExistsKw,
      node.indexes,
      node.onKw,
      node.table,
      node.behaviorKw,
    ]),

  alter_index_stmt: (node) =>
    show([
      node.alterKw,
      node.indexKw,
      node.ifExistsKw,
      node.index,
      node.action,
    ]),
  alter_index_all_in_tablespace_stmt: (node) =>
    show([
      node.alterIndexKw,
      node.allInTablespaceKw,
      node.tablespace,
      node.ownedBy,
      node.action,
    ]),

  reindex_stmt: (node) =>
    show([
      node.reindexKw,
      node.options,
      node.targetKw,
      node.concurrentlyKw,
      node.name,
    ]),
  reindex_option_concurrently: (node) =>
    show([node.concurrentlyKw, node.value]),
  reindex_option_tablespace: (node) => show([node.tablespaceKw, node.name]),
  reindex_option_verbose: (node) => show([node.verboseKw, node.value]),
};
