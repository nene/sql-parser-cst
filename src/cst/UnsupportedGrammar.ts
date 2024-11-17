import { BaseNode } from "./Base";

export interface UnsupportedGrammarStmt extends BaseNode {
  type: "unsupported_grammar_stmt";
  text: string;
}
