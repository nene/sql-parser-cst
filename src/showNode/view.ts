import { show } from "../show";
import { AllViewNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const viewMap: FullTransformMap<string, AllViewNodes> = {
  create_view_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.recursiveKw,
      node.materializedKw,
      node.viewKw,
      node.ifNotExistsKw,
      node.name,
      node.columns,
      node.clauses,
    ]),
  with_check_option_clause: (node) =>
    show([node.withKw, node.levelKw, node.checkOptionKw]),
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
      node.columns,
      node.actions,
    ]),
};
