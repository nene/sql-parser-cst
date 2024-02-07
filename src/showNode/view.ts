import { show } from "../show";
import { AllViewNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const viewMap: FullTransformMap<string, AllViewNodes> = {
  create_view_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.kinds,
      node.viewKw,
      node.ifNotExistsKw,
      node.name,
      node.columns,
      node.clauses,
    ]),
  with_check_option_clause: (node) =>
    show([node.withKw, node.levelKw, node.checkOptionKw]),
  as_replica_of_clause: (node) => show([node.asReplicaOfKw, node.view]),

  // DROP VIEW statement
  drop_view_stmt: (node) =>
    show([
      node.dropKw,
      node.kind,
      node.viewKw,
      node.ifExistsKw,
      node.views,
      node.behaviorKw,
    ]),
  // ALTER VIEW statement
  alter_view_stmt: (node) =>
    show([
      node.alterKw,
      node.kind,
      node.viewKw,
      node.ifExistsKw,
      node.name,
      node.columns,
      node.actions,
    ]),
  // REFRSH MATERIALIZED VIEW statement
  refresh_materialized_view_stmt: (node) =>
    show([
      node.refreshMaterializedViewKw,
      node.concurrentlyKw,
      node.name,
      node.clauses,
    ]),
};
