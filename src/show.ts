import { Whitespace, Node } from "../pegjs/sql";
import { cstTransformer } from "./cstTransformer";
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
  empty_statement: () => "",

  // SELECT statement
  select_statement: (node) => show(node.clauses),
  // WITH
  with_clause: (node) =>
    show([node.withKw, node.recursiveKw, show(node.tables, ",")]),
  common_table_expression: (node) =>
    show([
      node.table,
      node.columns.length > 0 ? `(${show(node.columns, ",")})` : undefined,
      node.asKw,
      node.optionKw,
      node.expr,
    ]),
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
  // WHERE .. GROUP BY .. HAVING .. ORDER BY
  where_clause: (node) => show([node.whereKw, node.expr]),
  group_by_clause: (node) => show(node.groupByKw) + show(node.columns, ","),
  having_clause: (node) => show([node.havingKw, node.expr]),
  order_by_clause: (node) =>
    show(node.orderByKw) + show(node.specifications, ","),
  // WINDOW
  window_clause: (node) => show(node.windowKw) + show(node.namedWindows, ","),
  named_window: (node) =>
    show([node.name, node.asKw, "(" + show(node.definition) + ")"]),
  window_definition: (node) => show([node.baseWindowName, node.clauses]),
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

  // CREATE TABLE statement
  create_table_statement: (node) =>
    show([
      node.createKw,
      node.temporaryKw,
      node.tableKw,
      node.ifNotExistsKw,
      node.table,
      "(" + show(node.columns, ",") + ")",
    ]),
  column_definition: (node) =>
    show([
      node.name,
      node.dataType,
      node.options.length > 0 ? node.options : undefined,
    ]),
  column_option_nullable: (node) => show(node.kw),
  column_option_auto_increment: (node) => show(node.kw),
  column_option_key: (node) => show(node.kw),
  column_option_default: (node) => show([node.kw, node.expr]),
  column_option_comment: (node) => show([node.kw, node.value]),

  // Expressions
  expr_list: (node) => show(node.items, ","),
  paren_expr: (node) => "(" + show(node.expr) + ")",
  binary_expr: (node) => show([node.left, node.operator, node.right]),
  unary_expr: (node) => show([node.operator, node.expr]),
  func_call: (node) =>
    show(node.name) + show(node.args) + (node.over ? show(node.over) : ""),
  distinct_arg: (node) => show([node.distinctKw, node.value]),
  over_arg: (node) => show(node.overKw) + "(" + show(node.definition) + ")",
  between_expr: (node) =>
    show([node.left, node.betweenKw, node.begin, node.andKw, node.end]),
  datetime: (node) => show([node.kw, node.string]),
  string_with_charset: (node) => "_" + node.charset + show(node.string),

  // Data types
  data_type: (node) => show([node.nameKw, node.params]),

  // Tables & columns
  column_ref: (node) => show([node.table, node.column], "."),
  table_ref: (node) => show([node.db, node.table], "."),
  alias: (node) => show([node.expr, node.asKw, node.alias]),
  all_columns: () => "*",

  // Basic language elements
  keyword: (node) => node.text,
  identifier: (node) => node.text,
  string: (node) => node.text,
  number: (node) => node.text,
  bool: (node) => node.text,
  null: (node) => node.text,
});
