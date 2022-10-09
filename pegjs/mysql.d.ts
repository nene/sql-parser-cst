type Ast = Select;

type Select = {
  type: "select";
  columns: Expr[];
};

type Expr = String;

type String = {
  type: "string";
  text: string;
};

export function parse(str: string): Ast;
