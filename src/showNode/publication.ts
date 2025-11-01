import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllPublicationNodes } from "src/cst/Node";

export const publicationMap: FullTransformMap<string, AllPublicationNodes> = {
  // CREATE PUBLICATION
  create_publication_stmt: (node) =>
    show([node.createPublicationKw, node.name]),
};
