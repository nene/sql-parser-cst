import { show } from "../show";
import { AllSchemaStatements } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const schemaMap: FullTransformMap<string, AllSchemaStatements> = {
  create_schema_stmt: (node) =>
    show([node.createSchemaKw, node.ifNotExistsKw, node.name, node.options]),
  drop_schema_stmt: (node) =>
    show([node.dropSchemaKw, node.ifExistsKw, node.schemas, node.behaviorKw]),
  alter_schema_stmt: (node) =>
    show([node.alterSchemaKw, node.ifExistsKw, node.name, node.actions]),
};
