import { show } from "../show";
import { AllDclStatements } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const dclMap: FullTransformMap<string, AllDclStatements> = {
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
