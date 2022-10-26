import { serialize } from "../../src/format/serialize";

describe("format: serialize()", () => {
  it("serializes array of lines", () => {
    expect(
      serialize([
        { layout: "line", items: ["hello"] },
        { layout: "line", indent: 1, items: ["my"] },
        { layout: "line", indent: 1, items: ["world"] },
      ])
    ).toBe("hello\n  my\n  world");
  });
});
