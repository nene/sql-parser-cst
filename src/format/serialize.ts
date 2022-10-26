import { Line } from "./layout";

export function serialize(lines: Line[]): string {
  const INDENT = "  ";
  return lines
    .map((line) => INDENT.repeat(line.indent || 0) + line.items.join(""))
    .join("\n");
}
