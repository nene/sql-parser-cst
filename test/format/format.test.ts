import { format } from "../../src/parser";
import { parse } from "../test_utils";
import dedent from "dedent-js";

describe("format()", () => {
  function testFormat(sql: string) {
    return format(parse(sql, { preserveComments: true, preserveNewlines: true }));
  }

  it("formats basic SELECT", () => {
    expect(testFormat("SELECT col1 + 3 AS c1, col2 FROM db.tbl t")).toBe(dedent`
      SELECT
        col1 + 3 AS c1,
        col2
      FROM
        db.tbl t
    `);
  });
});
