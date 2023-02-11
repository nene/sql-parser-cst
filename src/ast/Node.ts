export interface BaseNode {
  range?: [number, number];
}

export interface Identifier extends BaseNode {
  type: "identifier";
  name: string;
}

export interface StringLiteral extends BaseNode {
  type: "string_literal";
  value: string;
}

export interface NumberLiteral extends BaseNode {
  type: "number_literal";
  value: number;
}

export interface BinaryExpr extends BaseNode {
  type: "binary_expr";
  left: Expr;
  operator: string;
  right: Expr;
}

export type Expr = BinaryExpr | StringLiteral | NumberLiteral | Identifier;

export interface Alias<T = Node> extends BaseNode {
  type: "alias";
  expr: T;
  alias: Identifier;
}

export interface AllColumns extends BaseNode {
  type: "all_columns";
}

export interface SelectStmt extends BaseNode {
  type: "select_stmt";
  distinct?: "all" | "distinct" | "distinctrow";
  columns: (AllColumns | Expr | Alias<Expr>)[];
}

export type Statement = SelectStmt;

export interface Program extends BaseNode {
  type: "program";
  statements: Statement[];
}

export type Node = Program | Statement | Expr | Alias | AllColumns;
