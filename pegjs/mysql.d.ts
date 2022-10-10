type Ast = Select;

type Node = {
  leadingComments?: Comment[];
  trailingComments?: Comment[];
};

type Comment = {
  type: "block_comment" | "line_comment";
  text: string;
};

type Select = Node & {
  type: "select";
  columns: Expr[];
};

type Expr = Literal | StringWithCharset;

type StringWithCharset = Node & {
  type: "string_with_charset";
  charset: string;
  string: StringLiteral;
};

type Literal =
  | StringLiteral
  | NumberLiteral
  | BoolLiteral
  | NullLiteral
  | DateTimeLiteral;

type StringLiteral = Node & {
  type: "string";
  text: string;
};

type NumberLiteral = Node & {
  type: "number";
  text: string;
};

type BoolLiteral = Node & {
  type: "bool";
  text: string;
};

type NullLiteral = Node & {
  type: "null";
  text: string;
};

type DateTimeLiteral = Node & {
  type: "datetime";
  kw: Keyword;
  string: StringLiteral;
};

type Keyword = Node & {
  type: "keyword";
  text: string;
};

export function parse(str: string): Ast;
