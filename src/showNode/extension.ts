import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllExtensionNodes } from "../cst/Node";

export const extensionMap: FullTransformMap<string, AllExtensionNodes> = {
  // CREATE EXTENSION
  create_extension_stmt: (node) =>
    show([
      node.createExtensionKw,
      node.ifNotExistsKw,
      node.name,
      node.withKw,
      node.clauses,
    ]),
  extension_schema_clause: (node) => show([node.schemaKw, node.name]),
  extension_version_clause: (node) => show([node.versionKw, node.name]),
  extension_cascade_clause: (node) => show([node.cascadeKw]),

  // DROP EXTENSION
  drop_extension_stmt: (node) =>
    show([node.dropExtensionKw, node.ifExistsKw, node.names, node.behaviorKw]),
};
