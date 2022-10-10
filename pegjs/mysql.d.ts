type Ast = Select;

type Select = {
  type: "select";
  columns: Expr[];
};

type Expr = Literal | StringWithCharset;

type StringWithCharset = {
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

type StringLiteral = {
  type: "string";
  text: string;
};

type NumberLiteral = {
  type: "number";
  text: string;
};

type BoolLiteral = {
  type: "bool";
  text: string;
};

type NullLiteral = {
  type: "null";
  text: string;
};

type DateTimeLiteral = {
  type: "time" | "date" | "datetime" | "timestamp";
  text: string;
};

export function parse(str: string): Ast;
