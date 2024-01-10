import { dialect, testExpr } from "../test_utils";

describe("builtin functions", () => {
  ["avg", "count", "group_concat", "max", "min", "string_agg", "sum", "total"].forEach((func) => {
    it(`supports aggregate function: ${func}`, () => {
      testExpr(`${func}()`);
    });
  });

  dialect("sqlite", () => {
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
  });
});
