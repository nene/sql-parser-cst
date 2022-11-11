export interface BaseNode {
  leading?: Whitespace[];
  trailing?: Whitespace[];
  range?: [number, number];
}

export interface Whitespace {
  type: "block_comment" | "line_comment" | "newline" | "space";
  text: string;
}
