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

/**
 * Extracts the lines between the start and end comments for a given type.
 */
export function extractRules(lines: string[], type: string) {
  const startRegex = new RegExp(`^\\/\\*! ${type}:start `);
  const endRegex = new RegExp(`^\\/\\*! ${type}:end `);

  const startIndex = lines.findIndex((line) => startRegex.test(line)) + 1;
  const endIndex = lines.findIndex((line) => endRegex.test(line));

  return {
    before: lines.slice(0, startIndex),
    rules: lines.slice(startIndex, endIndex),
    after: lines.slice(endIndex),
  };
}
