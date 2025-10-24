import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("SET", () => {
  dialect("postgresql", () => {
    it("supports SET parameter = value", () => {
      testWc("SET foo = 10");
      testWc("SET foo = TRUE");
      testWc("SET foo = NULL");
      testWc("SET foo = 'hello'");
      testWc("SET foo = some_identifier");
      testWc("SET foo = DEFAULT");
      testWc("SET foo = 1, 2, 3");
    });

    it("supports SET parameter TO value", () => {
      testWc("SET foo TO 10");
    });

    it("supports [LOCAL | SESSION] modifier", () => {
      testWc("SET LOCAL foo = 10");
      testWc("SET SESSION foo = 10");
    });

    it("supports SET TIME ZONE", () => {
      testWc("SET TIME ZONE 'UTC'");
      testWc("SET SESSION TIME ZONE -5");
      testWc("SET LOCAL TIME ZONE DEFAULT");
      testWc("SET LOCAL TIME ZONE LOCAL");
      testWc("SET TIME ZONE INTERVAL '-08:00'");
    });
  });

  notDialect("postgresql", () => {
    it("does not support SET .. TO statement", () => {
      expect(parse("SET x TO 10")).toBe(true);
    });
  });
});
