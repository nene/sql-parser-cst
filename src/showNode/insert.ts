import { show } from "../show";
import { AllInsertNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const insertMap: FullTransformMap<string, AllInsertNodes> = {
  insert_stmt: (node) => show(node.clauses),
  insert_clause: (node) =>
    show([
      node.insertKw,
      node.modifiers,
      node.orAction,
      node.intoKw,
      node.table,
      node.columns,
    ]),
  or_alternate_action: (node) => show([node.orKw, node.actionKw]),
  // VALUES
  values_clause: (node) => show([node.valuesKw, node.values]),
  default_values: (node) => show(node.defaultValuesKw),
  default: (node) => show(node.defaultKw),
  // OVERRIDING
  overriding_clause: (node) => show(node.overridingKw),

  // ON CONFLICT
  upsert_clause: (node) =>
    show([
      node.onConflictKw,
      node.conflictTarget,
      node.where,
      node.doKw,
      node.action,
    ]),
  conflict_target_on_constraint: (node) =>
    show([node.onConstraintKw, node.constraint]),
  upsert_action_nothing: (node) => show(node.nothingKw),
  upsert_action_update: (node) => show([node.updateKw, node.set, node.where]),

  row_alias_clause: (node) =>
    show([node.asKw, node.rowAlias, node.columnAliases]),
  on_duplicate_key_update_clause: (node) =>
    show([node.onDuplicateKeyUpdateKw, node.assignments]),
};
