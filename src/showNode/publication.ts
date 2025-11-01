import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllPublicationNodes } from "src/cst/Node";

export const publicationMap: FullTransformMap<string, AllPublicationNodes> = {
  // CREATE PUBLICATION
  create_publication_stmt: (node) =>
    show([node.createPublicationKw, node.name]),

  // ALTER PUBLICATION
  alter_publication_stmt: (node) =>
    show([node.alterPublicationKw, node.name, node.action]),

  // DROP PUBLICATION
  drop_publication_stmt: (node) =>
    show([
      node.dropPublicationKw,
      node.ifExistsKw,
      node.names,
      node.behaviorKw,
    ]),
};
