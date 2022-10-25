import { Whitespace, Node, Program } from "../pegjs/sql";
import { cstTransformer } from "./cstTransformer";
import { isDefined } from "./util";

export function format(node: Program) {
  // TODO...
  // const lo = layout(node);
  // return unroll(lo).join("");
}

type Line = { layout: "line"; items: Layout[] };
type Indent = { layout: "indent"; items: Layout[] };

type Layout = Line | Indent | string | Layout[];

const line = (...items: Layout[]): Line => ({ layout: "line", items });
const indent = (...items: Layout[]): Indent => ({ layout: "indent", items });

export function layout(node: Node): Layout {
  return layoutNode(node);
}

const layoutNode = cstTransformer<Layout>({
  program: (node) => node.statements.map(layout),
  empty_statement: () => "",

  // SELECT statement
  compound_select_statement: (node) => "",
  select_statement: (node) => node.clauses.map(layout),
  // WITH
  with_clause: (node) => "",
  common_table_expression: (node) => "",
  // SELECT
  select_clause: (node) => [
    line(layout(node.selectKw)),
    indent(
      ...node.columns
        .map(layout)
        .map((col, i) =>
          i < node.columns.length - 1 ? line(col, ",") : line(col)
        )
    ),
  ],
  // FROM
  from_clause: (node) => "",
  join: (node) => "",
  join_on_specification: (node) => "",
  join_using_specification: (node) => "",
  sort_specification: (node) => "",
  // WHERE .. GROUP BY .. HAVING .. ORDER BY .. PARTITION BY
  where_clause: (node) => "",
  group_by_clause: (node) => "",
  having_clause: (node) => "",
  order_by_clause: (node) => "",
  partition_by_clause: (node) => "",
  // WINDOW
  window_clause: (node) => "",
  named_window: (node) => "",
  window_definition: (node) => "",
  // LIMIT
  limit_clause: (node) => "",
  // VALUES
  values_clause: (node) => "",

  // Window frame
  frame_clause: (node) => "",
  frame_between: (node) => "",
  frame_bound_current_row: (node) => "",
  frame_bound_preceding: (node) => "",
  frame_bound_following: (node) => "",
  frame_unbounded: (node) => "",
  frame_exclusion: (node) => "",

  // CREATE TABLE statement
  create_table_statement: (node) => "",
  column_definition: (node) => "",
  column_option_nullable: (node) => "",
  column_option_auto_increment: (node) => "",
  column_option_key: (node) => "",
  column_option_default: (node) => "",
  column_option_comment: (node) => "",

  // DROP TABLE statement
  drop_table_statement: (node) => "",

  // INSERT INTO statement
  insert_statement: (node) => "",
  insert_option: (node) => "",
  default_values: (node) => "",
  default: (node) => "",

  // Expressions
  expr_list: (node) => "",
  paren_expr: (node) => "",
  binary_expr: (node) => "",
  unary_expr: (node) => "",
  func_call: (node) => "",
  distinct_arg: (node) => "",
  cast_expr: (node) => "",
  cast_arg: (node) => "",
  over_arg: (node) => "",
  between_expr: (node) => "",
  datetime: (node) => "",
  string_with_charset: (node) => "",
  case_expr: (node) => "",
  case_when: (node) => "",
  case_else: (node) => "",
  interval_expr: (node) => "",

  // Data types
  data_type: (node) => "",

  // Tables & columns
  column_ref: (node) => "",
  table_ref: (node) => "",
  alias: (node) => "",
  all_columns: () => "*",

  // Basic language elements
  keyword: (node) => node.text,
  identifier: (node) => node.text,
  string: (node) => node.text,
  number: (node) => node.text,
  bool: (node) => node.text,
  null: (node) => node.text,
});
