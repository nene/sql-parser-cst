# SQL Parser CST [![npm version](https://img.shields.io/npm/v/sql-parser-cst)](https://www.npmjs.com/package/sql-parser-cst) ![build status](https://github.com/nene/sql-parser-cst/actions/workflows/build.yml/badge.svg)

SQL Parser which produces a **Concrete Syntax Tree** (CST).

Unlike a more usual parser which produces an Abstract Syntax Tree (AST),
this parser preserves all the syntax elements present in the parsed source code,
with the goal of being able to re-create the exact original source code.

**Try it live in [SQL Explorer][].**

## Features

- Detailed TypeScript types for the syntax tree
- Unified syntax tree for multiple SQL dialects
- Includes source code location data for all nodes
- Includes comments in the syntax tree
- Helpful error messages
- Fast

Supports the following SQL dialects:

- **SQLite** - full support (version 3.45)
- **BigQuery** - full support (as of 31 January 2024).
- **MySQL** - experimental (version 8)
  (see [#7](https://github.com/nene/sql-parser-cst/issues/7) for implementation progress).
- **MariaDB** - experimental (version 10)
  (see [#32](https://github.com/nene/sql-parser-cst/issues/32) for implementation progress).
- **PostgreSQL** - experimental (version 16)
  (see [#40](https://github.com/nene/sql-parser-cst/issues/40) for implementation progress).

**Note:** This software is in very active development.
The syntax tree structure is mostly stable now,
though there are bound to be changes as new SQL dialects
are added and they contain features that need to be accommodated
to the syntax tree.

## Install

```
npm install sql-parser-cst
```

## Usage

```ts
import { parse, show, cstVisitor } from "sql-parser-cst";

const cst = parse("select * from my_table", {
  dialect: "sqlite",
  // These are optional:
  includeSpaces: true, // Adds spaces/tabs
  includeNewlines: true, // Adds newlines
  includeComments: true, // Adds comments
  includeRange: true, // Adds source code location data
});

// convert all keywords to uppercase
const toUpper = cstVisitor({
  keyword: (kw) => {
    kw.text = kw.text.toUpperCase();
  },
});
toUpper(cst);

// Serialize back to SQL
show(cst); // --> SELECT * FROM my_table
```

## AST versus CST-parsers

For example, given the following SQL:

```sql
/* My query */
SELECT ("first_name" || ' jr.') as fname
-- use important table
FROM persons;
```

An AST-parser might parse this to the following abstract syntax tree:

```json
{
  "type": "select_stmt",
  "columns": [
    {
      "type": "alias",
      "expr": {
        "type": "binary_expr",
        "left": { "type": "column_ref", "column": "first_name" },
        "operator": "||",
        "right": { "type": "string", "value": " jr." }
      },
      "alias": "fname"
    }
  ],
  "from": [{ "type": "table_ref", "table": "persons" }]
}
```

Note that the above AST is missing the following information:

- comments
- whitespace (e.g. where the newlines are)
- case of keywords (e.g. whether `AS` or `as` was written)
- whether an identifier was quoted or not (and with what kind of quotes)
- whether an expression is wrapped in additional (unnecessary) parenthesis.
- whether the statement ends with a semicolon.

In contrast, this CST parser produces the following concrete syntax tree,
which preserves all of this information:

<!-- prettier-ignore -->
```json
{
  "type": "program",
  "statements": [
    {
      "type": "select_stmt",
      "clauses": [
        {
          "type": "select_clause",
          "selectKw": { "type": "keyword", "text": "SELECT", "name": "SELECT" },
          "options": [],
          "columns": {
            "type": "list_expr",
            "items": [
              {
                "type": "alias",
                "expr": {
                  "type": "paren_expr",
                  "expr": {
                    "type": "binary_expr",
                    "left": { "type": "identifier", "text": "\"first_name\"", "name": "first_name" },
                    "operator": "||",
                    "right": { "type": "string_literal", "text": "' jr.'", "value": " jr." }
                  }
                },
                "asKw": { "type": "keyword", "text": "as", "name": "AS" },
                "alias": { "type": "identifier", "text": "fname", "name": "fname" }
              }
            ]
          }
        },
        {
          "type": "from_clause",
          "fromKw": { "type": "keyword", "text": "FROM", "name": "FROM" },
          "expr": { "type": "identifier", "text": "persons", "name": "persons" },
          "leading": [
            { "type": "newline", "text": "\n" },
            { "type": "line_comment", "text": "-- use important table" },
            { "type": "newline", "text": "\n" }
          ]
        }
      ]
    },
    { "type": "empty" }
  ],
  "leading": [
    { "type": "block_comment", "text": "/* My query */" },
    { "type": "newline", "text": "\n" }
  ]
}
```

Note the following conventions:

- All keywords are preserved in `type: keyword` nodes, which are usually
  stored in fields named like `someNameKw`.
- Parenthesis is represented by separate `type: paren_expr` node.
- Comma-separated lists are represented by separate `type: list_expr` node.
- Trailing semicolon is represented by `type: empty` node in the end.
- The original source code representation of strings, identifiers, keywords, etc
  is preserved in `text` fields.
- Each node can have `leading` and `trailing` fields,
  which store comments and newlines immediately before or after that node.
  These fields will also contain information about regular spaces/tabs
  (e.g. `{"type": "space", "text": " \t"}`). This has been left out from this
  example for the sake of simplicity.

## API

### parse(sql: string, options: ParserOptions): Program

Parses SQL string and returns the CST tree. Takes the following options:

- **dialect**: `'sqlite' | 'bigquery' | 'mysql' | 'mariadb' | 'postgresql'` The SQL dialect to parse **(required)**.
- **includeRange**: `boolean` When enabled adds `range: [number, number]` field to all CST nodes,
  which contains the start and end locations of the node.
- **includeComments**: `boolean` When enabled adds `leading: Whitespace[]` and/or `trailing: Whitespace[]`
  to nodes which are preceded or followed by comments.
- **includeNewlines**: `boolean` Like `includeComments`, but includes newlines info to the same fields.
- **includeSpaces**: `boolean` Like `includeComments`, but includes horizontal whitespace info to the same fields.
- **paramTypes**: `` ("?" | "?nr" | "$nr" | ":name" | "$name" | "@name" | "`@name`")[] ``
  Determines the types of bound parameters supported by the parser.
  By default a query like `SELECT * FROM tbl WHERE id = ?` will result in parse error.
  To fix it, use `paramTypes: ["?"]` config option.
- **filename**: `string` Name of the SQL file. This is only used for error-reporting.

When parsing fails with syntax error, it throws `FormattedSyntaxError` which contains a message like:

```
Syntax Error: Unexpected "WHERE"
Was expecting to see: "!", "$", "(", "-", ":", "?", "@", "CASE", ...
--> my_db.sql:2:33
  |
2 | SELECT * FROM my_table ORDER BY WHERE
  |                                 ^
```

### show(cst: Node): string

Converts CST back to string.

Important caveat: the CST has to contain whitespace data, meaning,
it was generated with `includeComments`, `includeNewlines` and `includeSpaces` options enabled.

For any valid SQL the following assertion will always hold:

```js
const opts = {
  dialect: "sqlite",
  includeComments: true,
  includeNewlines: true,
  includeSpaces: true,
};

show(parse(sql, opts)) === sql; // always true
```

### cstVisitor(map: VisitorMap): (node: Node) => SKIP | void

Generates a function that walks through the whole CST tree and calls
a function in `map` whenever it encounters a node with that type.

For example the following code checks that all table and column aliases
use the explicit `AS` keyword:

```js
const checkAliases = cstVisitor({
  alias: (node) => {
    if (!node.asKw) {
      throw new Error("All alias definitions must use AS keyword!");
    }
  },
});
checkAliases(cst);
```

You can return `VisitorAction.SKIP` to avoid visiting all child nodes of a specific node:

```js
let topLevelSelects = 0;
const countTopLevelSelects = cstVisitor({
  select_stmt: (node) => {
    topLevelSelects++;
    return VisitorAction.SKIP;
  },
});
countTopLevelSelects(cst);
```

### cstTransformer\<T>(map: TransformMap\<T>): (node: Node) => T

Transforms the whole CST into some other type `T`. The `map` object
should contain an entry for each of the CST node types it expects to
encounter (this generally means all of them).

For example, the following implements a `toString()` function that
serializes very basic SQL queries like `SELECT 1, 2, 3 + 4`:

```js
const toString = cstTransformer({
  program: (node) => node.statements.map(toString).join(";"),
  select_statement: (node) => node.clauses.map(toString).join(" "),
  select_clause: (node) => "SELECT " + node.columns.map(toString).join(", "),
  binary_expr: (node) =>
    toString(node.left) + " " + node.operator + " " + toString(node.right),
  number_literal: (node) => node.text,
});
```

The builtin `show()` function is implemented as such a transform.

### xKeywords: Record\<string, boolean>

Additionally the parser exports lists of **reserved keywords** for each supported SQL dialect:
`sqliteKeywords`, `bigqueryKeywords`, `mysqlKeywords`, `mariadbKeywords`, `postgresqlKeywords`.
These are simple JavaScript objects, useful for doing lookups:

```js
export const sqliteKeywords = {
  ABORT: true,
  ACTION: true,
  ADD: true,
  ...
};
```

## Development

`yarn generate` will generate parser.

The testsuite contains two kinds of tests:

- tests applicable for all dialects
- tests applicable for only some specific dialects

When running the testsuite one always needs to pick a dialect.
For example `yarn test:sqlite` or `yarn test:mysql`.
Running one of these commands will run the testsuite against the parser
of that dialect. It will execute all the generic tests plus tests
applicable for that dialect.

`yarn test` will execute the testsuite for each supported dialect,
covering all the possible combinations.

### During development

Start the parser-generator watch process in one terminal:

```
yarn watch:generate
```

and the tests watch process in another terminal:

```
yarn test:sqlite --watch
```

Note that `yarn test --watch` doesn't work.
A separate watch process needs to be started manually for each dialect.

## Acknowledgements

This started as a fork of [node-sql-parser][],
which is based on [@flora/sql-parser][],
which in turn was extracted from Alibaba's [nquery][] module.

There's very little left of the original code though.

[node-sql-parser]: https://github.com/taozhi8833998/node-sql-parser
[@flora/sql-parser]: https://github.com/florajs/sql-parser
[nquery]: https://github.com/alibaba/nquery
[sql explorer]: https://nene.github.io/sql-explorer/
