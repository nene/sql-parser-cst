import { dialect, testExpr } from "../test_utils";

describe("builtin functions", () => {
  // https://www.sqlite.org/lang_aggfunc.html
  ["avg", "count", "group_concat", "max", "min", "string_agg", "sum", "total"].forEach((func) => {
    it(`supports aggregate function: ${func}`, () => {
      testExpr(`${func}()`);
    });
  });

  dialect("sqlite", () => {
    // https://www.sqlite.org/lang_corefunc.html
    [
      "abs",
      "changes",
      "char",
      "coalesce",
      "concat",
      "concat_ws",
      "format",
      "glob",
      "hex",
      "ifnull",
      "iif",
      "instr",
      "last_insert_rowid",
      "length",
      "like",
      "likelihood",
      "likely",
      "load_extension",
      "lower",
      "ltrim",
      "max",
      "min",
      "nullif",
      "octet_length",
      "printf",
      "quote",
      "random",
      "randomblob",
      "replace",
      "round",
      "rtrim",
      "sign",
      "soundex",
      "sqlite_compileoption_get",
      "sqlite_compileoption_used",
      "sqlite_offset",
      "sqlite_source_id",
      "sqlite_version",
      "substr",
      "substring",
      "total_changes",
      "trim",
      "typeof",
      "unhex",
      "unicode",
      "unlikely",
      "upper",
      "zeroblob",
    ].forEach((func) => {
      it(`supports built-in function: ${func}`, () => {
        testExpr(`${func}()`);
      });
    });

    // https://www.sqlite.org/lang_datefunc.html
    ["date", "time", "datetime", "julianday", "unixepoch", "strftime", "timediff"].forEach(
      (func) => {
        it(`supports built-in date-time function: ${func}`, () => {
          testExpr(`${func}()`);
        });
      }
    );

    // https://www.sqlite.org/lang_mathfunc.html
    [
      "acos",
      "acosh",
      "asin",
      "asinh",
      "atan",
      "atan2",
      "atanh",
      "ceil",
      "celiling",
      "cos",
      "cosh",
      "degrees",
      "exp",
      "floor",
      "ln",
      "log",
      "log10",
      "log2",
      "mod",
      "pi",
      "pow",
      "power",
      "radians",
      "sin",
      "sinh",
      "sqrt",
      "tan",
      "tanh",
      "trunc",
    ].forEach((func) => {
      it(`supports built-in math function: ${func}`, () => {
        testExpr(`${func}()`);
      });
    });

    // https://www.sqlite.org/json1.html
    // There are bunch of other json_* functions, but they are unlikely to trip up the parser.
    ["json"].forEach((func) => {
      it(`supports built-in json function: ${func}`, () => {
        testExpr(`${func}()`);
      });
    });
  });
});
