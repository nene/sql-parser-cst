import { show } from "../show";
import { AllConstraintNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const constraintMap: FullTransformMap<string, AllConstraintNodes> = {
  constraint: (node) => show([node.name, node.constraint, node.deferrable]),
  constraint_name: (node) => show([node.constraintKw, node.name]),
  constraint_deferrable: (node) => show([node.deferrableKw, node.initiallyKw]),
  constraint_null: (node) => show(node.nullKw),
  constraint_not_null: (node) => show([node.notNullKw, node.onConflict]),
  constraint_auto_increment: (node) => show(node.autoIncrementKw),
  constraint_default: (node) => show([node.defaultKw, node.expr]),
  constraint_comment: (node) => show([node.commentKw, node.value]),
  constraint_primary_key: (node) =>
    show([node.primaryKeyKw, node.direction, node.columns, node.onConflict]),
  constraint_foreign_key: (node) =>
    show([node.foreignKeyKw, node.columns, node.references]),
  references_specification: (node) =>
    show([node.referencesKw, node.table, node.columns, node.options]),
  referential_action: (node) =>
    show([node.onKw, node.eventKw, node.actionKw, node.columns]),
  referential_match: (node) => show([node.matchKw, node.typeKw]),
  constraint_unique: (node) =>
    show([node.uniqueKw, node.nullsKw, node.columns, node.onConflict]),
  constraint_check: (node) => show([node.checkKw, node.expr, node.onConflict]),
  constraint_index: (node) =>
    show([node.indexTypeKw, node.indexKw, node.columns]),
  constraint_generated: (node) =>
    show([node.generatedKw, node.asKw, node.expr, node.storageKw]),
  identity_column: (node) => show(node.identityKw),
  constraint_collate: (node) => show([node.collateKw, node.collation]),
  constraint_visible: (node) => show(node.visibleKw),
  constraint_column_format: (node) =>
    show([node.columnFormatKw, node.formatKw]),
  constraint_storage: (node) => show([node.storageKw, node.typeKw]),
  constraint_engine_attribute: (node) =>
    show([node.engineAttributeKw, node.hasEq ? "=" : undefined, node.value]),
  constraint_compression: (node) => show([node.compressionKw, node.method]),
  on_conflict_clause: (node) => show([node.onConflictKw, node.resolutionKw]),
};
