import { format } from "../../src/parser";
import { parse } from "../test_utils";
import dedent from "dedent-js";

describe("format()", () => {
  function testFormat(sql: string) {
    return format(parse(sql, { preserveComments: true, preserveNewlines: true }));
  }

  it("formats basic SELECT", () => {
    expect(testFormat("SELECT 1, 2, 3")).toBe(dedent`
      SELECT
        1,
        2,
        3
    `);
  });
});
