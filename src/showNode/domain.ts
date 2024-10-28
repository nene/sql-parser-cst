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
};
