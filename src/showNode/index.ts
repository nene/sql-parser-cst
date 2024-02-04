import { show } from "../show";
import { AllIndexNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const indexMap: FullTransformMap<string, AllIndexNodes> = {
  create_index_stmt: (node) =>
    show([
      node.createKw,
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
};
