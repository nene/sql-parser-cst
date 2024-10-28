import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllDomainNodes } from "src/cst/Domain";

export const domainMap: FullTransformMap<string, AllDomainNodes> = {
  // CREATE DOMAIN
  create_domain_stmt: (node) =>
    show([
      node.createDomainKw,
      node.name,
      node.asKw,
      node.dataType,
      node.constraints,
    ]),
  // ALTER DOMAIN
  alter_domain_stmt: (node) =>
    show([node.alterDomainKw, node.name, node.action]),
  // DROP DOMAIN
  drop_domain_stmt: (node) =>
    show([node.dropDomainKw, node.ifExistsKw, node.domains, node.behaviorKw]),
};
