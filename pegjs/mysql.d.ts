type Ast = Select;

type Select = {
  type: "select";
  columns: Expr[];
};

type Expr = Literal;

type Literal =
  | StringLiteral
  | NumberLiteral
  | BoolLiteral
  | NullLiteral
  | DateTimeLiteral;

type StringLiteral = {
  type: "string";
  prefix?: string;
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
