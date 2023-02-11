import { ParserOptions } from "../../src/main";
import { cstToAst } from "../../src/cstToAst";
import { parse } from "../test_utils";
import { Node, Program } from "../../src/ast/Node";
import { astVisitAll } from "../../src/astVisitAll";

export function parseAst(
  sql: string,
  options: Partial<ParserOptions> = {}
): Program {
  return stripUndefinedFields(cstToAst(parse(sql, options)));
}

export function parseAstStmt(
  sql: string,
  options: Partial<ParserOptions> = {}
) {
  const statements = parseAst(sql, options).statements;
  if (statements.length !== 1) {
    throw new Error(
      `Expected exactly one statements, instead got ${statements.length}`
    );
  }
  return statements[0];
}

function stripUndefinedFields<T extends Node>(ast: T): T {
  astVisitAll(ast, (node: Record<any, any>) => {
    for (const key of Object.keys(node)) {
      if (node[key] === undefined) {
        delete node[key];
      }
    }
  });
  return ast;
}
