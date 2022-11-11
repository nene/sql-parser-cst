import { BaseNode } from "./Base";
import { Statement } from "./Statement";

export interface Program extends BaseNode {
  type: "program";
  statements: Statement[];
}
