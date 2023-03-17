import { BaseNode, Keyword } from "./Base";

export type AllMysqlNodes = Hint;

export interface Hint extends BaseNode {
  type: "hint";
  hintKw: Keyword<
    | "LOW_PRIORITY"
    | "HIGH_PRIORITY"
    | "QUICK"
    | "IGNORE"
    | "STRAIGHT_JOIN"
    | "SQL_CALC_FOUND_ROWS"
    | "SQL_CACHE"
    | "SQL_NO_CACHE"
    | "SQL_BIG_RESULT"
    | "SQL_SMALL_RESULT"
    | "SQL_BUFFER_RESULT"
  >;
}
