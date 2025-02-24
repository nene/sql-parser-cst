import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllPolicyNodes } from "src/main";

export const policyMap: FullTransformMap<string, AllPolicyNodes> = {
  // CREATE POLICY
  create_policy_stmt: (node) =>
    show([node.createPolicyKw, node.name, node.onKw, node.table, node.clauses]),

  // Policy clauses
  policy_permissive_clause: (node) => show([node.asKw, node.permissiveKw]),
  policy_restrictive_clause: (node) => show([node.asKw, node.restrictiveKw]),
  policy_command_clause: (node) => show([node.forKw, node.commandKw]),
  policy_roles_clause: (node) => show([node.toKw, node.roles]),
  policy_using_clause: (node) => show([node.usingKw, node.expr]),
  policy_check_clause: (node) => show([node.withKw, node.checkKw, node.expr]),

  // DROP POLICY
  drop_policy_stmt: (node) =>
    show([
      node.dropPolicyKw,
      node.ifExistsKw,
      node.name,
      node.onKw,
      node.table,
      node.behaviorKw,
    ]),
};
