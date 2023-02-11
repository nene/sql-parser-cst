import { cstTransformer } from "./cstTransformer";
import { Keyword, Node as CstNode } from "./cst/Node";
import { isString } from "./utils/generic";
import { Expr, Node as AstNode, SelectStmt, Statement } from "./ast/Node";

export const cstToAst = <T extends AstNode>(cstNode: CstNode): T => {
  const astNode = cstToAst2(cstNode) as T;
  astNode.range = cstNode.range;
  return astNode;
};

const cstToAst2 = cstTransformer<AstNode>({
  program: (node) => ({
    type: "program",
    statements: node.statements.map(cstToAst) as Statement[],
  }),
  select_stmt: (node) => {
    const stmt: SelectStmt = {
      type: "select_stmt",
      columns: [],
    };
    node.clauses.forEach((clause) => {
      if (clause.type === "select_clause") {
        stmt.columns = clause.columns.items.map(cstToAst) as Expr[];
        stmt.distinct = keywordToString(clause.distinctKw);
      }
    });
    return stmt;
  },
  alias: (node) => ({
    type: "alias",
    expr: cstToAst(node.expr),
    alias: cstToAst(node.alias),
  }),
  all_columns: (node) => node,
  binary_expr: (node) => ({
    type: "binary_expr",
    left: cstToAst(node.left),
    operator: isString(node.operator) ? node.operator : "",
    right: cstToAst(node.left),
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
});

const keywordToString = <T = string>(
  kw: Keyword | undefined
): T | undefined => {
  if (!kw) {
    return undefined;
  }
  return kw.name.toLowerCase() as T;
};
