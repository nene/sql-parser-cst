import { TransformMap } from "../cstTransformer";
import { AllDeleteNodes } from "../cst/Node";
import { DeleteStmt, Node as AstNode } from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { mergeClauses } from "./transformUtils";
import {
  withClause,
  whereClause,
  orderByClause,
  limitClause,
  returningClause,
} from "./clauses";

export const deleteMap: TransformMap<AstNode, AllDeleteNodes> = {
  delete_stmt: (node): DeleteStmt => ({
    type: "delete_stmt",
    table: undefined as unknown as DeleteStmt["table"],
    ...mergeClauses(node.clauses, {
      delete_clause: (clause) => ({
        table: cstToAst<DeleteStmt["table"]>(clause.table),
      }),
      returning_clause: returningClause,
      with_clause: withClause,
      where_clause: whereClause,
      order_by_clause: orderByClause,
      limit_clause: limitClause,
    }),
  }),
};
