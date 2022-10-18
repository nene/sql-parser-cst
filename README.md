# SQL Parser CST

SQL Parser which produces a **Concrete Syntax Tree** (CST).

Unlike a more usual parser which produces an Abstract Syntax Tree (AST),
the goal of this parser is to preserve all the syntax elements present
in the parsed source code, with the goal of being able to re-create
this source code as close to the original as possible.

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
- case of keywords (e.g. whether `AS` or `as` was written)
- whether an identifier was quoted or not (and with what kind of quotes)
- whether an expression is wrapped in parenthesis or not.

In contrast, this CST parses produces the following concrete syntax tree,
which preserves all this information:

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
      "leadingComments": [
        { "type": "line_comment", "text": "-- use important table" }
      ]
    }
  ],
  "leadingComments": [{ "type": "block_comment", "text": "/* My query */" }]
}
```

Note the following conventions:

- All keywords are preserved in `type: keyword` nodes, which are usually
  stored in fields named like `someNameKw`.
- Each node can have `leadingComments` and `trailingComments` fields,
  which store comments immediately before or after that node.
- Parenthesis is represented by separate `type: paren_expr` node.
- The original source code representation of strings, identifiers, keywords, etc
  is preserved in `text` fields.

## Acknowledgements

This started as a fork of [node-sql-parser][],
which is based on [@flora/sql-parser][],
which in turn was extracted from Alibaba's [nquery][] module.

There's very little left of the original code though.

[node-sql-parser]: https://github.com/taozhi8833998/node-sql-parser
[@flora/sql-parser]: https://github.com/florajs/sql-parser
[nquery]: https://github.com/alibaba/nquery
