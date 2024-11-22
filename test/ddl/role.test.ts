import { dialect, notDialect, testWc } from "../test_utils";

describe("role", () => {
  dialect("postgresql", () => {
    describe("CREATE ROLE", () => {
      it("supports plain CREATE ROLE name", () => {
        testWc("CREATE ROLE my_role");
        testWc("CREATE TYPE my_schema.my_role");
      });

      [
        "SUPERUSER",
        "NOSUPERUSER",
        "CREATEDB",
        "NOCREATEDB",
        "CREATEROLE",
        "NOCREATEROLE",
        "INHERIT",
        "NOINHERIT",
        "LOGIN",
        "NOLOGIN",
        "REPLICATION",
        "NOREPLICATION",
        "BYPASSRLS",
        "NOBYPASSRLS",
        "CONNECTION LIMIT 5",
        "PASSWORD 'mypass123'",
        "ENCRYPTED PASSWORD 'mypass123'",
        "PASSWORD NULL",
        "VALID UNTIL '2021-01-01'",
        "IN ROLE my_role",
        "IN ROLE foo, bar, baz",
        "ROLE my_role",
        "ROLE foo, bar, baz",
        "ADMIN my_role",
        "ADMIN foo, bar, baz",
        "SYSID 25",
      ].forEach((keyword) => {
        it(`supports CREATE ROLE ... [WITH] ${keyword}`, () => {
          testWc(`CREATE ROLE my_role WITH ${keyword}`);
          testWc(`CREATE ROLE my_role ${keyword}`);
        });
      });

      it(`supports multiple options`, () => {
        testWc(`CREATE ROLE my_role WITH LOGIN CREATEDB`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE ROLE", () => {
      expect(() => test("CREATE ROLE foo WITH LOGIN")).toThrowError();
    });
  });
});
