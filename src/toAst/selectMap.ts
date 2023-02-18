import { TransformMap } from "../cstTransformer";
import { AllSelectNodes } from "../cst/Node";
import {
  Expr,
  Identifier,
  NamedWindow,
  Node as AstNode,
  SelectStmt,
  SortSpecification,
  TableExpr,
  WithClause,
} from "../ast/Node";
import { cstToAst } from "../cstToAst";
import {
  keywordToBoolean,
  keywordToString,
  mergeClauses,
} from "./transformUtils";
import { isString } from "../utils/generic";

export const selectMap: TransformMap<AstNode, AllSelectNodes> = {
  compound_select_stmt: (node) => ({
    type: "compound_select_stmt",
    left: cstToAst(node.left),
    operator: keywordToString(node.operator),
    right: cstToAst(node.right),
  }),
  select_stmt: (node): SelectStmt => {
    return {
      type: "select_stmt",
      columns: [],
      ...mergeClauses(node.clauses, {
        with_clause: (clause) => ({
          with: cstToAst<WithClause>(clause),
        }),
        select_clause: (clause) => ({
          columns: cstToAst<SelectStmt["columns"]>(clause.columns.items),
          distinct: keywordToString(clause.distinctKw),
        }),
        from_clause: (clause) => ({
          from: cstToAst<TableExpr>(clause.expr),
        }),
        where_clause: (clause) => ({
          where: cstToAst<Expr>(clause.expr),
        }),
        group_by_clause: (clause) => {
          if (clause.columns.type === "list_expr") {
            return { groupBy: cstToAst<Identifier[]>(clause.columns.items) };
          } else {
            return {};
          }
        },
        having_clause: (clause) => ({
          having: cstToAst<Expr>(clause.expr),
        }),
        order_by_clause: (clause) => ({
          orderBy: cstToAst<(Identifier | SortSpecification)[]>(
            clause.specifications.items
          ),
        }),
        window_clause: (clause) => ({
          window: cstToAst<NamedWindow[]>(clause.namedWindows.items),
        }),
        limit_clause: (clause) => ({
          limit: cstToAst<Expr>(clause.count),
          offset: clause.offset && cstToAst<Expr>(clause.offset),
        }),
      }),
    };
  },
  with_clause: (node) => ({
    type: "with_clause",
    recursive: keywordToBoolean(node.recursiveKw),
    tables: cstToAst(node.tables.items),
  }),
  common_table_expression: (node) => ({
    type: "common_table_expression",
    table: cstToAst(node.table),
    expr: cstToAst(node.expr),
  }),
  join_expr: (node) => ({
    type: "join_expr",
    left: cstToAst(node.left),
    operator: isString(node.operator) ? "," : keywordToString(node.operator),
    right: cstToAst(node.right),
    specification: cstToAst(node.specification),
  }),
  join_on_specification: (node) => ({
    type: "join_on_specification",
    expr: cstToAst(node.expr),
  }),
  join_using_specification: (node) => ({
    type: "join_using_specification",
    columns: cstToAst(node.expr.expr.items),
  }),
  sort_specification: (node) => ({
    type: "sort_specification",
    expr: cstToAst(node.expr),
    order: keywordToString(node.orderKw),
    nulls: keywordToString(node.nullHandlingKw?.[1]),
  }),
  named_window: (node) => ({
    type: "named_window",
    name: cstToAst(node.name),
    window: cstToAst(node.window),
  }),
  window_definition: (node) => ({
    type: "window_definition",
    baseWindowName: cstToAst(node.baseWindowName),
    partitionBy: cstToAst(node.partitionBy?.specifications.items),
    orderBy: cstToAst(node.orderBy?.specifications.items),
    frame: cstToAst(node.frame),
  }),
};
