import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllPublicationNodes } from "src/cst/Node";

export const publicationMap: FullTransformMap<string, AllPublicationNodes> = {
  // CREATE PUBLICATION
  create_publication_stmt: (node) =>
    show([node.createPublicationKw, node.name, node.clauses]),
  for_publication_objects_clause: (node) =>
    show([node.forKw, node.publicationObjects]),
  all_publication_object: (node) => show([node.allKw, node.typesKw]),
  publication_object_table: (node) =>
    show([node.tableKw, node.table, node.columns, node.where]),
  publication_object_tables_in_schema: (node) =>
    show([node.tablesInSchemaKw, node.schema]),

  // ALTER PUBLICATION
  alter_publication_stmt: (node) =>
    show([node.alterPublicationKw, node.name, node.action]),
  alter_action_add_publication_objects: (node) =>
    show([node.addKw, node.publicationObjects]),
  alter_action_drop_publication_objects: (node) =>
    show([node.dropKw, node.publicationObjects]),
  alter_action_set_publication_objects: (node) =>
    show([node.setKw, node.publicationObjects]),

  // DROP PUBLICATION
  drop_publication_stmt: (node) =>
    show([
      node.dropPublicationKw,
      node.ifExistsKw,
      node.names,
      node.behaviorKw,
    ]),
};
