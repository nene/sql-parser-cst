import { ParserOptions } from "../../src/main";
import { cstToAst } from "../../src/cstToAst";
import { parse } from "../test_utils";
import { Node, Program } from "../../src/ast/Node";
import { astVisitAll } from "../../src/astVisitAll";

export function parseAst(
  sql: string,
  options: Partial<ParserOptions> = {}
): Program {
  return stripUndefinedFields(
    stripRangeFields(cstToAst(parse(sql, { ...options, includeRange: true })))
  );
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

export function parseAstExpr(
  sql: string,
  options: Partial<ParserOptions> = {}
) {
  const stmt = parseAstStmt(`SELECT ${sql}`, options);
  // if (stmt.type !== "select_stmt") {
  //   throw new Error(`Expected select_stmt, instead got ${stmt.type}`);
  // }
  if (stmt.columns.length !== 1) {
    throw new Error(
      `Expected single column in select, instead got ${stmt.columns.length}`
    );
  }
  return stmt.columns[0];
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

// Validates that range field is present, then discards it.
function stripRangeFields<T extends Node>(ast: T): T {
  astVisitAll(ast, (node) => {
    if (!node.range) {
      throw new Error(`Expected 'range' field in Node of type ${node.type}`);
    }
    delete node.range;
  });
  return ast;
}
