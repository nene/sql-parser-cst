import { Node, Program } from "../pegjs/sql";
import { cstTransformer } from "./cstTransformer";

export type Line = {
  layout: "line";
  indent?: number;
  items: Layout[];
};

export type Layout = Line | string | Layout[];

export function format(node: Program) {
  const lines = unroll(layout(node));
  if (!(lines instanceof Array) || !lines.every(isLine)) {
    throw new Error(`Expected array of lines, instead got ${lines}`);
  }
  return serialize(lines);
}

export function serialize(lines: Line[]): string {
  const INDENT = "  ";
  return lines
    .map((line) => INDENT.repeat(line.indent || 0) + line.items.join(""))
    .join("\n");
}

export const line = (...items: Layout[]): Line => ({ layout: "line", items });
export const indent = (...items: Layout[]): Line => ({
  layout: "line",
  indent: 1,
  items,
});

const isLine = (item: Layout): item is Line =>
  typeof item === "object" && (item as any).layout === "line";

export function unroll(item: Layout): Layout {
  if (isLine(item)) {
    return unrollLine(item);
  }
  if (item instanceof Array) {
    return unrollArray(item);
  }
  return item;
}

function unrollArray(arr: Layout[]): Layout[] {
  return arr.flatMap(unroll);
}

function unrollLine(line: Line): Line[] {
  const lineItems = unrollArray(line.items);
  if (lineItems.every(isLine)) {
    return lineItems.map((subLine) => {
      if (line.indent) {
        return { ...subLine, indent: line.indent + (subLine.indent || 0) };
      } else {
        return subLine;
      }
    });
  }
  return [{ ...line, items: lineItems }];
}

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
