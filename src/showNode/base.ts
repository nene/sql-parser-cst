import { show } from "../show";
import { Alias, AllColumns, Empty, Keyword, Program } from "../cst/Node";
import { FullTransformMap } from "../cstTransformer";

export const baseMap: FullTransformMap<
  string,
  Keyword | AllColumns | Empty | Alias | Program
> = {
  keyword: (node) => node.text,
  all_columns: () => "*",
  empty: () => "",
  alias: (node) => show([node.expr, node.asKw, node.alias]),
  program: (node) => show(node.statements, ";"),
};
