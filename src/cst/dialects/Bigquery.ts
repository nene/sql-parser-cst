import { AlterActionSetBigqueryOptions } from "../AlterAction";
import { BaseNode, Keyword } from "../Base";
import { ColumnDefinition, WithPartitionColumnsClause } from "../CreateTable";
import {
  BinaryExpr,
  Expr,
  Identifier,
  ListExpr,
  ParenExpr,
  EntityName,
} from "../Expr";
import { StringLiteral } from "../Literal";
import { ClusterByClause } from "../OtherClauses";
import { AsClause, WithConnectionClause } from "../ProcClause";
import { PartitionByClause, SubSelect } from "../Select";

export type AllBigqueryNodes =
  | BigqueryOptions
  | BigqueryOptionDefaultCollate
  | AllBigqueryStatements
  | RowAccessPolicyGrantClause
  | RowAccessPolicyFilterClause
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
  | AlterCapacityStmt
  | AlterReservationStmt
  | AssertStmt
  | ExportDataStmt
  | LoadDataStmt;

export interface CreateCapacityStmt extends BaseNode {
  type: "create_capacity_stmt";
  createKw: Keyword<"CREATE">;
  capacityKw: Keyword<"CAPACITY">;
  name: EntityName;
  options: BigqueryOptions;
}

export interface DropCapacityStmt extends BaseNode {
  type: "drop_capacity_stmt";
  dropKw: Keyword<"DROP">;
  capacityKw: Keyword<"CAPACITY">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
}

export interface CreateReservationStmt extends BaseNode {
  type: "create_reservation_stmt";
  createKw: Keyword<"CREATE">;
  reservationKw: Keyword<"RESERVATION">;
  name: EntityName;
  options: BigqueryOptions;
}

export interface DropReservationStmt extends BaseNode {
  type: "drop_reservation_stmt";
  dropKw: Keyword<"DROP">;
  reservationKw: Keyword<"RESERVATION">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
}

export interface CreateAssignmentStmt extends BaseNode {
  type: "create_assignment_stmt";
  createKw: Keyword<"CREATE">;
  assignmentKw: Keyword<"ASSIGNMENT">;
  name: EntityName;
  options: BigqueryOptions;
}

export interface DropAssignmentStmt extends BaseNode {
  type: "drop_assignment_stmt";
  dropKw: Keyword<"DROP">;
  assignmentKw: Keyword<"ASSIGNMENT">;
  ifExistsKw?: [Keyword<"IF">, Keyword<"EXISTS">];
  name: EntityName;
}

export interface CreateRowAccessPolicyStmt extends BaseNode {
  type: "create_row_access_policy_stmt";
  createKw: Keyword<"CREATE">;
  orReplaceKw?: [Keyword<"OR">, Keyword<"REPLACE">];
  rowAccessPolicyKw: [Keyword<"ROW">, Keyword<"ACCESS">, Keyword<"POLICY">];
  ifNotExistsKw?: [Keyword<"IF">, Keyword<"NOT">, Keyword<"EXISTS">];
  name: Keyword;
  onKw: Keyword<"ON">;
  table: EntityName;
  clauses: (RowAccessPolicyGrantClause | RowAccessPolicyFilterClause)[];
}

export interface RowAccessPolicyGrantClause extends BaseNode {
  type: "row_access_policy_grant_clause";
  grantToKw: [Keyword<"GRANT">, Keyword<"TO">];
  grantees: ParenExpr<ListExpr<StringLiteral>>;
}

export interface RowAccessPolicyFilterClause extends BaseNode {
  type: "row_access_policy_filter_clause";
  filterUsingKw: [Keyword<"FILTER">, Keyword<"USING">];
  expr: ParenExpr<Expr>;
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
  table: EntityName;
}

// ALTER ORGANIZATION
export interface AlterOrganizationStmt extends BaseNode {
  type: "alter_organization_stmt";
  alterOrganizationKw: [Keyword<"ALTER">, Keyword<"ORGANIZATION">];
  actions: AlterActionSetBigqueryOptions[];
}

// ALTER PROJECT
export interface AlterProjectStmt extends BaseNode {
  type: "alter_project_stmt";
  alterProjectKw: [Keyword<"ALTER">, Keyword<"PROJECT">];
  name: Identifier;
  actions: AlterActionSetBigqueryOptions[];
}

// ALTER BI_CAPACITY
export interface AlterBiCapacityStmt extends BaseNode {
  type: "alter_bi_capacity_stmt";
  alterBiCapacityKw: [Keyword<"ALTER">, Keyword<"BI_CAPACITY">];
  name: EntityName;
  actions: AlterActionSetBigqueryOptions[];
}

// ALTER CAPACITY
export interface AlterCapacityStmt extends BaseNode {
  type: "alter_capacity_stmt";
  alterCapacityKw: [Keyword<"ALTER">, Keyword<"CAPACITY">];
  name: EntityName;
  actions: AlterActionSetBigqueryOptions[];
}

// ALTER RESERVATION
export interface AlterReservationStmt extends BaseNode {
  type: "alter_reservation_stmt";
  alterReservationKw: [Keyword<"ALTER">, Keyword<"RESERVATION">];
  name: EntityName;
  actions: AlterActionSetBigqueryOptions[];
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
  table: EntityName;
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
