type Ast = Select;

type Select = {
  type: "select";
  columns: Expr[];
};

type Expr = Literal;

type Literal = StringLiteral | BoolLiteral | NullLiteral;

type StringLiteral = {
  type: "string";
  prefix?: string;
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

export function parse(str: string): Ast;
