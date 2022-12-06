import { Expectation, SyntaxError } from "./parser";

export class FormattedSyntaxError extends Error {
  constructor(e: SyntaxError, sql: string, fileName: string) {
    super(formatError(e, sql, fileName));
  }
}

function formatError(e: SyntaxError, sql: string, fileName: string): string {
  const lineNr = e.location.start.line;
  const colNr = e.location.start.column;
  const line = sql.split("\n")[lineNr - 1];
  const indent = "".padStart(String(lineNr).length);

  const found = describeFound(expandFound(e.found, colNr, line));
  const expected = describeExpected(e.expected);

  return `Syntax Error: Unexpected ${found}
Was expecting to see: ${expected}
--> ${fileName}:${lineNr}:${colNr}
${indent} |
${lineNr} | ${line}
${indent} | ${"^".padStart(colNr)}`;
}

// When we stopped at a single letter, display the whole word instead
function expandFound(
  found: string | null,
  colNr: number,
  line: string
): string | null {
  if (found !== null && /^\w$/.test(found)) {
    const [word] = line.slice(colNr - 1).match(/\w+/) || [];
    return word;
  }
  return found;
}

//
// These functions have been copied from the generated parser.
// But we can't import them as they live inside a closure.
//

function describeFound(found1: string | null) {
  return found1 ? '"' + literalEscape(found1) + '"' : "end of input";
}

function describeExpected(expected1: Expectation[]) {
  const descriptions = expected1.map(describeExpectation);
  let i: number;
  let j: number;

  descriptions.sort();

  if (descriptions.length > 0) {
    for (i = 1, j = 1; i < descriptions.length; i++) {
      if (descriptions[i - 1] !== descriptions[i]) {
        descriptions[j] = descriptions[i];
        j++;
      }
    }
    descriptions.length = j;
  }

  switch (descriptions.length) {
    case 1:
      return descriptions[0];

    case 2:
      return descriptions[0] + " or " + descriptions[1];

    default:
      return (
        descriptions.slice(0, -1).join(", ") +
        ", or " +
        descriptions[descriptions.length - 1]
      );
  }
}

function describeExpectation(expectation: Expectation) {
  switch (expectation.type) {
    case "literal":
      return '"' + literalEscape(expectation.text) + '"';
    case "class":
      const escapedParts = expectation.parts.map((part) => {
        return Array.isArray(part)
          ? classEscape(part[0] as string) +
              "-" +
              classEscape(part[1] as string)
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
    case "any":
      return "any character";
    case "end":
      return "end of input";
    case "other":
      return expectation.description;
  }
}

function literalEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\0/g, "\\0")
    .replace(/\t/g, "\\t")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch))
    .replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch));
}

function classEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\]/g, "\\]")
    .replace(/\^/g, "\\^")
    .replace(/-/g, "\\-")
    .replace(/\0/g, "\\0")
    .replace(/\t/g, "\\t")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch))
    .replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch));
}

function hex(ch: string): string {
  return ch.charCodeAt(0).toString(16).toUpperCase();
}
