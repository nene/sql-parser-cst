import { dialect, parse, testWc } from "../test_utils";

describe("NULL", () => {
  dialect(["plpgsql"], () => {
    it("supports NULL statement", () => {
      testWc(`NULL`);
    });

    it("supports NULL statement in context", () => {
      testWc(`
        IF TRUE THEN
          NULL;
        END IF
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery", "postgresql", "sqlite"], () => {
    it("does not support NULL statement", () => {
      expect(() => parse("NULL")).toThrow();
    });
  });
});
