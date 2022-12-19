import { BaseNode, Keyword } from "./Base";
import { Statement } from "./Statement";

export type AllProgramNodes = Program | BlockStmt;

export interface Program extends BaseNode {
  type: "program";
  statements: Statement[];
}

export interface BlockStmt extends BaseNode {
  type: "block_stmt";
  beginKw: Keyword<"BEGIN">;
  program: Program;
  endKw: Keyword<"END">;
}
