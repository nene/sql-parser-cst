type Ast = Select;

type Select = {
  type: "select";
  columns: Expr[];
};

type Expr = Literal;

type Literal = StringLiteral | BoolLiteral;

type StringLiteral = {
  type: "string";
  prefix?: string;
  text: string;
};

type BoolLiteral = {
  type: "bool";
  text: string;
};

export function parse(str: string): Ast;
