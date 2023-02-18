import { TransformMap } from "../cstTransformer";
import { AllExprNodes } from "../cst/Node";
import { Node as AstNode, StringLiteral } from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToBoolean, keywordToString } from "./transformUtils";
import { isString } from "../utils/generic";

export const exprMap: TransformMap<AstNode, AllExprNodes> = {
  paren_expr: (node) => cstToAst(node.expr),
  list_expr: (node) => ({
    type: "list_expr",
    items: cstToAst(node.items),
  }),
  binary_expr: (node) => ({
    type: "binary_expr",
    left: cstToAst(node.left),
    operator: isString(node.operator)
      ? node.operator
      : keywordToString(node.operator),
    right: cstToAst(node.right),
  }),
  prefix_op_expr: (node) => ({
    type: "prefix_op_expr",
    operator: isString(node.operator)
      ? node.operator
      : keywordToString(node.operator),
    expr: cstToAst(node.expr),
  }),
  postfix_op_expr: (node) => ({
    type: "postfix_op_expr",
    operator: keywordToString(node.operator),
    expr: cstToAst(node.expr),
  }),
  between_expr: (node) => ({
    type: "between_expr",
    left: cstToAst(node.left),
    operator: keywordToString(node.betweenKw),
    begin: cstToAst(node.begin),
    end: cstToAst(node.end),
  }),
  case_expr: (node) => ({
    type: "case_expr",
    expr: cstToAst(node.expr),
    clauses: cstToAst(node.clauses),
  }),
  case_when: (node) => ({
    type: "case_when",
    condition: cstToAst(node.condition),
    result: cstToAst(node.result),
  }),
  case_else: (node) => ({
    type: "case_else",
    result: cstToAst(node.result),
  }),
  func_call: (node) => ({
    type: "func_call",
    name: cstToAst(node.name),
    args: cstToAst(node.args?.expr.args.items),
    distinct: keywordToBoolean(node.args?.expr.distinctKw),
    filter: cstToAst(node.filter?.where.expr.expr),
    over: cstToAst(node.over?.window),
  }),
  cast_expr: (node) => ({
    type: "cast_expr",
    expr: cstToAst(node.args.expr.expr),
    dataType: cstToAst(node.args.expr.dataType),
  }),
  raise_expr: (node) => ({
    type: "raise_expr",
    args: node.args.expr.items.map((arg) =>
      arg.type === "keyword"
        ? keywordToString(arg)
        : cstToAst<StringLiteral>(arg)
    ),
  }),
  member_expr: (node) => ({
    type: "member_expr",
    object: cstToAst(node.object),
    property: cstToAst(node.property),
  }),
  identifier: (node) => ({
    type: "identifier",
    name: node.name,
  }),
  string_literal: (node) => ({
    type: "string_literal",
    value: node.value,
  }),
  number_literal: (node) => ({
    type: "number_literal",
    value: node.value,
  }),
  blob_literal: (node) => ({
    type: "blob_literal",
    value: node.value,
  }),
  boolean_literal: (node) => ({
    type: "boolean_literal",
    value: node.value,
  }),
  null_literal: (node) => ({
    type: "null_literal",
    value: node.value,
  }),
  date_literal: (node) => ({
    type: "date_literal",
    value: node.string.value,
  }),
  time_literal: (node) => ({
    type: "time_literal",
    value: node.string.value,
  }),
  datetime_literal: (node) => ({
    type: "datetime_literal",
    value: node.string.value,
  }),
  timestamp_literal: (node) => ({
    type: "timestamp_literal",
    value: node.string.value,
  }),
  json_literal: (node) => ({
    type: "json_literal",
    value: node.string.value,
  }),
  numeric_literal: (node) => ({
    type: "numeric_literal",
    value: node.string.value,
  }),
  bignumeric_literal: (node) => ({
    type: "bignumeric_literal",
    value: node.string.value,
  }),
};
