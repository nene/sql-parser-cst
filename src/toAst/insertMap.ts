import { TransformMap } from "../cstTransformer";
import { AllInsertNodes } from "../cst/Node";
import { InsertStmt, Node as AstNode } from "../ast/Node";
import { cstToAst } from "../cstToAst";
import { keywordToString, mergeClauses } from "./transformUtils";
import { withClause } from "./clauses";

export const insertMap: TransformMap<AstNode, AllInsertNodes> = {
  insert_stmt: (node): InsertStmt => {
    return {
      type: "insert_stmt",
      table: undefined as unknown as InsertStmt["table"],
      values: undefined as unknown as InsertStmt["values"],
      ...mergeClauses(node.clauses, {
        with_clause: withClause,
        insert_clause: (clause) => ({
          table: cstToAst<InsertStmt["table"]>(clause.table),
          columns: cstToAst(clause.columns?.expr.items),
          orAction:
            clause.insertKw.name === "REPLACE"
              ? "replace"
              : keywordToString(clause.orAction?.actionKw),
        }),
        values_clause: (clause) => ({
          values: cstToAst<InsertStmt["values"]>(clause),
        }),
        default_values: (clause) => ({
          values: cstToAst<InsertStmt["values"]>(clause),
        }),
        select_stmt: (clause) => ({
          values: cstToAst<InsertStmt["values"]>(clause),
        }),
        compound_select_stmt: (clause) => ({
          values: cstToAst<InsertStmt["values"]>(clause),
        }),
        returning_clause: (clause) => ({
          returning: cstToAst<Required<InsertStmt>["returning"]>(
            clause.columns.items
          ),
        }),
      }),
    };
  },
  values_clause: (node) => ({
    type: "values_clause",
    values: node.values.items.map((row) => {
      if (row.type === "paren_expr") {
        return cstToAst(row.expr.items);
      } else {
        return cstToAst(row.row.expr.items);
      }
    }),
  }),
  default_values: () => ({
    type: "default_values",
  }),
};
