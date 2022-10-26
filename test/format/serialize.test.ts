import { serialize } from "../../src/format/serialize";
import dedent from "dedent-js";

describe("format: serialize()", () => {
  it("serializes array of lines", () => {
    expect(
      serialize([
        { layout: "line", items: ["hello"] },
        { layout: "line", indent: 1, items: ["my"] },
        { layout: "line", indent: 1, items: ["world"] },
      ])
    ).toBe(dedent`
      hello
        my
        world
    `);
  });
});
