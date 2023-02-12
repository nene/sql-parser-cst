import { cstTransformer } from "./cstTransformer";
import { Keyword, Node as CstNode } from "./cst/Node";
import { isString } from "./utils/generic";
import {
  Expr,
  Identifier,
  InsertStmt,
  NamedWindow,
  Node as AstNode,
  SelectStmt,
  SortSpecification,
  TableExpr,
  WithClause,
} from "./ast/Node";

export function cstToAst<T extends AstNode[]>(cstNode: CstNode[]): T;
export function cstToAst<T extends AstNode>(cstNode: CstNode): T;
export function cstToAst<T extends AstNode[]>(
  cstNode: CstNode[] | undefined
): T | undefined;
export function cstToAst<T extends AstNode>(
  cstNode: CstNode | undefined
): T | undefined;
export function cstToAst<T extends AstNode>(
  cstNode: CstNode | CstNode[] | undefined
): T | T[] | undefined {
  if (cstNode === undefined) {
    return undefined;
  }
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
  select_stmt: (node): SelectStmt => {
    return {
      type: "select_stmt",
      columns: [],
      ...mergeClauses(node.clauses, {
        with_clause: (clause) => ({
          with: cstToAst<WithClause>(clause),
        }),
        select_clause: (clause) => ({
          columns: cstToAst<SelectStmt["columns"]>(clause.columns.items),
          distinct: keywordToString(clause.distinctKw),
        }),
        from_clause: (clause) => ({
          from: cstToAst<TableExpr>(clause.expr),
        }),
        where_clause: (clause) => ({
          where: cstToAst<Expr>(clause.expr),
        }),
        group_by_clause: (clause) => {
          if (clause.columns.type === "list_expr") {
            return { groupBy: cstToAst<Identifier[]>(clause.columns.items) };
          } else {
            return {};
          }
        },
        having_clause: (clause) => ({
          having: cstToAst<Expr>(clause.expr),
        }),
        order_by_clause: (clause) => ({
          orderBy: cstToAst<(Identifier | SortSpecification)[]>(
            clause.specifications.items
          ),
        }),
        window_clause: (clause) => ({
          window: cstToAst<NamedWindow[]>(clause.namedWindows.items),
        }),
        limit_clause: (clause) => ({
          limit: cstToAst<Expr>(clause.count),
          offset: clause.offset && cstToAst<Expr>(clause.offset),
        }),
      }),
    };
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
  join_expr: (node) => ({
    type: "join_expr",
    left: cstToAst(node.left),
    operator: isString(node.operator) ? "," : keywordToString(node.operator),
    right: cstToAst(node.right),
    specification: cstToAst(node.specification),
  }),
  join_on_specification: (node) => ({
    type: "join_on_specification",
    expr: cstToAst(node.expr),
  }),
  join_using_specification: (node) => ({
    type: "join_using_specification",
    columns: cstToAst(node.expr.expr.items),
  }),
  sort_specification: (node) => ({
    type: "sort_specification",
    expr: cstToAst(node.expr),
    order: keywordToString(node.orderKw),
    nulls: keywordToString(node.nullHandlingKw?.[1]),
  }),
  named_window: (node) => ({
    type: "named_window",
    name: cstToAst(node.name),
    window: cstToAst(node.window),
  }),
  window_definition: (node) => ({
    type: "window_definition",
    baseWindowName: cstToAst(node.baseWindowName),
    partitionBy: cstToAst(node.partitionBy?.specifications.items),
    orderBy: cstToAst(node.orderBy?.specifications.items),
    frame: cstToAst(node.frame),
  }),
  frame_clause: (node) => ({
    type: "frame_clause",
    unit: keywordToString(node.unitKw),
    extent: cstToAst(node.extent),
    exclude: keywordToString(node.exclusion?.kindKw),
  }),
  frame_between: (node) => ({
    type: "frame_between",
    begin: cstToAst(node.begin),
    end: cstToAst(node.end),
  }),
  frame_bound_current_row: () => ({
    type: "frame_bound_current_row",
  }),
  frame_bound_preceding: (node) => ({
    type: "frame_bound_preceding",
    expr: cstToAst(node.expr),
  }),
  frame_bound_following: (node) => ({
    type: "frame_bound_following",
    expr: cstToAst(node.expr),
  }),
  frame_unbounded: () => ({
    type: "frame_unbounded",
  }),
  insert_stmt: (node): InsertStmt => {
    return {
      type: "insert_stmt",
      table: undefined as unknown as InsertStmt["table"],
      values: [],
      ...mergeClauses(node.clauses, {
        insert_clause: (clause) => ({
          table: cstToAst<InsertStmt["table"]>(clause.table),
          columns: cstToAst(clause.columns?.expr.items),
        }),
        values_clause: (clause) => ({
          values: clause.values.items.map((row) => {
            if (row.type === "paren_expr") {
              return cstToAst(row.expr.items);
            } else {
              return cstToAst(row.row.expr.items);
            }
          }),
        }),
      }),
    };
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
  func_call: (node) => ({
    type: "func_call",
    name: cstToAst(node.name),
    args: cstToAst(node.args?.expr.args.items),
    distinct: keywordToBoolean(node.args?.expr.distinctKw),
    over: cstToAst(node.over?.window),
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

type ClausesMap<TCstNode extends CstNode, TAstNode extends AstNode> = {
  [K in TCstNode["type"]]: (
    node: Extract<TCstNode, { type: K }>
  ) => Partial<TAstNode>;
};

const mergeClauses = <TAstNode extends AstNode, TCstNode extends CstNode>(
  clauses: TCstNode[],
  map: Partial<ClausesMap<TCstNode, TAstNode>>
): Partial<TAstNode> => {
  const result: Partial<TAstNode> = {};
  for (const clause of clauses) {
    const node = clause as Extract<TCstNode, { type: typeof clause["type"] }>;
    const fn = map[node.type] as (e: typeof node) => Partial<TAstNode>;
    if (!fn) {
      throw new Error(`No map entry for clause: ${node.type}`);
    }
    Object.assign(result, fn(node));
  }
  return result;
};

function keywordToString<T = string>(kw: Keyword | Keyword[]): T;
function keywordToString<T = string>(
  kw: Keyword | Keyword[] | undefined
): T | undefined;
function keywordToString<T = string>(
  kw: Keyword | Keyword[] | undefined
): T | undefined {
  if (!kw) {
    return undefined;
  }
  if (Array.isArray(kw)) {
    return kw.map(keywordToString).join(" ") as T;
  }
  return kw.name.toLowerCase() as T;
}

const keywordToBoolean = (kw: Keyword | undefined): boolean | undefined => {
  return kw ? true : undefined;
};
