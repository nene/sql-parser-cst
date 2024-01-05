import { show } from "../../show";
import { AllBigqueryNodes } from "../../cst/Node";
import { FullTransformMap } from "../../cstTransformer";

export const bigqueryMap: FullTransformMap<string, AllBigqueryNodes> = {
  bigquery_options: (node) => show([node.optionsKw, node.options]),
  bigquery_option_default_collate: (node) =>
    show([node.defaultCollateKw, node.collation]),

  create_capacity_stmt: (node) =>
    show([node.createKw, node.capacityKw, node.name, node.options]),
  drop_capacity_stmt: (node) =>
    show([node.dropKw, node.capacityKw, node.ifExistsKw, node.name]),
  create_reservation_stmt: (node) =>
    show([node.createKw, node.reservationKw, node.name, node.options]),
  drop_reservation_stmt: (node) =>
    show([node.dropKw, node.reservationKw, node.ifExistsKw, node.name]),
  create_assignment_stmt: (node) =>
    show([node.createKw, node.assignmentKw, node.name, node.options]),
  drop_assignment_stmt: (node) =>
    show([node.dropKw, node.assignmentKw, node.ifExistsKw, node.name]),
  create_row_access_policy_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.rowAccessPolicyKw,
      node.ifNotExistsKw,
      node.name,
      node.onKw,
      node.table,
      node.clauses,
    ]),
  row_access_policy_grant_clause: (node) =>
    show([node.grantToKw, node.grantees]),
  row_access_policy_filter_clause: (node) =>
    show([node.filterUsingKw, node.expr]),
  drop_row_access_policy_stmt: (node) =>
    show([
      node.dropKw,
      node.allKw,
      node.rowAccessPolicyKw,
      node.ifExistsKw,
      node.name,
      node.onKw,
      node.table,
    ]),
  alter_organization_stmt: (node) =>
    show([node.alterOrganizationKw, node.actions]),
  alter_project_stmt: (node) =>
    show([node.alterProjectKw, node.name, node.actions]),
  alter_bi_capacity_stmt: (node) =>
    show([node.alterBiCapacityKw, node.name, node.actions]),
  alter_capacity_stmt: (node) =>
    show([node.alterCapacityKw, node.name, node.actions]),
  alter_reservation_stmt: (node) =>
    show([node.alterReservationKw, node.name, node.actions]),
  assert_stmt: (node) => show([node.assertKw, node.expr, node.as]),
  export_data_stmt: (node) =>
    show([node.exportDataKw, node.withConnection, node.options, node.as]),
  load_data_stmt: (node) =>
    show([
      node.loadDataKw,
      node.intoKw,
      node.table,
      node.columns,
      node.clauses,
    ]),
  from_files_options: (node) => show([node.fromFilesKw, node.options]),
};
