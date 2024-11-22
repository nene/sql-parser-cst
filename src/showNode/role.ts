import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllRoleNodes } from "src/main";

export const roleMap: FullTransformMap<string, AllRoleNodes> = {
  // CREATE ROLE
  create_role_stmt: (node) =>
    show([node.createRoleKw, node.name, node.withKw, node.options]),
  role_option_keyword: (node) => show(node.kw),
  role_option_connection_limit: (node) =>
    show([node.connectionLimitKw, node.limit]),
  role_option_password: (node) =>
    show([node.encryptedKw, node.passwordKw, node.password]),
  role_option_valid_until: (node) => show([node.validUntilKw, node.timestamp]),
  role_option_in_role: (node) => show([node.inRoleKw, node.names]),
  role_option_role: (node) => show([node.roleKw, node.names]),
  role_option_admin: (node) => show([node.adminKw, node.names]),
  role_option_sysid: (node) => show([node.sysIdKw, node.sysId]),

  // DROP ROLE
  drop_role_stmt: (node) =>
    show([node.dropRoleKw, node.ifExistsKw, node.names]),
};
