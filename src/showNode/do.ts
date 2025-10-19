import { show } from "../show";
import { FullTransformMap } from "../cstTransformer";
import { DoStmt } from "src/cst/Do";

export const doMap: FullTransformMap<string, DoStmt> = {
  do_stmt: (node) => show([node.doKw, node.language, node.body]),
};
