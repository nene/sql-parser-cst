import { AlterSchemaAction } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { BigqueryOptionDefaultCollate, BigqueryOptions } from "./Bigquery";
import { Table } from "./Expr";

export type AllSchemaStatements =
  | CreateSchemaStmt
  | DropSchemaStmt
  | AlterSchemaStmt;

// CREATE SCHEMA
export interface CreateSchemaStmt extends BaseNode {
  type: "create_schema_stmt";
  createSchemaKw: [Keyword<"CREATE">, Keyword<"SCHEMA" | "DATABASE">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Table;
  options: CreateSchemaOption[];
}

type CreateSchemaOption = BigqueryOptions | BigqueryOptionDefaultCollate;

// DROP SCHEMA
export interface DropSchemaStmt extends BaseNode {
  type: "drop_schema_stmt";
  dropSchemaKw: [Keyword<"DROP">, Keyword<"SCHEMA" | "DATABASE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
  behaviorKw?: Keyword<"CASCADE" | "RESTRICT">;
}

// ALTER SCHEMA
export interface AlterSchemaStmt extends BaseNode {
  type: "alter_schema_stmt";
  alterSchemaKw: [Keyword<"ALTER">, Keyword<"SCHEMA" | "DATABASE">];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: Table;
  actions: AlterSchemaAction[];
}
