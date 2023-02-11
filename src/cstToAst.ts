import { cstTransformer } from "./cstTransformer";
import { Keyword, Node } from "./cst/Node";
import { isString } from "./utils/generic";
import { Expr, Node as AstNode, SelectStmt } from "./ast/Node";

const cstToAst = <T = AstNode>(node: Node): T => {
  return cstToAst2(node) as T;
};

const cstToAst2 = cstTransformer<AstNode>({
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
  binary_expr: (node) => ({
    type: "binary_expr",
    left: cstToAst(node.left),
    operator: isString(node.operator) ? node.operator : "",
    right: cstToAst(node.left),
    range: node.range,
  }),
  identifier: (node) => ({
    type: "identifier",
    name: node.name,
    range: node.range,
  }),
  string_literal: (node) => ({
    type: "string_literal",
    value: node.value,
    range: node.range,
  }),
  number_literal: (node) => ({
    type: "number_literal",
    value: node.value,
    range: node.range,
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
