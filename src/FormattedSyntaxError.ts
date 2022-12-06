import { SyntaxError } from "./parser";

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
  return `Syntax Error: ${e.message}
--> ${fileName}:${lineNr}:${colNr}
${indent} |
${lineNr} | ${line}
${indent} | ${"^".padStart(colNr)}`;
}
