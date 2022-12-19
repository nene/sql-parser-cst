# SQL Parser CST [![npm version](https://img.shields.io/npm/v/sql-parser-cst)](https://www.npmjs.com/package/sql-parser-cst) ![example workflow](https://github.com/nene/sql-parser-cst/actions/workflows/build.yml/badge.svg)

SQL Parser which produces a **Concrete Syntax Tree** (CST).

Unlike a more usual parser which produces an Abstract Syntax Tree (AST),
this parser preserves all the syntax elements present in the parsed source code,
with the goal of being able to re-create the exact original source code.

**Try it live in [AstExplorer][].**

## Features

- Detailed TypeScript types for the syntax tree
- Unified syntax tree for multiple SQL dialects
- Includes source code location data for all nodes
- Includes comments in the syntax tree
- Helpful error messages
- Fast

Supports the following SQL dialects:

- **SQLite** - full support.
- **BigQuery** - full support.
- **MySQL** - experimental
  (see [#5](https://github.com/nene/sql-parser-cst/issues/5)
  and [#7](https://github.com/nene/sql-parser-cst/issues/7) for implementation progress).

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
  preserveSpaces: true, // Adds spaces/tabs
  preserveNewlines: true, // Adds newlines
  preserveComments: true, // Adds comments
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
    { "type": "empty_stmt" }
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
- Trailing semicolon is represented by `type: empty_stmt` node in the end.
- The original source code representation of strings, identifiers, keywords, etc
  is preserved in `text` fields.
- Each node can have `leading` and `trailing` fields,
  which store comments and newlines immediately before or after that node.
  These fields will also contain information about regular spaces/tabs
  (e.g. `{"type": "space", "text": " \t"}`). This has been left out from this
  example for the sake of simplicity.

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
[astexplorer]: https://astexplorer.net/#/gist/9636e48608a7c89707c5b345100de5b2/9331a011294bd03acc56cbe2d9ae9e60fa7dc8e6
