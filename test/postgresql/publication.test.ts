import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("PUBLICATION", () => {
  dialect("postgresql", () => {
    describe("CREATE PUBLICATION", () => {
      it("supports CREATE PUBLICATION", () => {
        testWc(`CREATE PUBLICATION foo`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE PUBLICATION", () => {
      expect(() => parse("CREATE PUBLICATION foo")).toThrowError();
    });
  });
});
