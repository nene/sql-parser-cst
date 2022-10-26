import { Program } from "../../pegjs/sql";
import { isLine, layout } from "./layout";
import { serialize } from "./serialize";
import { unroll } from "./unroll";

export function format(node: Program) {
  const lines = unroll(layout(node));
  if (!(lines instanceof Array) || !lines.every(isLine)) {
    throw new Error(`Expected array of lines, instead got ${lines}`);
  }
  return serialize(lines);
}
