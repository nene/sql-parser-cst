import { cstTransformer } from "./cstTransformer";
import { Keyword, Node } from "./main";
import { isString } from "./utils/generic";

interface BaseAstNode {
  range?: [number, number];
}

interface Identifier extends BaseAstNode {
  type: "identifier";
  name: string;
}

interface StringLiteral extends BaseAstNode {
  type: "string_literal";
  value: string;
}

interface NumberLiteral extends BaseAstNode {
  type: "number_literal";
  value: number;
}

interface BinaryExpr extends BaseAstNode {
  type: "binary_expr";
  left: Expr;
  operator: string;
  right: Expr;
}

type Expr = BinaryExpr | StringLiteral | NumberLiteral | Identifier;

interface Alias<T = AstNode> extends BaseAstNode {
  type: "alias";
  expr: T;
  alias: Identifier;
}

interface SelectStmt extends BaseAstNode {
  type: "select_stmt";
  distinct?: "all" | "distinct" | "distinctrow";
  columns: (Expr | Alias<Expr>)[];
}

type AstNode = Expr | SelectStmt | Alias;

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
