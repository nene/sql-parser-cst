import { AlterActionSetOptions } from "./AlterAction";
import { BaseNode, Keyword } from "./Base";
import { ColumnDefinition, WithPartitionColumnsClause } from "./CreateTable";
import {
  BinaryExpr,
  Expr,
  Identifier,
  ListExpr,
  ParenExpr,
  Table,
} from "./Expr";
import { JsonLiteral, StringLiteral } from "./Literal";
import { AsClause, WithConnectionClause } from "./ProcClause";
import { ClusterByClause, PartitionByClause, SubSelect } from "./Select";

export type AllBigqueryNodes =
  | BigqueryOptions
  | BigqueryOptionDefaultCollate
  | AllBigqueryStatements
  | RowAccessPolicyGrant
  | FromFilesOptions;

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
  | DropAssignmentStmt
  | CreateRowAccessPolicyStmt
  | DropRowAccessPolicyStmt
  | AlterOrganizationStmt
  | AlterProjectStmt
  | AlterBiCapacityStmt
  | AssertStmt
  | ExportDataStmt
  | LoadDataStmt;

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

export interface CreateRowAccessPolicyStmt extends BaseNode {
  type: "create_row_access_policy_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  rowAccessPolicyKw: [Keyword<"ROW">, Keyword<"ACCESS">, Keyword<"POLICY">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Keyword;
  onKw: Keyword<"ON">;
  table: Table;
  grantTo?: RowAccessPolicyGrant;
  filterUsingKw: [Keyword<"FILTER">, Keyword<"USING">];
  filterExpr: ParenExpr<Expr>;
}

export interface RowAccessPolicyGrant extends BaseNode {
  type: "row_access_policy_grant";
  grantToKw: [Keyword<"GRANT">, Keyword<"TO">];
  grantees: ParenExpr<ListExpr<StringLiteral>>;
}

export interface DropRowAccessPolicyStmt extends BaseNode {
  type: "drop_row_access_policy_stmt";
  dropKw: Keyword<"DROP">;
  allKw?: Keyword<"ALL">;
  rowAccessPolicyKw: [
    Keyword<"ROW">,
    Keyword<"ACCESS">,
    Keyword<"POLICY" | "POLICIES">
  ];
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name?: Keyword;
  onKw: Keyword<"ON">;
  table: Table;
}

// ALTER ORGANIZATION
export interface AlterOrganizationStmt extends BaseNode {
  type: "alter_organization_stmt";
  alterOrganizationKw: [Keyword<"ALTER">, Keyword<"ORGANIZATION">];
  actions: AlterActionSetOptions[];
}

// ALTER PROJECT
export interface AlterProjectStmt extends BaseNode {
  type: "alter_project_stmt";
  alterProjectKw: [Keyword<"ALTER">, Keyword<"PROJECT">];
  name: Identifier;
  actions: AlterActionSetOptions[];
}

// ALTER BI_CAPACITY
export interface AlterBiCapacityStmt extends BaseNode {
  type: "alter_bi_capacity_stmt";
  alterBiCapacityKw: [Keyword<"ALTER">, Keyword<"BI_CAPACITY">];
  name: Table;
  actions: AlterActionSetOptions[];
}

// ASSERT
export interface AssertStmt extends BaseNode {
  type: "assert_stmt";
  assertKw: Keyword<"ASSERT">;
  expr: Expr;
  as?: AsClause<StringLiteral>;
}

// EXPORT DATA
export interface ExportDataStmt extends BaseNode {
  type: "export_data_stmt";
  exportDataKw: [Keyword<"EXPORT">, Keyword<"DATA">];
  withConnection?: WithConnectionClause;
  options: BigqueryOptions;
  as: AsClause<SubSelect>;
}

// LOAD DATA
export interface LoadDataStmt extends BaseNode {
  type: "load_data_stmt";
  loadDataKw: [Keyword<"LOAD">, Keyword<"DATA">];
  intoKw: Keyword<"INTO" | "OVERWRITE">;
  table: Table;
  columns?: ParenExpr<ListExpr<ColumnDefinition>>;
  clauses: LoadDataClause[];
}

type LoadDataClause =
  | PartitionByClause
  | ClusterByClause
  | BigqueryOptions
  | FromFilesOptions
  | WithPartitionColumnsClause
  | WithConnectionClause;

export interface FromFilesOptions extends BaseNode {
  type: "from_files_options";
  fromFilesKw: [Keyword<"FROM">, Keyword<"FILES">];
  options: ParenExpr<ListExpr<BinaryExpr<Identifier, "=", Expr>>>;
}
