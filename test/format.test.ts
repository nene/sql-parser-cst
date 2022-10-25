import { layout } from "../src/format";
import { parse } from "./test_utils";

describe("format", () => {
  function testLayout(sql: string) {
    const cst = parse(sql, { preserveComments: true, preserveNewlines: true });
    return layout(cst);
  }

  it("computes layout", () => {
    expect(testLayout("SELECT 1, 2, 3")).toEqual([
      [
        [
          { layout: "line", items: ["SELECT"] },
          {
            layout: "indent",
            items: [
              { layout: "line", items: ["1", ","] },
              { layout: "line", items: ["2", ","] },
              { layout: "line", items: ["3"] },
            ],
          },
        ],
      ],
    ]);
  });
});
