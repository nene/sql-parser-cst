import { BaseNode, Keyword } from "./Base";
import { Identifier, ListExpr } from "./Expr";
import { StringLiteral } from "./Literal";
import { PostgresqlWithOptions } from "./Node";

export type AllSubscriptionNodes = AllSubscriptionStatements;

export type AllSubscriptionStatements =
  | CreateSubscriptionStmt
  | DropSubscriptionStmt;

// CREATE SUBSCRIPTION
export interface CreateSubscriptionStmt extends BaseNode {
  type: "create_subscription_stmt";
  createSubscriptionKw: [Keyword<"CREATE">, Keyword<"SUBSCRIPTION">];
  name: Identifier;
  connectionKw: Keyword<"CONNECTION">;
  connectionInfo: StringLiteral;
  publicationKw: Keyword<"PUBLICATION">;
  publications: ListExpr<Identifier>;
  with?: PostgresqlWithOptions;
}

// DROP SUBSCRIPTION
export interface DropSubscriptionStmt extends BaseNode {
  type: "drop_subscription_stmt";
  dropSubscriptionKw: [Keyword<"DROP">, Keyword<"SUBSCRIPTION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Identifier;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}
