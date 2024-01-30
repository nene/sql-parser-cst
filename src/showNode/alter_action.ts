import { show } from "../show";
import { AllAlterActionNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const alterActionMap: FullTransformMap<string, AllAlterActionNodes> = {
  alter_action_rename: (node) => show([node.renameKw, node.newName]),
  alter_action_rename_column: (node) =>
    show([
      node.renameKw,
      node.ifExistsKw,
      node.oldName,
      node.toKw,
      node.newName,
    ]),
  alter_action_add_column: (node) =>
    show([node.addKw, node.ifNotExistsKw, node.column]),
  alter_action_drop_column: (node) =>
    show([node.dropKw, node.ifExistsKw, node.column, node.behaviorKw]),
  alter_action_set_default_collate: (node) =>
    show([node.setDefaultCollateKw, node.collation]),
  alter_action_set_options: (node) => show([node.setKw, node.options]),
  alter_action_add_constraint: (node) => show([node.addKw, node.constraint]),
  alter_action_drop_constraint: (node) =>
    show([
      node.dropConstraintKw,
      node.ifExistsKw,
      node.constraint,
      node.behaviorKw,
    ]),
  alter_action_alter_constraint: (node) =>
    show([node.alterConstraintKw, node.constraint, node.modifiers]),
  alter_action_rename_constraint: (node) =>
    show([node.renameConstraintKw, node.oldName, node.toKw, node.newName]),
  alter_action_validate_constraint: (node) =>
    show([node.validateConstraintKw, node.constraint]),
  alter_action_owner_to: (node) => show([node.ownerToKw, node.owner]),
  alter_action_set_schema: (node) => show([node.setSchemaKw, node.schema]),
  alter_action_enable: (node) => show([node.enableKw, node.modeKw, node.item]),
  alter_action_disable: (node) => show([node.disableKw, node.item]),
  alter_action_force: (node) => show([node.forceKw, node.item]),
  alter_action_no_force: (node) => show([node.noForceKw, node.item]),

  // ALTER COLUMN ...
  alter_action_alter_column: (node) =>
    show([node.alterKw, node.ifExistsKw, node.column, node.action]),
  alter_action_set_default: (node) => show([node.setDefaultKw, node.expr]),
  alter_action_drop_default: (node) => show([node.dropDefaultKw]),
  alter_action_set_not_null: (node) => show([node.setNotNullKw]),
  alter_action_drop_not_null: (node) => show([node.dropNotNullKw]),
  alter_action_set_data_type: (node) =>
    show([node.setDataTypeKw, node.dataType]),
  alter_action_set_visible: (node) => show([node.setVisibleKw]),
  alter_action_set_invisible: (node) => show([node.setInvisibleKw]),

  // ENABLE/DISABLE
  toggle_row_level_security: (node) => show([node.rowLevelSecurityKw]),
  toggle_trigger: (node) => show([node.triggerKw, node.name]),
  toggle_rule: (node) => show([node.ruleKw, node.name]),
};
