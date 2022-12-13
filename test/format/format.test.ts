import { format } from "../../src/format/format";
import { parse } from "../test_utils";
import dedent from "dedent-js";

describe("format()", () => {
  function testFormat(sql: string) {
    return format(parse(sql, { preserveComments: true, preserveNewlines: true }));
  }

  it("formats basic SELECT", () => {
    expect(
      testFormat(
        `/* some comment */
        SELECT col1 + 3 /* inline */ AS c1, col2 -- trailing comment
        -- line comment
        FROM db.tbl t`
      )
    ).toBe(dedent`
      /* some comment */
      SELECT
        col1 + 3/* inline */ AS c1,
        col2 -- trailing comment
      -- line comment
      FROM
        db.tbl t
    `);
  });
});
