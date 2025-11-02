import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { AllSubscriptionNodes } from "src/cst/Node";

export const subscriptionMap: FullTransformMap<string, AllSubscriptionNodes> = {
  // CREATE SUBSCRIPTION
  create_subscription_stmt: (node) =>
    show([
      node.createSubscriptionKw,
      node.name,
      node.connectionKw,
      node.connectionInfo,
      node.publicationKw,
      node.publications,
      node.with,
    ]),

  // DROP SUBSCRIPTION
  drop_subscription_stmt: (node) =>
    show([
      node.dropSubscriptionKw,
      node.ifExistsKw,
      node.name,
      node.behaviorKw,
    ]),
};
