import { BaseNode, Keyword } from "./Base";
import { Identifier } from "./Expr";

export type AllSubscriptionNodes = AllSubscriptionStatements;

export type AllSubscriptionStatements =
  | CreateSubscriptionStmt
  | DropSubscriptionStmt;

// CREATE SUBSCRIPTION
export interface CreateSubscriptionStmt extends BaseNode {
  type: "create_subscription_stmt";
  createSubscriptionKw: [Keyword<"CREATE">, Keyword<"SUBSCRIPTION">];
  name: Identifier;
}

// DROP SUBSCRIPTION
export interface DropSubscriptionStmt extends BaseNode {
  type: "drop_subscription_stmt";
  dropSubscriptionKw: [Keyword<"DROP">, Keyword<"SUBSCRIPTION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Identifier;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
