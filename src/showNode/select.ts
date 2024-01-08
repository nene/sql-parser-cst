import { show } from "../show";
import { AllSelectNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const selectMap: FullTransformMap<string, AllSelectNodes> = {
  compound_select_stmt: (node) => show([node.left, node.operator, node.right]),
  select_stmt: (node) => show(node.clauses),
  // WITH
  with_clause: (node) => show([node.withKw, node.recursiveKw, node.tables]),
  common_table_expr: (node) =>
    show([
      node.table,
      node.columns,
      node.asKw,
      node.materializedKw,
      node.expr,
      node.search,
      node.cycle,
    ]),
  cte_search_clause: (node) =>
    show([node.searchKw, node.columns, node.setKw, node.resultColumn]),
  cte_cycle_clause: (node) =>
    show([
      node.cycleKw,
      node.columns,
      node.setKw,
      node.resultColumn,
      node.values,
      node.usingKw,
      node.pathColumn,
    ]),
  cte_cycle_clause_values: (node) =>
    show([node.toKw, node.markValue, node.defaultKw, node.defaultValue]),
  // SELECT
  select_clause: (node) => show([node.selectKw, node.modifiers, node.columns]),
  select_all: (node) => show(node.allKw),
  select_distinct: (node) => show(node.distinctKw),
  select_distinct_on: (node) => show([node.distinctOnKw, node.columns]),
  select_as_struct: (node) => show(node.asStructKw),
  select_as_value: (node) => show(node.asValueKw),
  except_columns: (node) => show([node.expr, node.exceptKw, node.columns]),
  replace_columns: (node) => show([node.expr, node.replaceKw, node.columns]),
  // FROM
  from_clause: (node) => show([node.fromKw, node.expr]),
  dual_table: (node) => show(node.dualKw),
  lateral_derived_table: (node) => show([node.lateralKw, node.expr]),
  partitioned_table: (node) =>
    show([node.table, node.partitionKw, node.partitions]),
  indexed_table: (node) => show([node.table, node.indexedByKw, node.index]),
  not_indexed_table: (node) => show([node.table, node.notIndexedKw]),
  with_ordinality_expr: (node) => show([node.expr, node.withOrdinalityKw]),
  table_with_inheritance: (node) => show([node.table, "*"]),
  table_without_inheritance: (node) => show([node.onlyKw, node.table]),
  func_call_with_column_definitions: (node) =>
    show([node.funcCall, node.asKw, node.columns]),
  rows_from_expr: (node) => show([node.rowsFromKw, node.expr]),
  unnest_expr: (node) => show([node.unnestKw, node.expr]),
  unnest_with_offset_expr: (node) => show([node.unnest, node.withOffsetKw]),
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
  tablesample_expr: (node) =>
    show([
      node.left,
      node.tablesampleKw,
      node.method,
      node.args,
      node.repeatable,
    ]),
  tablesample_method: (node) => show(node.methodKw),
  tablesample_percent: (node) => show([node.percent, node.percentKw]),
  tablesample_repeatable: (node) => show([node.repeatableKw, node.seed]),
  for_system_time_as_of_expr: (node) =>
    show([node.left, node.forSystemTimeAsOfKw, node.expr]),
  sort_specification: (node) =>
    show([node.expr, node.direction, node.nullHandlingKw]),
  sort_direction_asc: (node) => show(node.ascKw),
  sort_direction_desc: (node) => show(node.descKw),
  sort_direction_using_operator: (node) => show([node.usingKw, node.operator]),
  // WHERE .. GROUP BY .. HAVING .. QUALIFY ... ORDER BY .. PARTITION BY .. CLUSTER BY
  where_clause: (node) => show([node.whereKw, node.expr]),
  where_current_of_clause: (node) => show([node.whereCurrentOfKw, node.cursor]),
  group_by_clause: (node) =>
    show([node.groupByKw, node.distinctKw, node.columns, node.withRollupKw]),
  group_by_rollup: (node) => show([node.rollupKw, node.columns]),
  group_by_cube: (node) => show([node.cubeKw, node.columns]),
  group_by_grouping_sets: (node) => show([node.groupingSetsKw, node.columns]),
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
      return show([
        node.limitKw,
        node.count,
        node.offsetKw,
        node.offset,
        node.rowsExamined,
      ]);
    } else if (node.offset) {
      return show([
        node.limitKw,
        node.offset,
        ",",
        node.count,
        node.rowsExamined,
      ]);
    } else {
      return show([node.limitKw, node.count, node.rowsExamined]);
    }
  },
  limit_all: (node) => show(node.allKw),
  limit_rows_examined: (node) => show([node.rowsExaminedKw, node.count]),
  // OFFSET + FETCH
  offset_clause: (node) => show([node.offsetKw, node.offset, node.rowsKw]),
  fetch_clause: (node) =>
    show([node.fetchKw, node.count, node.rowsKw, node.withTiesKw]),
  // returning clause
  returning_clause: (node) => show([node.returningKw, node.columns]),
  // INTO ...
  into_table_clause: (node) =>
    show([
      node.intoKw,
      node.temporaryKw,
      node.unloggedKw,
      node.tableKw,
      node.name,
    ]),
  into_variables_clause: (node) => show([node.intoKw, node.variables]),
  into_dumpfile_clause: (node) => show([node.intoDumpfileKw, node.filename]),
  into_outfile_clause: (node) =>
    show([
      node.intoOutfileKw,
      node.filename,
      node.charset,
      node.fields,
      node.lines,
    ]),
  outfile_fields: (node) => show([node.fieldsKw, node.options]),
  outfile_lines: (node) => show([node.linesKw, node.options]),
  outfile_option_character_set: (node) =>
    show([node.characterSetKw, node.value]),
  outfile_option_enclosed_by: (node) =>
    show([node.optionallyKw, node.enclosedByKw, node.value]),
  outfile_option_escaped_by: (node) => show([node.escapedByKw, node.value]),
  outfile_option_starting_by: (node) => show([node.startingByKw, node.value]),
  outfile_option_terminated_by: (node) =>
    show([node.terminatedByKw, node.value]),
  // FOR
  for_clause: (node) =>
    show([node.forKw, node.lockStrengthKw, node.tables, node.waitingKw]),
  for_clause_tables: (node) => show([node.ofKw, node.tables]),
  // LOCK IN SHARE MODE
  lock_in_share_mode_clause: (node) => show(node.lockInShareModeKw),
  // TABLE
  table_clause: (node) => show([node.tableKw, node.table]),
};
