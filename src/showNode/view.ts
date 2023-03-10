import { show } from "../show";
import { AllViewStatements } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const viewMap: FullTransformMap<string, AllViewStatements> = {
  create_view_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.materializedKw,
      node.viewKw,
      node.ifNotExistsKw,
      node.name,
      node.columns,
      node.clauses,
    ]),
  // DROP VIEW statement
  drop_view_stmt: (node) =>
    show([
      node.dropKw,
      node.materializedKw,
      node.viewKw,
      node.ifExistsKw,
      node.views,
      node.behaviorKw,
    ]),
  alter_view_stmt: (node) =>
    show([
      node.alterKw,
      node.materializedKw,
      node.viewKw,
      node.ifExistsKw,
      node.name,
      node.actions,
    ]),
};
