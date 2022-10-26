import { Node, Whitespace } from "../../pegjs/sql";
import { cstTransformer } from "../cstTransformer";

export type Layout = Line | string | Layout[];

export type Line = {
  layout: "line";
  indent?: number;
  items: Layout[];
};

export const isLine = (item: Layout): item is Line =>
  typeof item === "object" && (item as any).layout === "line";

type NodeArray = (Node | NodeArray | string)[];

export function layout(node: Node | string | NodeArray): Layout {
  if (typeof node === "string") {
    return node;
  }
  if (node instanceof Array) {
    return joinLayoutArray(node.map(layout), " ");
  }

  const leading = layoutComments(node.leading);
  const trailing = layoutComments(node.trailing);
  if (leading.length || trailing.length) {
    return [...leading, layoutNode(node), ...trailing];
  }

  return layoutNode(node);
}

const layoutComments = (items?: Whitespace[]): Layout[] => {
  const result: Layout[] = [];
  (items || []).forEach((ws, i, arr) => {
    const prev = arr[i - 1];
    if (ws.type === "block_comment") {
      if (prev?.type === "newline") {
        result.push(line(ws.text));
      } else {
        result.push(" ", ws.text, " ");
      }
    }
    if (ws.type === "line_comment") {
      result.push(line(ws.text));
    }
  });
  return result;
};

function joinLayoutArray(array: Layout[], separator = " "): Layout[] {
  const result: Layout[] = [];
  for (const it of array) {
    if (result.length > 0) {
      result.push(separator);
    }
    result.push(it);
  }
  return result;
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
  from_clause: (node) => [
    line(layout(node.fromKw)),
    indent(layout(node.tables)),
  ],
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
  binary_expr: ({ left, operator, right }) => layout([left, operator, right]),
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
  column_ref: (node) =>
    node.table
      ? [layout(node.table), ".", layout(node.column)]
      : layout(node.column),
  table_ref: (node) =>
    node.db ? [layout(node.db), ".", layout(node.table)] : layout(node.table),
  alias: (node) =>
    node.asKw
      ? layout([node.expr, node.asKw, node.alias])
      : layout([node.expr, node.alias]),
  all_columns: () => "*",

  // Basic language elements
  keyword: (node) => node.text,
  identifier: (node) => node.text,
  string: (node) => node.text,
  number: (node) => node.text,
  bool: (node) => node.text,
  null: (node) => node.text,
});

// utils for easy creation of lines

const line = (...items: Layout[]): Line => ({ layout: "line", items });

const indent = (...items: Layout[]): Line => ({
  layout: "line",
  indent: 1,
  items,
});
