import { show } from "../show";
import { AllDclNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const dclMap: FullTransformMap<string, AllDclNodes> = {
  grant_privilege_stmt: (node) =>
    show([
      node.grantKw,
      node.privileges,
      node.onKw,
      node.resource,
      node.toKw,
      node.roles,
      node.clauses,
    ]),
  grant_role_stmt: (node) =>
    show([
      node.grantKw,
      node.grantedRoles,
      node.toKw,
      node.granteeRoles,
      node.clauses,
    ]),
  privilege: (node) => show([node.privilegeKw, node.columns]),
  all_privileges: (node) => show([node.allKw, node.privilegesKw, node.columns]),
  grant_resource_table: (node) => show([node.tableKw, node.tables]),
  grant_resource_all_tables_in_schema: (node) =>
    show([node.allTablesInSchemaKw, node.schemas]),
  grant_resource_sequence: (node) => show([node.sequenceKw, node.sequences]),
  grant_resource_all_sequences_in_schema: (node) =>
    show([node.allSequencesInSchemaKw, node.schemas]),
  grant_resource_database: (node) => show([node.databaseKw, node.databases]),
  grant_resource_domain: (node) => show([node.domainKw, node.domains]),
  grant_resource_foreign_data_wrapper: (node) =>
    show([node.foreignDataWrapperKw, node.dataWrappers]),
  grant_resource_foreign_server: (node) =>
    show([node.foreignServerKw, node.servers]),
  grant_resource_function: (node) => show([node.functionKw, node.functions]),
  grant_resource_all_functions_in_schema: (node) =>
    show([node.allFunctionsInSchemaKw, node.schemas]),
  grant_resource_language: (node) => show([node.languageKw, node.languages]),
  grant_resource_large_object: (node) => show([node.largeObjectKw, node.oids]),
  grant_resource_postgresql_option: (node) =>
    show([node.parameterKw, node.options]),
  grant_resource_schema: (node) => show([node.schemaKw, node.schemas]),
  grant_resource_tablespace: (node) =>
    show([node.tablespaceKw, node.tablespaces]),
  grant_resource_type: (node) => show([node.typeKw, node.types]),
  grant_resource_view: (node) => show([node.viewKw, node.views]),
  with_grant_option_clause: (node) =>
    show([node.withKw, node.nameKw, node.value]),
  grant_option_for_clause: (node) => show([node.nameKw, node.optionForKw]),
  granted_by_clause: (node) => show([node.grantedByKw, node.role]),

  revoke_privilege_stmt: (node) =>
    show([
      node.revokeKw,
      node.option,
      node.privileges,
      node.onKw,
      node.resource,
      node.fromKw,
      node.roles,
      node.grantedBy,
      node.behaviorKw,
    ]),
  revoke_role_stmt: (node) =>
    show([
      node.revokeKw,
      node.option,
      node.grantedRoles,
      node.fromKw,
      node.granteeRoles,
      node.grantedBy,
      node.behaviorKw,
    ]),

  grantee_group: (node) => show([node.groupKw, node.name]),
  grantee_public: (node) => show([node.publicKw]),

  alter_default_privileges_stmt: (node) =>
    show([node.alterDefaultPrivilegesKw, node.action]),
  grant_default_privileges_action: (node) =>
    show([
      node.grantKw,
      node.privileges,
      node.onKw,
      node.resourcesKw,
      node.toKw,
      node.roles,
      node.withGrantOption,
    ]),
  revoke_default_privileges_action: (node) =>
    show([
      node.revokeKw,
      node.grantOptionFor,
      node.privileges,
      node.onKw,
      node.resourcesKw,
      node.fromKw,
      node.roles,
      node.behaviorKw,
    ]),
};
