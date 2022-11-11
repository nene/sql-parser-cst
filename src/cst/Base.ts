export interface BaseNode {
  leading?: Whitespace[];
  trailing?: Whitespace[];
  range?: [number, number];
}

export interface Whitespace {
  type: "block_comment" | "line_comment" | "newline" | "space";
  text: string;
}

export interface ColumnRef extends BaseNode {
  type: "column_ref";
  table?: Identifier;
  column: Identifier | AllColumns;
}

export interface TableRef extends BaseNode {
  type: "table_ref";
  schema?: Identifier;
  table: Identifier;
}

export interface Identifier extends BaseNode {
  type: "identifier";
  text: string;
}

export interface Keyword<T extends string = string> extends BaseNode {
  type: "keyword";
  text: string;
  name: T;
}

export interface Parameter extends BaseNode {
  type: "parameter";
  text: string;
}

export interface AllColumns extends BaseNode {
  type: "all_columns";
}
