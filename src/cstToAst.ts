import { cstTransformer } from "./cstTransformer";
import { Keyword, Node as CstNode } from "./cst/Node";
import { isString } from "./utils/generic";
import { Expr, Identifier, Node as AstNode, SelectStmt } from "./ast/Node";

export function cstToAst<T extends AstNode[]>(cstNode: CstNode[]): T;
export function cstToAst<T extends AstNode>(cstNode: CstNode): T;
export function cstToAst<T extends AstNode>(
  cstNode: CstNode | CstNode[]
): T | T[] {
  if (Array.isArray(cstNode)) {
    return cstNode.map(cstToAst) as T[];
  }
  const astNode = cstToAst2(cstNode) as T;
  astNode.range = cstNode.range;
  return astNode;
}

const cstToAst2 = cstTransformer<AstNode>({
  program: (node) => ({
    type: "program",
    statements: cstToAst(node.statements),
  }),
  select_stmt: (node) => {
    const stmt: SelectStmt = {
      type: "select_stmt",
      columns: [],
    };
    node.clauses.forEach((clause) => {
      switch (clause.type) {
        case "select_clause":
          stmt.columns = cstToAst(clause.columns.items);
          stmt.distinct = keywordToString(clause.distinctKw);
          break;
        case "from_clause":
          stmt.from = cstToAst<Expr>(clause.expr);
          break;
        case "where_clause":
          stmt.where = cstToAst<Expr>(clause.expr);
          break;
        case "group_by_clause":
          if (clause.columns.type === "list_expr") {
            stmt.groupBy = cstToAst<Identifier[]>(clause.columns.items);
          }
          break;
        case "having_clause":
          stmt.having = cstToAst<Expr>(clause.expr);
          break;
        case "order_by_clause":
          stmt.orderBy = cstToAst<Identifier[]>(clause.specifications.items);
          break;
        case "limit_clause":
          stmt.limit = cstToAst<Expr>(clause.count);
          break;
        default:
          throw new Error(`Unimplemented SelectStmt clause: ${clause.type}`);
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
  boolean_literal: (node) => ({
    type: "boolean_literal",
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
