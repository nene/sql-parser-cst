import { show } from "../../show";
import { AllSqliteNodes } from "../../cst/Node";
import { FullTransformMap } from "../../cstTransformer";

export const sqliteMap: FullTransformMap<string, AllSqliteNodes> = {
  attach_database_stmt: (node) =>
    show([node.attachKw, node.databaseKw, node.file, node.asKw, node.schema]),
  detach_database_stmt: (node) =>
    show([node.detachKw, node.databaseKw, node.schema]),
  vacuum_stmt: (node) =>
    show([node.vacuumKw, node.schema, node.intoKw, node.file]),
  pragma_stmt: (node) => show([node.pragmaKw, node.pragma]),
  pragma_assignment: (node) => show([node.name, "=", node.value]),
  pragma_func_call: (node) => show([node.name, node.args]),
};
