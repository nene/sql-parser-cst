import { Whitespace, Node } from "../pegjs/sql";
import { cstTransformer, FullTransformMap } from "./cstTransformer";
import { isDefined } from "./util";

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
  empty_statement: () => "",

  // SELECT statement
  compound_select_statement: (node) =>
    show([node.left, node.operator, node.right]),
  select_statement: (node) => show(node.clauses),
  // WITH
  with_clause: (node) =>
    show([node.withKw, node.recursiveKw, show(node.tables, ",")]),
  common_table_expression: (node) =>
    show([node.table, node.columns, node.asKw, node.optionKw, node.expr]),
  // SELECT
  select_clause: (node) =>
    show([node.selectKw, node.options.length > 0 ? node.options : undefined]) +
    show(node.columns, ","),
  // FROM
  from_clause: (node) => show([node.fromKw, node.tables]),
  join: (node) => show([node.operator, node.table, node.specification]),
  join_on_specification: (node) => show([node.onKw, node.expr]),
  join_using_specification: (node) => show([node.usingKw, node.expr]),
  sort_specification: (node) => show([node.expr, node.orderKw]),
  // WHERE .. GROUP BY .. HAVING .. ORDER BY .. PARTITION BY
  where_clause: (node) => show([node.whereKw, node.expr]),
  group_by_clause: (node) => show(node.groupByKw) + show(node.columns, ","),
  having_clause: (node) => show([node.havingKw, node.expr]),
  order_by_clause: (node) =>
    show(node.orderByKw) + show(node.specifications, ","),
  partition_by_clause: (node) =>
    show(node.partitionByKw) + show(node.specifications, ","),
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

  // Window frame
  frame_clause: (node) => show([node.unitKw, node.extent, node.exclusion]),
  frame_between: (node) =>
    show([node.betweenKw, node.begin, node.andKw, node.end]),
  frame_bound_current_row: (node) => show(node.currentRowKw),
  frame_bound_preceding: (node) => show([node.expr, node.precedingKw]),
  frame_bound_following: (node) => show([node.expr, node.followingKw]),
  frame_unbounded: (node) => show(node.unboundedKw),
  frame_exclusion: (node) => show([node.excludeKw, node.kindKw]),

  // CREATE TABLE statement
  create_table_statement: (node) =>
    show([
      node.createKw,
      node.temporaryKw,
      node.tableKw,
      node.ifNotExistsKw,
      node.table,
      node.columns,
    ]),
  column_definition: (node) =>
    show([
      node.name,
      node.dataType,
      node.constraints.length > 0 ? node.constraints : undefined,
    ]),
  constraint_nullable: (node) => show(node.kw),
  constraint_auto_increment: (node) => show(node.kw),
  constraint_key: (node) => show(node.kw),
  constraint_default: (node) => show([node.kw, node.expr]),
  constraint_comment: (node) => show([node.kw, node.value]),
  table_constraint: (node) =>
    show([node.constraintKw, node.name, node.constraint]),
  table_constraint_primary_key: (node) =>
    show([node.primaryKeyKw, node.columns]),

  // DROP TABLE statement
  drop_table_statement: (node) =>
    show([
      node.dropKw,
      node.temporaryKw,
      node.tableKw,
      node.ifExistsKw,
      show(node.tables, ","),
      node.behaviorKw,
    ]),

  // INSERT INTO statement
  insert_statement: (node) =>
    show([
      node.insertKw,
      node.options,
      node.intoKw,
      node.table,
      node.columns,
      node.source,
    ]),
  insert_option: (node) => show(node.kw),
  default_values: (node) => show(node.kw),
  default: (node) => show(node.kw),

  // UPDATE statement
  update_statement: (node) =>
    show([
      node.updateKw,
      show(node.tables, ","),
      node.setKw,
      show(node.assignments, ","),
      node.where,
    ]),
  column_assignment: (node) => show([node.column, "=", node.expr]),

  // DELETE FROM statement
  delete_statement: (node) =>
    show([node.deleteKw, node.fromKw, node.table, node.where]),

  // Expressions
  expr_list: (node) => show(node.items, ","),
  paren_expr: (node) => "(" + show(node.expr) + ")",
  binary_expr: (node) => show([node.left, node.operator, node.right]),
  unary_expr: (node) => show([node.operator, node.expr]),
  func_call: (node) =>
    show(node.name) + show(node.args) + (node.over ? show(node.over) : ""),
  distinct_arg: (node) => show([node.distinctKw, node.value]),
  cast_expr: (node) => show([node.castKw, node.args]),
  cast_arg: (node) => show([node.expr, node.asKw, node.dataType]),
  over_arg: (node) => show([node.overKw, node.window]),
  between_expr: (node) =>
    show([node.left, node.betweenKw, node.begin, node.andKw, node.end]),
  datetime: (node) => show([node.kw, node.string]),
  string_with_charset: (node) => "_" + node.charset + show(node.string),
  case_expr: (node) => show([node.caseKw, node.expr, node.clauses, node.endKw]),
  case_when: (node) =>
    show([node.whenKw, node.condition, node.thenKw, node.result]),
  case_else: (node) => show([node.elseKw, node.result]),
  interval_expr: (node) => show([node.intervalKw, node.expr, node.unitKw]),

  // Data types
  data_type: (node) => show([node.nameKw, node.params]),

  // Tables & columns
  column_ref: (node) => show([node.table, node.column], "."),
  table_ref: (node) => show([node.schema, node.table], "."),
  alias: (node) => show([node.expr, node.asKw, node.alias]),
  all_columns: () => "*",

  // Basic language elements
  keyword: (node) => node.text,
  identifier: (node) => node.text,
  string: (node) => node.text,
  number: (node) => node.text,
  bool: (node) => node.text,
  null: (node) => node.text,

  // Cast to FullTransformMap, so TypeScript ensures all node types are covered
} as FullTransformMap<string>);
