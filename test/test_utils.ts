import {
  Expr,
  ParenExpr,
  Program,
  SelectClause,
  Statement,
  SubSelect,
  Whitespace,
} from "../src/cst/Node";
import {
  DialectName,
  parse as parseSql,
  ParserOptions,
  show,
} from "../src/main";

declare var __SQL_DIALECT__: DialectName;

export const preserveAll: Partial<ParserOptions> = {
  preserveComments: true,
  preserveNewlines: true,
  preserveSpaces: true,
};

export function parse(
  sql: string,
  options: Partial<ParserOptions> = {}
): Program {
  return parseSql(sql, {
    dialect: __SQL_DIALECT__,
    ...options,
  });
}

export function parseStmt(
  sql: string,
  options: Partial<ParserOptions> = {}
): Statement {
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

export function test(sql: string, options?: Partial<ParserOptions>) {
  expect(show(parse(sql, options || preserveAll))).toBe(sql);
}

export function testExpr(expr: string) {
  expect(show(parse(`SELECT ${expr}`, preserveAll))).toBe(`SELECT ${expr}`);
}

export function parseExpr(
  expr: string,
  options?: Partial<ParserOptions>
): Expr {
  const stmt = parseStmt(`SELECT ${expr}`, options);
  if (stmt.type !== "select_stmt") {
    throw new Error(`Expected select_stmt, instead got ${stmt.type}`);
  }
  const clause = stmt.clauses[0];
  if (clause.type !== "select_clause") {
    throw new Error(`Expected select_clause, instead got ${clause.type}`);
  }
  if (clause.columns.items.length !== 1) {
    throw new Error(
      `Expected 1 column, instead got ${clause.columns.items.length}`
    );
  }
  const result = clause.columns.items[0];
  if (
    result.type === "alias" ||
    result.type === "empty" ||
    result.type === "all_columns"
  ) {
    throw new Error(`Expected expression, instead got ${result.type}`);
  }
  return result;
}

export function testClause(clause: string) {
  const sql = `SELECT c FROM t ${clause}`;
  expect(show(parse(sql, preserveAll))).toBe(sql);
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
  if (stmt.type !== "compound_select_stmt") {
    throw new Error(`Expected compound_select_stmt, instead got ${stmt.type}`);
  }
  return show(addPrecedenceParens(stmt));
}

function addPrecedenceParens<T extends Expr | SubSelect>(
  expr: T
): ParenExpr<T> | T {
  const space: Whitespace[] = [{ type: "space", text: " " }];

  if (expr.type === "binary_expr" || expr.type === "compound_select_stmt") {
    return {
      type: "paren_expr",
      expr: {
        ...expr,
        left: { ...addPrecedenceParens(expr.left), trailing: space },
        right: { ...addPrecedenceParens(expr.right), leading: space },
      },
    };
  } else if (expr.type === "prefix_op_expr") {
    return {
      type: "paren_expr",
      expr: {
        ...expr,
        expr: { ...addPrecedenceParens(expr.expr), leading: space },
      },
    };
  } else if (expr.type === "postfix_op_expr") {
    return {
      type: "paren_expr",
      expr: {
        ...expr,
        expr: { ...addPrecedenceParens(expr.expr), trailing: space },
      },
    };
  } else if (expr.type === "select_stmt") {
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

export function parseFrom(
  fromExpr: string,
  options: Partial<ParserOptions> = {}
) {
  const stmt = parseStmt(`SELECT col FROM ${fromExpr}`, options);
  if (stmt.type !== "select_stmt") {
    throw new Error(`Expected select_stmt, instead got ${stmt.type}`);
  }
  const fromClause = stmt.clauses[1];
  if (fromClause.type !== "from_clause") {
    throw new Error(`Expected from_clause, instead got ${fromClause.type}`);
  }
  return fromClause.expr;
}

export { show };
