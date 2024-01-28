import fs from "fs";
import path from "path";

export function readGrammar(): string {
  return fs.readFileSync(
    path.resolve(__dirname, "../src/parser.pegjs"),
    "utf-8"
  );
}

export function writeGrammar(source: string) {
  return fs.writeFileSync(
    path.resolve(__dirname, "../src/parser.pegjs"),
    source
  );
}

export function toLines(str: string): string[] {
  return str.split("\n");
}

export function fromLines(lines: string[]): string {
  return lines.join("\n");
}

export function caseInsensitiveStringCompare(a: string, b: string): -1 | 0 | 1 {
  const aa = a.toLocaleLowerCase();
  const bb = b.toLowerCase();
  return aa < bb ? -1 : aa > bb ? 1 : 0;
}
