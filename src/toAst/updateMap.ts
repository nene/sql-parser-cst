import { TransformMap } from "../cstTransformer";
import { AllUpdateNodes } from "../cst/Node";
import {
  Expr,
  Identifier,
  Node as AstNode,
  SortSpecification,
  TableExpr,
  UpdateStmt,
  WithClause,
} from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToString, mergeClauses } from "./transformUtils";

export const updateMap: TransformMap<AstNode, AllUpdateNodes> = {
  update_stmt: (node): UpdateStmt => ({
    type: "update_stmt",
    tables: [],
    assignments: [],
    ...mergeClauses(node.clauses, {
      with_clause: (clause) => ({
        with: cstToAst<WithClause>(clause),
      }),
      update_clause: (clause) => ({
        tables: cstToAst<UpdateStmt["tables"]>(clause.tables.items),
        orAction: keywordToString(clause.orAction?.actionKw),
      }),
      set_clause: (clause) => ({
        assignments: cstToAst<UpdateStmt["assignments"]>(
          clause.assignments.items
        ),
      }),
      from_clause: (clause) => ({
        from: cstToAst<TableExpr>(clause.expr),
      }),
      where_clause: (clause) => ({
        where: cstToAst<Expr>(clause.expr),
      }),
      order_by_clause: (clause) => ({
        orderBy: cstToAst<(Identifier | SortSpecification)[]>(
          clause.specifications.items
        ),
      }),
      limit_clause: (clause) => ({
        limit: cstToAst<Expr>(clause.count),
        offset: clause.offset && cstToAst<Expr>(clause.offset),
      }),
    }),
  }),
  column_assignment: (node) => ({
    type: "column_assignment",
    column: cstToAst(node.column),
    expr: cstToAst(node.expr),
  }),
};
