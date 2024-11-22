import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllRoleNodes } from "src/main";

export const roleMap: FullTransformMap<string, AllRoleNodes> = {
  // CREATE ROLE
  create_role_stmt: (node) =>
    show([node.createRoleKw, node.name, node.withKw, node.options]),
  role_option_keyword: (node) => show(node.kw),
};
