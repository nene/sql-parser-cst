import {
  Expr,
  ParenExpr,
  Program,
  SelectClause,
  Statement,
  SubSelect,
  Whitespace,
} from "../pegjs/sql";
import {
  parse as parseSql,
  ParserOptions,
  show,
  mysql,
  sqlite,
} from "../src/parser";

const dialectMap = { mysql, sqlite };

type DialectName = keyof typeof dialectMap;

declare var __SQL_DIALECT__: DialectName;

export const preserveAll: ParserOptions = {
  preserveComments: true,
  preserveNewlines: true,
  preserveSpaces: true,
};

export function parse(sql: string, options: ParserOptions = {}): Program {
  return parseSql(sql, {
    dialect: dialectMap[__SQL_DIALECT__],
    ...options,
  });
}

export function parseStmt(sql: string, options: ParserOptions = {}): Statement {
  const { statements } = parse(sql, options);
  if (statements.length !== 1) {
    throw new Error(`Expected one statement, instead got ${statements.length}`);
  }
  return statements[0];
}

export function dialect(lang: DialectName | DialectName[], block: () => void) {
  lang = typeof lang === "string" ? [lang] : lang;
  if (lang.includes(__SQL_DIALECT__)) {
    describe(__SQL_DIALECT__, block);
  }
}

export function test(sql: string) {
  expect(show(parse(sql, preserveAll))).toBe(sql);
}

export function testExpr(expr: string) {
  expect(show(parse(`SELECT ${expr}`, preserveAll))).toBe(`SELECT ${expr}`);
}

export function parseExpr(expr: string, options?: ParserOptions): Expr {
  const stmt = parseStmt(`SELECT ${expr}`, options);
  if (stmt.type !== "select_statement") {
    throw new Error(`Expected select_statement, instead got ${stmt.type}`);
  }
  const clause = stmt.clauses[0];
  if (clause.type !== "select_clause") {
    throw new Error(`Expected select_clause, instead got ${clause.type}`);
  }
  if (clause.columns.length !== 1) {
    throw new Error(`Expected 1 column, instead got ${clause.columns.length}`);
  }
  const result = clause.columns[0];
  if (result.type === "alias") {
    throw new Error(`Expected expression, instead got alias`);
  }
  return result;
}

/**
 * Converts SQL expression to parenthesized version.
 * For example:
 *
 *     showPrecedence("1 + 2 / 3") --> "(1 + (2 / 3))"
 */
export function showPrecedence(sql: string): string {
  return show(addPrecedenceParens(parseExpr(sql)));
}

/**
 * Converts compound select to parenthesized version.
 * For example:
 *
 *     showCompoundPrecedence("SELECT 1 UNION SELECT 2") --> "(SELECT 1 UNION SELECT 2)"
 */
export function showCompoundPrecedence(sql: string): string {
  const stmt = parseStmt(sql);
  if (stmt.type !== "compound_select_statement") {
    throw new Error(
      `Expected compound_select_statement, instead got ${stmt.type}`
    );
  }
  return show(addPrecedenceParens(stmt));
}

function addPrecedenceParens<T extends Expr | SubSelect>(
  expr: T
): ParenExpr<T> | T {
  const space: Whitespace[] = [{ type: "space", text: " " }];

  if (
    expr.type === "binary_expr" ||
    expr.type === "compound_select_statement"
  ) {
    return {
      type: "paren_expr",
      expr: {
        ...expr,
        left: { ...addPrecedenceParens(expr.left), trailing: space },
        right: { ...addPrecedenceParens(expr.right), leading: space },
      },
    };
  } else if (expr.type === "unary_expr") {
    return {
      type: "paren_expr",
      expr: {
        ...expr,
        expr: { ...addPrecedenceParens(expr.expr), leading: space },
      },
    };
  } else if (expr.type === "select_statement") {
    // Add space inside select clause: SELECT <space_here> x
    const selectClause = expr.clauses[0] as SelectClause;
    return {
      ...expr,
      clauses: [
        {
          ...selectClause,
          selectKw: { ...selectClause.selectKw, trailing: space },
        },
      ],
    };
  } else {
    return expr;
  }
}

export { show };
