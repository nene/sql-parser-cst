import { dialect, notDialect, testWc } from "../test_utils";

describe("type", () => {
  dialect("postgresql", () => {
    describe("CREATE TYPE", () => {
      it("supports CREATE TYPE without definition", () => {
        testWc("CREATE TYPE my_type");
        testWc("CREATE TYPE my_schema.my_type");
      });

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

    describe("ALTER TYPE", () => {
      it("supports RENAME TO", () => {
        testWc("ALTER TYPE my_type RENAME TO new_type");
        testWc("ALTER TYPE my_schema.my_type RENAME TO new_type");
      });

      it("supports OWNER TO", () => {
        testWc("ALTER TYPE my_type OWNER TO new_owner");
      });

      it("supports SET SCHEMA", () => {
        testWc("ALTER TYPE my_type SET SCHEMA new_schema");
      });

      it("supports ADD VALUE", () => {
        testWc("ALTER TYPE my_enum ADD VALUE 'apple'");
        testWc("ALTER TYPE my_enum ADD VALUE IF NOT EXISTS 'apple'");
      });

      it("supports ADD VALUE with position", () => {
        testWc("ALTER TYPE my_enum ADD VALUE 'apple' BEFORE 'banana'");
        testWc("ALTER TYPE my_enum ADD VALUE 'pear' AFTER 'melon'");
      });

      it("supports RENAME VALUE", () => {
        testWc("ALTER TYPE my_enum RENAME VALUE 'apple' TO 'orange'");
      });

      it("supports RENAME ATTRIBUTE", () => {
        testWc("ALTER TYPE address RENAME ATTRIBUTE city TO town");
        testWc("ALTER TYPE address RENAME ATTRIBUTE city TO town CASCADE");
        testWc("ALTER TYPE address RENAME ATTRIBUTE city TO town RESTRICT");
      });
    });

    describe("DROP TYPE", () => {
      it("supports DROP TYPE", () => {
        testWc("DROP TYPE my_type");
        testWc("DROP TYPE my_schema.my_type");
        testWc("DROP TYPE foo, bar, baz");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP TYPE IF EXISTS my_type");
      });

      it("supports CASCADE|RESTRICT", () => {
        testWc("DROP TYPE my_type CASCADE");
        testWc("DROP TYPE my_type RESTRICT");
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE TYPE", () => {
      expect(() => test("CREATE TYPE address AS (street TEXT, house INT)")).toThrowError();
    });
    it("does not support DROP TYPE", () => {
      expect(() => test("DROP TYPE address")).toThrowError();
    });
  });
});
