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
  empty: () => "",

  // SELECT statement
  compound_select_stmt: (node) => show([node.left, node.operator, node.right]),
  select_stmt: (node) => show(node.clauses),
  // WITH
  with_clause: (node) => show([node.withKw, node.recursiveKw, node.tables]),
  common_table_expression: (node) =>
    show([node.table, node.columns, node.asKw, node.optionKw, node.expr]),
  // SELECT
  select_clause: (node) => show([node.selectKw, node.options, node.columns]),
  // FROM
  from_clause: (node) => show([node.fromKw, node.expr]),
  join_expr: (node) =>
    show([node.left, node.operator, node.right, node.specification]),
  join_on_specification: (node) => show([node.onKw, node.expr]),
  join_using_specification: (node) => show([node.usingKw, node.expr]),
  sort_specification: (node) =>
    show([node.expr, node.orderKw, node.nullHandlingKw]),
  // WHERE .. GROUP BY .. HAVING .. ORDER BY .. PARTITION BY
  where_clause: (node) => show([node.whereKw, node.expr]),
  group_by_clause: (node) => show([node.groupByKw, node.columns]),
  having_clause: (node) => show([node.havingKw, node.expr]),
  order_by_clause: (node) =>
    show([node.orderByKw, node.specifications, node.withRollupKw]),
  partition_by_clause: (node) =>
    show([node.partitionByKw, node.specifications]),
  // WINDOW
  window_clause: (node) => show(node.windowKw) + show(node.namedWindows, ","),
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
      node.temporaryKw,
      node.tableKw,
      node.ifNotExistsKw,
      node.table,
      node.columns,
      node.options,
      node.as,
    ]),
  create_table_as: (node) => show([node.asKw, node.expr]),
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

  // ALTER TABLE statement
  alter_table_stmt: (node) =>
    show([node.alterTableKw, node.table, node.actions]),
  alter_rename_table: (node) => show([node.renameKw, node.newName]),
  alter_rename_column: (node) =>
    show([node.renameKw, node.oldName, node.toKw, node.newName]),
  alter_add_column: (node) => show([node.addKw, node.column]),
  alter_drop_column: (node) => show([node.dropKw, node.column]),

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

  // CREATE VIEW statement
  create_view_stmt: (node) =>
    show([
      node.createKw,
      node.temporaryKw,
      node.viewKw,
      node.ifNotExistsKw,
      node.name,
      node.columns,
      node.asKw,
      node.expr,
    ]),
  // DROP VIEW statement
  drop_view_stmt: (node) =>
    show([node.dropViewKw, node.ifExistsKw, node.views, node.behaviorKw]),

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
      node.where,
    ]),
  // DROP INDEX
  drop_index_stmt: (node) =>
    show([
      node.dropIndexKw,
      node.ifExistsKw,
      node.indexes,
      node.onKw,
      node.table,
    ]),

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
  trigger_body: (node) => show([node.beginKw, node.program, node.endKw]),
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

  // Expressions
  list_expr: (node) => show(node.items, ","),
  paren_expr: (node) => "(" + show(node.expr) + ")",
  pair_expr: (node) => show([node.expr1, node.expr2]),
  binary_expr: (node) => show([node.left, node.operator, node.right]),
  prefix_op_expr: (node) => show([node.operator, node.expr]),
  postfix_op_expr: (node) => show([node.expr, node.operator]),
  func_call: (node) => show([node.name, node.args, node.filter, node.over]),
  table_func_call: (node) => show([node.name, node.args]),
  distinct_arg: (node) => show([node.distinctKw, node.value]),
  cast_expr: (node) => show([node.castKw, node.args]),
  cast_arg: (node) => show([node.expr, node.asKw, node.dataType]),
  raise_expr: (node) => show([node.raiseKw, node.args]),
  extract_expr: (node) => show([node.extractKw, node.args]),
  extract_from: (node) => show([node.unit, node.fromKw, node.expr]),
  week_expr: (node) => show([node.weekKw, node.args]),
  filter_arg: (node) => show([node.filterKw, node.where]),
  over_arg: (node) => show([node.overKw, node.window]),
  between_expr: (node) =>
    show([node.left, node.betweenKw, node.begin, node.andKw, node.end]),
  datetime: (node) => show([node.kw, node.string]),
  string_with_charset: (node) => "_" + node.charset + show(node.string),
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

  // Tables & columns
  member_expr: (node) => show([node.object, node.property]),
  array_subscript: (node) => show(["[", node.expr, "]"]),
  column_ref: (node) => show([node.table, node.column], "."),
  table_ref: (node) => show([node.catalog, node.schema, node.table], "."),
  alias: (node) => show([node.expr, node.asKw, node.alias]),
  indexed_table_ref: (node) => show([node.table, node.indexedByKw, node.index]),
  not_indexed_table_ref: (node) => show([node.table, node.notIndexedKw]),
  all_columns: () => "*",

  // Basic language elements
  keyword: (node) => node.text,
  identifier: (node) => node.text,
  string: (node) => node.text,
  number: (node) => node.text,
  blob: (node) => node.text,
  boolean: (node) => node.text,
  null: (node) => node.text,
  parameter: (node) => node.text,

  // Cast to FullTransformMap, so TypeScript ensures all node types are covered
} as FullTransformMap<string>);
