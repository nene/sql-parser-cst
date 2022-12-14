import { Whitespace, Node } from "./cst/Node";
import { cstTransformer, FullTransformMap } from "./cstTransformer";
import { isDefined } from "./utils/generic";

type NodeArray = (Node | NodeArray | string | undefined)[];

export function show(
  node: Node | NodeArray | string,
  joinString: string = ""
): string {
  if (typeof node === "string") {
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
  code_block: (node) => show([node.beginKw, node.program, node.endKw]),
  empty: () => "",

  // SELECT statement
  compound_select_stmt: (node) => show([node.left, node.operator, node.right]),
  select_stmt: (node) => show(node.clauses),
  // WITH
  with_clause: (node) => show([node.withKw, node.recursiveKw, node.tables]),
  common_table_expression: (node) =>
    show([node.table, node.columns, node.asKw, node.optionKw, node.expr]),
  // SELECT
  select_clause: (node) =>
    show([
      node.selectKw,
      node.distinctKw,
      node.options,
      node.asStructOrValueKw,
      node.columns,
    ]),
  except_columns: (node) => show([node.expr, node.exceptKw, node.columns]),
  replace_columns: (node) => show([node.expr, node.replaceKw, node.columns]),
  // FROM
  from_clause: (node) => show([node.fromKw, node.expr]),
  join_expr: (node) =>
    show([node.left, node.operator, node.right, node.specification]),
  join_on_specification: (node) => show([node.onKw, node.expr]),
  join_using_specification: (node) => show([node.usingKw, node.expr]),
  pivot_expr: (node) => show([node.left, node.pivotKw, node.args]),
  pivot_for_in: (node) =>
    show([
      node.aggregations,
      node.forKw,
      node.inputColumn,
      node.inKw,
      node.pivotColumns,
    ]),
  unpivot_expr: (node) =>
    show([node.left, node.unpivotKw, node.nullHandlingKw, node.args]),
  unpivot_for_in: (node) =>
    show([
      node.valuesColumn,
      node.forKw,
      node.nameColumn,
      node.inKw,
      node.unpivotColumns,
    ]),
  tablesample_expr: (node) => show([node.left, node.tablesampleKw, node.args]),
  tablesample_percent: (node) => show([node.percent, node.percentKw]),
  sort_specification: (node) =>
    show([node.expr, node.orderKw, node.nullHandlingKw]),
  // WHERE .. GROUP BY .. HAVING .. QUALIFY ... ORDER BY .. PARTITION BY .. CLUSTER BY
  where_clause: (node) => show([node.whereKw, node.expr]),
  group_by_clause: (node) => show([node.groupByKw, node.columns]),
  group_by_rollup: (node) => show([node.rollupKw, node.columns]),
  having_clause: (node) => show([node.havingKw, node.expr]),
  qualify_clause: (node) => show([node.qualifyKw, node.expr]),
  order_by_clause: (node) =>
    show([node.orderByKw, node.specifications, node.withRollupKw]),
  partition_by_clause: (node) =>
    show([node.partitionByKw, node.specifications]),
  cluster_by_clause: (node) => show([node.clusterByKw, node.columns]),
  // WINDOW
  window_clause: (node) => show([node.windowKw, node.namedWindows]),
  named_window: (node) => show([node.name, node.asKw, node.window]),
  window_definition: (node) =>
    show([node.baseWindowName, node.partitionBy, node.orderBy, node.frame]),
  // LIMIT
  limit_clause: (node) => {
    if (node.offsetKw) {
      return show([node.limitKw, node.count, node.offsetKw, node.offset]);
    } else if (node.offset) {
      return show([node.limitKw, node.offset, ",", node.count]);
    } else {
      return show([node.limitKw, node.count]);
    }
  },
  // VALUES
  values_clause: (node) => show([node.valuesKw, node.values]),
  row_constructor: (node) => show([node.rowKw, node.row]),

  // Window frame
  frame_clause: (node) => show([node.unitKw, node.extent, node.exclusion]),
  frame_between: (node) =>
    show([node.betweenKw, node.begin, node.andKw, node.end]),
  frame_bound_current_row: (node) => show(node.currentRowKw),
  frame_bound_preceding: (node) => show([node.expr, node.precedingKw]),
  frame_bound_following: (node) => show([node.expr, node.followingKw]),
  frame_unbounded: (node) => show(node.unboundedKw),
  frame_exclusion: (node) => show([node.excludeKw, node.kindKw]),

  // returning clause
  returning_clause: (node) => show([node.returningKw, node.columns]),

  // CREATE TABLE statement
  create_table_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.temporaryKw,
      node.externalKw,
      node.snapshotKw,
      node.tableKw,
      node.ifNotExistsKw,
      node.table,
      node.columns,
      node.options,
      node.clauses,
    ]),
  column_definition: (node) =>
    show([
      node.name,
      node.dataType,
      node.constraints.length > 0 ? node.constraints : undefined,
    ]),
  // constraints
  constraint: (node) => show([node.name, node.constraint, node.deferrable]),
  constraint_name: (node) => show([node.constraintKw, node.name]),
  constraint_deferrable: (node) => show([node.deferrableKw, node.initiallyKw]),
  constraint_null: (node) => show(node.nullKw),
  constraint_not_null: (node) => show([node.notNullKw, node.onConflict]),
  constraint_auto_increment: (node) => show(node.autoIncrementKw),
  constraint_default: (node) => show([node.defaultKw, node.expr]),
  constraint_comment: (node) => show([node.commentKw, node.value]),
  constraint_primary_key: (node) =>
    show([node.primaryKeyKw, node.columns, node.onConflict]),
  constraint_foreign_key: (node) =>
    show([node.foreignKeyKw, node.columns, node.references]),
  references_specification: (node) =>
    show([node.referencesKw, node.table, node.columns, node.options]),
  referential_action: (node) => show([node.onKw, node.eventKw, node.actionKw]),
  referential_match: (node) => show([node.matchKw, node.typeKw]),
  constraint_unique: (node) =>
    show([node.uniqueKw, node.columns, node.onConflict]),
  constraint_check: (node) => show([node.checkKw, node.expr, node.onConflict]),
  constraint_index: (node) =>
    show([node.indexTypeKw, node.indexKw, node.columns]),
  constraint_generated: (node) =>
    show([node.generatedKw, node.asKw, node.expr, node.storageKw]),
  constraint_collate: (node) => show([node.collateKw, node.collation]),
  constraint_visible: (node) => show(node.visibleKw),
  constraint_column_format: (node) =>
    show([node.columnFormatKw, node.formatKw]),
  constraint_storage: (node) => show([node.storageKw, node.typeKw]),
  constraint_engine_attribute: (node) =>
    show([node.engineAttributeKw, node.hasEq ? "=" : undefined, node.value]),
  on_conflict_clause: (node) => show([node.onConflictKw, node.resolutionKw]),
  // options
  table_option: (node) =>
    show([node.name, node.hasEq ? "=" : undefined, node.value]),
  // additional clauses
  create_table_like_clause: (node) => show([node.likeKw, node.name]),
  create_table_copy_clause: (node) => show([node.copyKw, node.name]),
  create_table_clone_clause: (node) => show([node.cloneKw, node.name]),
  for_system_time_as_of_clause: (node) =>
    show([node.forSystemTimeAsOfKw, node.expr]),
  with_partition_columns_clause: (node) =>
    show([node.withPartitionColumnsKw, node.columns]),
  bigquery_options: (node) => show([node.optionsKw, node.options]),
  bigquery_option_default_collate: (node) =>
    show([node.defaultCollateKw, node.collation]),

  // ALTER TABLE statement
  alter_table_stmt: (node) =>
    show([node.alterTableKw, node.ifExistsKw, node.table, node.actions]),
  alter_action_rename_table: (node) => show([node.renameKw, node.newName]),
  alter_action_rename_column: (node) =>
    show([
      node.renameKw,
      node.ifExistsKw,
      node.oldName,
      node.toKw,
      node.newName,
    ]),
  alter_action_add_column: (node) =>
    show([node.addKw, node.ifNotExistsKw, node.column]),
  alter_action_drop_column: (node) =>
    show([node.dropKw, node.ifExistsKw, node.column]),
  alter_action_alter_column: (node) =>
    show([node.alterKw, node.ifExistsKw, node.column, node.action]),
  alter_action_set_default_collate: (node) =>
    show([node.setDefaultCollateKw, node.collation]),
  alter_action_set_options: (node) => show([node.setKw, node.options]),
  alter_action_set_default: (node) => show([node.setDefaultKw, node.expr]),
  alter_action_drop_default: (node) => show([node.dropDefaultKw]),
  alter_action_drop_not_null: (node) => show([node.dropNotNullKw]),
  alter_action_set_data_type: (node) =>
    show([node.setDataTypeKw, node.dataType]),

  // DROP TABLE statement
  drop_table_stmt: (node) =>
    show([
      node.dropKw,
      node.temporaryKw,
      node.tableKw,
      node.ifExistsKw,
      node.tables,
      node.behaviorKw,
    ]),

  // INSERT INTO statement
  insert_stmt: (node) => show(node.clauses),
  insert_clause: (node) =>
    show([
      node.insertKw,
      node.options,
      node.orAction,
      node.intoKw,
      node.table,
      node.columns,
    ]),
  upsert_option: (node) => show(node.kw),
  or_alternate_action: (node) => show([node.orKw, node.actionKw]),
  default_values: (node) => show(node.kw),
  default: (node) => show(node.kw),
  upsert_clause: (node) =>
    show([node.onConflictKw, node.columns, node.where, node.doKw, node.action]),
  upsert_action_nothing: (node) => show(node.nothingKw),
  upsert_action_update: (node) => show([node.updateKw, node.set, node.where]),

  // UPDATE statement
  update_stmt: (node) => show(node.clauses),
  update_clause: (node) =>
    show([node.updateKw, node.options, node.orAction, node.tables]),
  set_clause: (node) => show([node.setKw, node.assignments]),
  column_assignment: (node) => show([node.column, "=", node.expr]),

  // DELETE FROM statement
  delete_stmt: (node) =>
    show([
      node.with,
      node.deleteKw,
      node.fromKw,
      node.table,
      node.where,
      node.returning,
    ]),

  // TRUNCATE TABLE statement
  truncate_stmt: (node) => show([node.truncateTableKw, node.table]),

  // MERGE statement
  merge_stmt: (node) =>
    show([
      node.mergeKw,
      node.intoKw,
      node.target,
      node.usingKw,
      node.source,
      node.onKw,
      node.condition,
      node.clauses,
    ]),
  merge_when_clause: (node) =>
    show([
      node.whenKw,
      node.matchedKw,
      node.byKw,
      node.condition,
      node.thenKw,
      node.action,
    ]),
  merge_when_condition: (node) => show([node.andKw, node.expr]),
  merge_action_delete: (node) => show([node.deleteKw]),
  merge_action_insert: (node) =>
    show([node.insertKw, node.columns, node.values]),
  merge_action_update: (node) => show([node.updateKw, node.set]),

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
      node.options,
      node.asKw,
      node.expr,
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
      node.onKw,
      node.table,
      node.forEachRowKw,
      node.condition,
      node.body,
    ]),
  trigger_event: (node) =>
    show([node.timeKw, node.eventKw, node.ofKw, node.columns]),
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
  create_virtual_table_stmt: (node) =>
    show([
      node.createVirtualTableKw,
      node.ifNotExistsKw,
      node.table,
      node.usingKw,
      node.module,
    ]),

  // BigQuery-specific statements
  create_capacity_stmt: (node) =>
    show([node.createKw, node.name, node.asKw, node.json]),
  drop_capacity_stmt: (node) => show([node.dropKw, node.ifExistsKw, node.name]),
  create_reservation_stmt: (node) =>
    show([node.createKw, node.name, node.asKw, node.json]),
  drop_reservation_stmt: (node) =>
    show([node.dropKw, node.ifExistsKw, node.name]),
  create_assignment_stmt: (node) =>
    show([node.createKw, node.name, node.asKw, node.json]),
  drop_assignment_stmt: (node) =>
    show([node.dropKw, node.ifExistsKw, node.name]),
  create_row_access_policy_stmt: (node) =>
    show([
      node.createKw,
      node.orReplaceKw,
      node.rowAccessPolicyKw,
      node.ifNotExistsKw,
      node.name,
      node.onKw,
      node.table,
      node.grantTo,
      node.filterUsingKw,
      node.filterExpr,
    ]),
  row_access_policy_grant: (node) => show([node.grantToKw, node.grantees]),
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
  cast_format: (node) => show([node.formatKw, node.string]),
  raise_expr: (node) => show([node.raiseKw, node.args]),
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
  indexed_table: (node) => show([node.table, node.indexedByKw, node.index]),
  not_indexed_table: (node) => show([node.table, node.notIndexedKw]),
  unnest_expr: (node) => show([node.unnestKw, node.expr]),
  unnest_with_offset_expr: (node) => show([node.unnest, node.withOffsetKw]),
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
  boolean_literal: (node) => node.text,
  null_literal: (node) => node.text,
  parameter: (node) => node.text,

  // Cast to FullTransformMap, so TypeScript ensures all node types are covered
} as FullTransformMap<string>);
