import { show } from "../show";
import { AllExprNodes } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const exprMap: FullTransformMap<string, AllExprNodes> = {
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

  // Tables & columns
  member_expr: (node) =>
    show(
      [node.object, node.property],
      node.property.type === "array_subscript" ? "" : "."
    ),
  bigquery_quoted_member_expr: (node) => show(["`", node.expr, "`"]),
  array_subscript: (node) => show(["[", node.expr, "]"]),
  array_subscript_specifier: (node) => show([node.specifierKw, node.args]),

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
  identifier: (node) => node.text,
  string_literal: (node) => node.text,
  number_literal: (node) => node.text,
  blob_literal: (node) => node.text,
  boolean_literal: (node) => show(node.valueKw),
  null_literal: (node) => show(node.nullKw),
  variable: (node) => node.text,
  parameter: (node) => node.text,
};
