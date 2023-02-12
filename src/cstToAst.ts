import { cstTransformer } from "./cstTransformer";
import { Keyword, Node as CstNode } from "./cst/Node";
import { isString } from "./utils/generic";
import {
  Expr,
  Identifier,
  InsertStmt,
  Node as AstNode,
  SelectStmt,
  SortSpecification,
  WithClause,
} from "./ast/Node";

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
        case "with_clause":
          stmt.with = cstToAst<WithClause>(clause);
          break;
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
          stmt.orderBy = cstToAst<(Identifier | SortSpecification)[]>(
            clause.specifications.items
          );
          break;
        case "limit_clause":
          stmt.limit = cstToAst<Expr>(clause.count);
          stmt.offset = clause.offset && cstToAst<Expr>(clause.offset);
          break;
        default:
          throw new Error(`Unimplemented SelectStmt clause: ${clause.type}`);
      }
    });
    return stmt;
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
  sort_specification: (node) => ({
    type: "sort_specification",
    expr: cstToAst(node.expr),
    order: keywordToString(node.orderKw),
    nulls: node.nullHandlingKw && keywordToString(node.nullHandlingKw[1]),
  }),
  insert_stmt: (node) => {
    const stmt: InsertStmt = {
      type: "insert_stmt",
      table: undefined as unknown as InsertStmt["table"],
      values: [],
    };
    node.clauses.forEach((clause) => {
      switch (clause.type) {
        case "insert_clause":
          stmt.table = cstToAst(clause.table);
          stmt.columns = clause.columns
            ? cstToAst<Identifier[]>(clause.columns.expr.items)
            : undefined;
          break;
        case "values_clause":
          stmt.values = clause.values.items.map((row) => {
            if (row.type === "paren_expr") {
              return cstToAst(row.expr.items);
            } else {
              return cstToAst(row.row.expr.items);
            }
          });
          break;
        default:
          throw new Error(`Unimplemented InsertStmt clause: ${clause.type}`);
      }
    });
    if (!stmt.table) {
      throw new Error(`InsertStmt must have table field`);
    }
    return stmt;
  },
  alias: (node) => ({
    type: "alias",
    expr: cstToAst(node.expr),
    alias: cstToAst(node.alias),
  }),
  all_columns: (node) => node,
  paren_expr: (node) => cstToAst(node.expr),
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

const keywordToBoolean = (kw: Keyword | undefined): boolean | undefined => {
  return kw ? true : undefined;
};
