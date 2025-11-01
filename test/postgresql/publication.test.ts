import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("PUBLICATION", () => {
  dialect("postgresql", () => {
    describe("CREATE PUBLICATION", () => {
      it("supports CREATE PUBLICATION", () => {
        testWc(`CREATE PUBLICATION foo`);
      });
    });

    describe("DROP PUBLICATION", () => {
      it("supports DROP PUBLICATION", () => {
        testWc(`DROP PUBLICATION foo`);
      });

      it("supports multiple publications", () => {
        testWc(`DROP PUBLICATION foo, bar, baz`);
      });

      it("supports IF EXISTS", () => {
        testWc(`DROP PUBLICATION IF EXISTS foo`);
      });

      it("supports CASCADE and RESTRICT", () => {
        testWc(`DROP PUBLICATION foo CASCADE`);
        testWc(`DROP PUBLICATION foo RESTRICT`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE PUBLICATION", () => {
      expect(() => parse("CREATE PUBLICATION foo")).toThrowError();
    });
  });
});
