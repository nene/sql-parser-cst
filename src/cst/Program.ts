import { BaseNode } from "./Base";
import { Statement } from "./Statement";

export type AllProgramNodes = Program;

export interface Program extends BaseNode {
  type: "program";
  statements: Statement[];
}
