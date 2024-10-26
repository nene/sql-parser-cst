import { dialect, notDialect, testWc } from "../test_utils";

describe("type", () => {
  dialect("postgresql", () => {
    describe("CREATE TYPE", () => {
      it("supports AS (name TYPE, ...)", () => {
        testWc("CREATE TYPE my_type AS (foo INT, bar TEXT)");
        testWc(`CREATE TYPE my_type AS (foo INT COLLATE "C")`);
        testWc(`CREATE TYPE my_type AS ()`);
      });

      it("supports AS ENUM", () => {
        testWc("CREATE TYPE my_type AS ENUM ('foo', 'bar')");
        testWc("CREATE TYPE my_schema.my_type AS ENUM ('foo', 'bar')");
        testWc("CREATE TYPE my_enum AS ENUM ()");
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE TYPE", () => {
      expect(() => test("CREATE TYPE my_type AS ENUM ('foo', 'bar')")).toThrowError();
    });
  });
});
