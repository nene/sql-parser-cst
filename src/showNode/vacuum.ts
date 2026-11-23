import { show } from "../show";
import { AllVacuumNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const vacuumMap: FullTransformMap<string, AllVacuumNodes> = {
  vacuum_database_stmt: (node) => show([node.vacuumKw, node.schema, node.into]),
  vacuum_into_clause: (node) => show([node.intoKw, node.file]),
};
