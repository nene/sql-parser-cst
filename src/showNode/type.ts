import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllTypeNodes } from "src/cst/Type";

export const typeMap: FullTransformMap<string, AllTypeNodes> = {
  // CREATE TYPE
  create_type_stmt: (node) =>
    show([node.createTypeKw, node.name, node.definition]),
  composite_type_definition: (node) => show([node.asKw, node.columns]),
  enum_type_definition: (node) => show([node.asEnumKw, node.values]),
  // DROP TYPE
  drop_type_stmt: (node) =>
    show([node.dropTypeKw, node.ifExistsKw, node.types, node.behaviorKw]),
};
