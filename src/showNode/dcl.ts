import { show } from "../show";
import { AllDclNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const dclMap: FullTransformMap<string, AllDclNodes> = {
  grant_role_stmt: (node) =>
    show([
      node.grantKw,
      node.roles,
      node.onKw,
      node.resourceType,
      node.resourceName,
      node.toKw,
      node.users,
    ]),
  grant_privilege_stmt: (node) =>
    show([
      node.grantKw,
      node.privileges,
      node.onKw,
      node.resource,
      node.toKw,
      node.roles,
      node.withGrantOptionKw,
      node.grantedBy,
    ]),
  privilege: (node) => show([node.privilegeKw]),
  all_privileges: (node) => show([node.allKw, node.privilegesKw]),
  grant_resource_table: (node) => show([node.tableKw, node.tables]),
  grant_resource_all_tables_in_schema: (node) =>
    show([node.allTablesInSchemaKw, node.schemas]),
  granted_by_clause: (node) => show([node.grantedByKw, node.role]),

  revoke_stmt: (node) =>
    show([
      node.revokeKw,
      node.roles,
      node.onKw,
      node.resourceType,
      node.resourceName,
      node.fromKw,
      node.users,
    ]),
};
