# SQL Parser CST

SQL Parser which produces a **Concrete Syntax Tree** (CST).

Unlike a more usual parser which produces an Abstract Syntax Tree (AST),
this parser preserves all the syntax elements present in the parsed source code,
with the goal of being able to re-create the exact original source code.

## Usage

```ts
import { parse, show } from "sql-parser-cst";

const cst = parse("SELECT * FROM my_table", {
  dialect: "sqlite",
  // These are optional:
  preserveSpaces: true, // Adds spaces/tabs
  preserveNewlines: true, // Adds newlines
  preserveComments: true, // Adds comments
  includeRange: true, // Adds source code location data
});

// Change table name
cst.statements[0].clauses[1].tables[0].table.text = "your_table";

// Serialize back to SQL
show(cst); // --> SELECT * FROM your_table
```

## AST versus CST-parsers

For example, given the following SQL:

```sql
/* My query */
SELECT ("first_name" || ' jr.') as fname
-- use important table
FROM persons
```

An AST-parser might parse this to the following abstract syntax tree:

```json
{
  "type": "select_statement",
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

In contrast, this CST parser produces the following concrete syntax tree,
which preserves all of this information:

```json
{
  "type": "select_statement",
  "clauses": [
    {
      "type": "select_clause",
      "selectKw": { "type": "keyword", "text": "SELECT" },
      "columns": [
        {
          "type": "alias",
          "expr": {
            "type": "paren_expr",
            "expr": {
              "type": "binary_expr",
              "left": {
                "type": "column_ref",
                "column": { "type": "identifier", "text": "\"first_name\"" }
              },
              "operator": "||",
              "right": { "type": "string", "text": "' jr.'" }
            }
          },
          "asKw": { "type": "keyword", "text": "as" },
          "alias": { "type": "identifier", "text": "fname" }
        }
      ]
    },
    {
      "type": "from_clause",
      "fromKw": { "type": "keyword", "text": "FROM" },
      "tables": [
        {
          "type": "table_ref",
          "table": { "type": "keyword", "text": "persons" }
        }
      ],
      "leading": [
        { "type": "newline", "text": "\n" },
        { "type": "line_comment", "text": "-- use important table" },
        { "type": "newline", "text": "\n" }
      ]
    }
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
- The original source code representation of strings, identifiers, keywords, etc
  is preserved in `text` fields.
- Each node can have `leading` and `trailing` fields,
  which store comments and newlines immediately before or after that node.
  These fields will also contain information about regular spaces/tabs
  (e.g. `{"type": "space", "text": " \t"}`). This has been left out from this
  example for the sake of simplicity.

## Acknowledgements

This started as a fork of [node-sql-parser][],
which is based on [@flora/sql-parser][],
which in turn was extracted from Alibaba's [nquery][] module.

There's very little left of the original code though.

[node-sql-parser]: https://github.com/taozhi8833998/node-sql-parser
[@flora/sql-parser]: https://github.com/florajs/sql-parser
[nquery]: https://github.com/alibaba/nquery
