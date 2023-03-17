import { BaseNode, Keyword } from "./Base";

export type AllMysqlNodes = Hint;

export interface Hint extends BaseNode {
  type: "hint";
  hintKw: Keyword<"LOW_PRIORITY" | "QUICK" | "IGNORE">;
}
