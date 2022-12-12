import { BaseNode, Keyword } from "./Base";
import { Statement } from "./Statement";

export type AllProgramNodes = Program | CodeBlock;

export interface Program extends BaseNode {
  type: "program";
  statements: Statement[];
}

export interface CodeBlock extends BaseNode {
  type: "code_block";
  beginKw: Keyword<"BEGIN">;
  program: Program;
  endKw: Keyword<"END">;
}
