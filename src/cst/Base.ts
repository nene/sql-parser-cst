export interface BaseNode {
  leading?: Whitespace[];
  trailing?: Whitespace[];
  range?: [number, number];
}

export interface Whitespace {
  type: "block_comment" | "line_comment" | "newline" | "space";
  text: string;
}

export interface Keyword<T extends string = string> extends BaseNode {
  type: "keyword";
  text: string;
  name: T;
}

export interface AllColumns extends BaseNode {
  type: "all_columns";
}

export interface Empty extends BaseNode {
  type: "empty";
}
