import { UnsupportedGrammarStmt } from "src/cst/UnsupportedGrammar";
import { FullTransformMap } from "src/cstTransformer";

export const unsupportedGrammarMap: FullTransformMap<
  string,
  UnsupportedGrammarStmt
> = {
  unsupported_grammar_stmt: (node) => node.text,
};
