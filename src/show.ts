import { Whitespace, Node } from "./cst/Node";
import { cstTransformer, FullTransformMap } from "./cstTransformer";
import { alterActionMap } from "./showNode/alter_action";
import { alterTableMap } from "./showNode/alter_table";
import { constraintMap } from "./showNode/constraint";
import { createTableMap } from "./showNode/create_table";
import { deleteMap } from "./showNode/delete";
import { dropTableMap } from "./showNode/drop_table";
import { insertMap } from "./showNode/insert";
import { mergeMap } from "./showNode/merge";
import { selectMap } from "./showNode/select";
import { truncateMap } from "./showNode/truncate";
import { updateMap } from "./showNode/update";
import { frameMap } from "./showNode/window_frame";
import { isDefined, isString } from "./utils/generic";

type NodeArray = (Node | NodeArray | string | undefined)[];

export function show(
  node: Node | NodeArray | string,
  joinString: string = ""
): string {
  if (isString(node)) {
    return node;
  }
  if (node instanceof Array) {
    return node
      .filter(isDefined)
      .map((n) => show(n))
      .join(joinString);
  }

  return [
    showWhitespace(node.leading),
    showNode(node),
    showWhitespace(node.trailing),
  ]
    .filter(isDefined)
    .join("");
}

const showWhitespace = (ws?: Whitespace[]): string | undefined => {
  if (!ws) {
    return undefined;
  }
  return ws.map(showWhitespaceItem).join("");
};

const showWhitespaceItem = (ws: Whitespace): string => ws.text;

const showNode = cstTransformer<string>({
  program: (node) => show(node.statements, ";"),
  empty: () => "",

  // SELECT, INSERT, UPDATE, DELETE, TRUNCATE, MERGE
  ...selectMap,
  ...insertMap,
  ...updateMap,
  ...deleteMap,
  ...truncateMap,
  ...mergeMap,

  // Window frame
  ...frameMap,

  // CREATE/ALTER/DROP TABLE
  ...createTableMap,
  ...constraintMap,
  ...alterTableMap,
  ...alterActionMap,
  ...dropTableMap,

  // additional clauses
  bigquery_option_default_collate: (node) =>
    show([node.defaultCollateKw, node.collation]),

  // CREATE SCHEMA statement
  create_schema_stmt: (node) =>
    show([node.createSchemaKw, node.ifNotExistsKw, node.name, node.options]),
  // DROP SCHEMA statement
  drop_schema_stmt: (node) =>
    show([node.dropSchemaKw, node.ifExistsKw, node.name, node.behaviorKw]),
  alter_schema_stmt: (node) =>
    show([node.alterSchemaKw, node.ifExistsKw, node.name, node.actions]),

  // CREATE VIEW statement
  create_view_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.materializedKw,
      node.viewKw,
      node.ifNotExistsKw,
      node.name,
      node.columns,
      node.clauses,
    ]),
  // DROP VIEW statement
  drop_view_stmt: (node) =>
    show([
      node.dropKw,
      node.materializedKw,
      node.viewKw,
      node.ifExistsKw,
      node.views,
      node.behaviorKw,
    ]),
  alter_view_stmt: (node) =>
    show([
      node.alterKw,
      node.materializedKw,
      node.viewKw,
      node.ifExistsKw,
      node.name,
      node.actions,
    ]),

  // CREATE INDEX statement
  create_index_stmt: (node) =>
    show([
      node.createKw,
      node.indexTypeKw,
      node.indexKw,
      node.ifNotExistsKw,
      node.name,
      node.onKw,
      node.table,
      node.columns,
      node.clauses,
    ]),
  verbose_all_columns: (node) => show(node.allColumnsKw),
  // DROP INDEX
  drop_index_stmt: (node) =>
    show([
      node.dropKw,
      node.indexTypeKw,
      node.indexKw,
      node.ifExistsKw,
      node.indexes,
      node.onKw,
      node.table,
    ]),

  // CREATE FUNCTION
  create_function_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.tableKw,
      node.functionKw,
      node.ifNotExistsKw,
      node.name,
      node.params,
      node.clauses,
    ]),
  function_param: (node) => show([node.name, node.dataType]),
  returns_clause: (node) => show([node.returnsKw, node.dataType]),
  determinism_clause: (node) => show([node.deterministicKw]),
  language_clause: (node) => show([node.languageKw, node.name]),
  as_clause: (node) => show([node.asKw, node.expr]),
  with_connection_clause: (node) =>
    show([node.withConnectionKw, node.connection]),
  // DROP FUNCTION
  drop_function_stmt: (node) =>
    show([
      node.dropKw,
      node.tableKw,
      node.functionKw,
      node.ifExistsKw,
      node.name,
    ]),

  // CREATE PROCEDURE
  create_procedure_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.procedureKw,
      node.ifNotExistsKw,
      node.name,
      node.params,
      node.clauses,
    ]),
  procedure_param: (node) => show([node.mode, node.name, node.dataType]),
  // DROP PROCEDURE
  drop_procedure_stmt: (node) =>
    show([node.dropKw, node.procedureKw, node.ifExistsKw, node.name]),

  // CREATE TRIGGER statement
  create_trigger_stmt: (node) =>
    show([
      node.createKw,
      node.temporaryKw,
      node.triggerKw,
      node.ifNotExistsKw,
      node.name,
      node.event,
      node.forEachRowKw,
      node.condition,
      node.body,
    ]),
  trigger_event: (node) =>
    show([
      node.timeKw,
      node.eventKw,
      node.ofKw,
      node.columns,
      node.onKw,
      node.table,
    ]),
  trigger_condition: (node) => show([node.whenKw, node.expr]),
  // DROP TRIGGER
  drop_trigger_stmt: (node) =>
    show([node.dropTriggerKw, node.ifExistsKw, node.trigger]),

  // ANALYZE statement
  analyze_stmt: (node) => show([node.analyzeKw, node.tableKw, node.tables]),

  // EXPLAIN statement
  explain_stmt: (node) =>
    show([node.explainKw, node.analyzeKw, node.queryPlanKw, node.statement]),

  // Transactions
  start_transaction_stmt: (node) =>
    show([node.startKw, node.behaviorKw, node.transactionKw]),
  commit_transaction_stmt: (node) => show([node.commitKw, node.transactionKw]),
  rollback_transaction_stmt: (node) =>
    show([node.rollbackKw, node.transactionKw, node.savepoint]),
  rollback_to_savepoint: (node) =>
    show([node.toKw, node.savepointKw, node.savepoint]),
  savepoint_stmt: (node) => show([node.savepointKw, node.savepoint]),
  release_savepoint_stmt: (node) =>
    show([node.releaseKw, node.savepointKw, node.savepoint]),

  // GRANT & REVOKE
  grant_stmt: (node) =>
    show([
      node.grantKw,
      node.roles,
      node.onKw,
      node.resourceType,
      node.resourceName,
      node.toKw,
      node.users,
    ]),
  revoke_stmt: (node) =>
    show([
      node.revokeKw,
      node.roles,
      node.onKw,
      node.resourceType,
      node.resourceName,
      node.fromKw,
      node.users,
    ]),

  // Procedural language
  labeled_stmt: (node) =>
    show([node.beginLabel, ":", node.statement, node.endLabel]),
  block_stmt: (node) =>
    show([node.beginKw, node.program, node.exception, node.endKw]),
  exception_clause: (node) =>
    show([
      node.exceptionKw,
      node.whenKw,
      node.condition,
      node.thenKw,
      node.program,
    ]),
  error_category: (node) => show(node.errorKw),
  declare_stmt: (node) =>
    show([node.declareKw, node.names, node.dataType, node.default]),
  declare_default: (node) => show([node.defaultKw, node.expr]),
  set_stmt: (node) => show([node.setKw, node.assignments]),
  if_stmt: (node) => show([node.clauses, node.endIfKw]),
  if_clause: (node) =>
    show([node.ifKw, node.condition, node.thenKw, node.consequent]),
  elseif_clause: (node) =>
    show([node.elseifKw, node.condition, node.thenKw, node.consequent]),
  else_clause: (node) => show([node.elseKw, node.consequent]),
  case_stmt: (node) =>
    show([node.caseKw, node.expr, node.clauses, node.endCaseKw]),
  loop_stmt: (node) => show([node.loopKw, node.body, node.endLoopKw]),
  repeat_stmt: (node) =>
    show([
      node.repeatKw,
      node.body,
      node.untilKw,
      node.condition,
      node.endRepeatKw,
    ]),
  while_stmt: (node) =>
    show([node.whileKw, node.condition, node.doKw, node.body, node.endWhileKw]),
  for_stmt: (node) =>
    show([
      node.forKw,
      node.left,
      node.inKw,
      node.right,
      node.doKw,
      node.body,
      node.endForKw,
    ]),
  break_stmt: (node) => show([node.breakKw, node.label]),
  continue_stmt: (node) => show([node.continueKw, node.label]),
  call_stmt: (node) => show([node.callKw, node.func]),
  return_stmt: (node) => show([node.returnKw, node.expr]),
  raise_stmt: (node) => show([node.raiseKw, node.message]),
  raise_message: (node) => show([node.usingMessageKw, "=", node.string]),

  // Prepared statements
  execute_stmt: (node) =>
    show([node.executeKw, node.immediateKw, node.expr, node.into, node.using]),
  execute_into_clause: (node) => show([node.intoKw, node.variables]),
  execute_using_clause: (node) => show([node.usingKw, node.values]),

  // SQLite-specific statements
  attach_database_stmt: (node) =>
    show([node.attachKw, node.databaseKw, node.file, node.asKw, node.schema]),
  detach_database_stmt: (node) =>
    show([node.detachKw, node.databaseKw, node.schema]),
  vacuum_stmt: (node) =>
    show([node.vacuumKw, node.schema, node.intoKw, node.file]),
  reindex_stmt: (node) => show([node.reindexKw, node.table]),
  pragma_stmt: (node) => show([node.pragmaKw, node.pragma]),
  pragma_assignment: (node) => show([node.name, "=", node.value]),
  pragma_func_call: (node) => show([node.name, node.args]),

  // BigQuery-specific statements
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

  // Expressions
  list_expr: (node) => show(node.items, ","),
  paren_expr: (node) => "(" + show(node.expr) + ")",
  pair_expr: (node) => show([node.expr1, node.expr2]),
  binary_expr: (node) => show([node.left, node.operator, node.right]),
  prefix_op_expr: (node) => show([node.operator, node.expr]),
  postfix_op_expr: (node) => show([node.expr, node.operator]),
  func_call: (node) => show([node.name, node.args, node.filter, node.over]),
  func_args: (node) =>
    show([
      node.distinctKw,
      node.args,
      node.nullHandlingKw,
      node.orderBy,
      node.limit,
    ]),
  named_arg: (node) => show([node.name, "=>", node.value]),
  cast_expr: (node) => show([node.castKw, node.args]),
  cast_arg: (node) => show([node.expr, node.asKw, node.dataType, node.format]),
  cast_format: (node) => show([node.formatKw, node.string, node.timezone]),
  cast_format_timezone: (node) => show([node.atTimeZoneKw, node.timezone]),
  raise_expr: (node) => show([node.raiseKw, node.args]),
  raise_expr_type: (node) => show(node.typeKw),
  extract_expr: (node) => show([node.extractKw, node.args]),
  extract_from: (node) => show([node.unit, node.fromKw, node.expr]),
  week_expr: (node) => show([node.weekKw, node.args]),
  filter_arg: (node) => show([node.filterKw, node.where]),
  over_arg: (node) => show([node.overKw, node.window]),
  between_expr: (node) =>
    show([node.left, node.betweenKw, node.begin, node.andKw, node.end]),
  case_expr: (node) => show([node.caseKw, node.expr, node.clauses, node.endKw]),
  case_when: (node) =>
    show([node.whenKw, node.condition, node.thenKw, node.result]),
  case_else: (node) => show([node.elseKw, node.result]),
  interval_expr: (node) => show([node.intervalKw, node.expr, node.unit]),
  interval_unit_range: (node) =>
    show([node.fromUnitKw, node.toKw, node.toUnitKw]),
  typed_expr: (node) => show([node.dataType, node.expr]),
  array_expr: (node) => show(["[", node.expr, "]"]),
  struct_expr: (node) => show(["(", node.expr, ")"]),
  quantifier_expr: (node) => show([node.quantifier, node.expr]),
  full_text_match_expr: (node) =>
    show([node.matchKw, node.columns, node.againstKw, node.args]),
  full_text_match_args: (node) => show([node.expr, node.modifier]),

  // Data types
  data_type: (node) => show([node.nameKw, node.params]),
  generic_type_params: (node) => show(["<", node.params, ">"]),
  array_type_param: (node) => show([node.dataType, node.constraints]),
  struct_type_param: (node) =>
    show([node.name, node.dataType, node.constraints]),

  // Tables & columns
  member_expr: (node) =>
    show(
      [node.object, node.property],
      node.property.type === "array_subscript" ? "" : "."
    ),
  bigquery_quoted_member_expr: (node) => show(["`", node.expr, "`"]),
  array_subscript: (node) => show(["[", node.expr, "]"]),
  array_subscript_specifier: (node) => show([node.specifierKw, node.args]),
  alias: (node) => show([node.expr, node.asKw, node.alias]),
  all_columns: () => "*",

  // special literals
  string_with_charset: (node) => "_" + node.charset + show(node.string),
  datetime_literal: (node) => show([node.datetimeKw, node.string]),
  date_literal: (node) => show([node.dateKw, node.string]),
  time_literal: (node) => show([node.timeKw, node.string]),
  timestamp_literal: (node) => show([node.timestampKw, node.string]),
  json_literal: (node) => show([node.jsonKw, node.string]),
  numeric_literal: (node) => show([node.numericKw, node.string]),
  bignumeric_literal: (node) => show([node.bignumericKw, node.string]),

  // Basic language elements
  keyword: (node) => node.text,
  identifier: (node) => node.text,
  string_literal: (node) => node.text,
  number_literal: (node) => node.text,
  blob_literal: (node) => node.text,
  boolean_literal: (node) => show(node.valueKw),
  null_literal: (node) => show(node.nullKw),
  variable: (node) => node.text,
  parameter: (node) => node.text,

  // Cast to FullTransformMap, so TypeScript ensures all node types are covered
} as FullTransformMap<string>);
