import { BaseNode, Keyword } from "./Base";
import {
  BinaryExpr,
  Expr,
  Identifier,
  ListExpr,
  ParenExpr,
  Table,
} from "./Expr";
import { JsonLiteral, StringLiteral } from "./Literal";

export type AllBigqueryNodes =
  | BigqueryOptions
  | BigqueryOptionDefaultCollate
  | AllBigqueryStatements;

export interface BigqueryOptions extends BaseNode {
  type: "bigquery_options";
  optionsKw: Keyword<"OPTIONS">;
  options: ParenExpr<ListExpr<BinaryExpr<Identifier, "=", Expr>>>;
}

export interface BigqueryOptionDefaultCollate extends BaseNode {
  type: "bigquery_option_default_collate";
  defaultCollateKw: [Keyword<"DEFAULT">, Keyword<"COLLATE">];
  collation: StringLiteral;
}

export type AllBigqueryStatements =
  | CreateCapacityStmt
  | DropCapacityStmt
  | CreateReservationStmt
  | DropReservationStmt
  | CreateAssignmentStmt
  | DropAssignmentStmt;

export interface CreateCapacityStmt extends BaseNode {
  type: "create_capacity_stmt";
  createKw: [Keyword<"CREATE">, Keyword<"CAPACITY">];
  name: Table;
  asKw: Keyword<"AS">;
  json: JsonLiteral;
}

export interface DropCapacityStmt extends BaseNode {
  type: "drop_capacity_stmt";
  dropKw: [Keyword<"DROP">, Keyword<"CAPACITY">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
}

export interface CreateReservationStmt extends BaseNode {
  type: "create_reservation_stmt";
  createKw: [Keyword<"CREATE">, Keyword<"RESERVATION">];
  name: Table;
  asKw: Keyword<"AS">;
  json: JsonLiteral;
}

export interface DropReservationStmt extends BaseNode {
  type: "drop_reservation_stmt";
  dropKw: [Keyword<"DROP">, Keyword<"RESERVATION">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
}

export interface CreateAssignmentStmt extends BaseNode {
  type: "create_assignment_stmt";
  createKw: [Keyword<"CREATE">, Keyword<"ASSIGNMENT">];
  name: Table;
  asKw: Keyword<"AS">;
  json: JsonLiteral;
}

export interface DropAssignmentStmt extends BaseNode {
  type: "drop_assignment_stmt";
  dropKw: [Keyword<"DROP">, Keyword<"ASSIGNMENT">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
}
