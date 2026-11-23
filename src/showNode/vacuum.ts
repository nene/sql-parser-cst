import { show } from "../show";
import { AllVacuumNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const vacuumMap: FullTransformMap<string, AllVacuumNodes> = {
  vacuum_stmt: (node) =>
    show([node.vacuumKw, node.schema, node.intoKw, node.file]),
};
