import { TransformMap } from "../cstTransformer";
import { AllUpdateNodes } from "../cst/Node";
import { Node as AstNode, UpdateStmt } from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToString, mergeClauses } from "./transformUtils";
import {
  withClause,
  fromClause,
  whereClause,
  orderByClause,
  limitClause,
} from "./clauses";

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
      with_clause: withClause,
      from_clause: fromClause,
      where_clause: whereClause,
      order_by_clause: orderByClause,
      limit_clause: limitClause,
    }),
  }),
  column_assignment: (node) => ({
    type: "column_assignment",
    column: cstToAst(node.column),
    expr: cstToAst(node.expr),
  }),
};
