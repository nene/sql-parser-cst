import { TransformMap } from "../cstTransformer";
import { AllUpdateNodes } from "../cst/Node";
import {
  Expr,
  Identifier,
  MemberExpr,
  Node as AstNode,
  UpdateStmt,
} from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToString, mergeClauses } from "./transformUtils";

export const updateMap: TransformMap<AstNode, AllUpdateNodes> = {
  update_stmt: (node): UpdateStmt => ({
    type: "update_stmt",
    tables: [],
    assignments: [],
    ...mergeClauses(node.clauses, {
      update_clause: (clause) => ({
        tables: cstToAst<UpdateStmt["tables"]>(clause.tables.items),
        orAction: keywordToString(clause.orAction?.actionKw),
      }),
      set_clause: (clause) => ({
        assignments: cstToAst<UpdateStmt["assignments"]>(
          clause.assignments.items
        ),
      }),
      where_clause: (clause) => ({
        where: cstToAst<Expr>(clause.expr),
      }),
    }),
  }),
  column_assignment: (node) => ({
    type: "column_assignment",
    column:
      node.column.type === "paren_expr"
        ? cstToAst<Identifier[]>(node.column.expr.items)
        : cstToAst<Identifier | MemberExpr>(node.column),
    expr: cstToAst(node.expr),
  }),
};
