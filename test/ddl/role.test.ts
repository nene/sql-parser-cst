import { dialect, notDialect, testWc } from "../test_utils";

describe("role", () => {
  dialect("postgresql", () => {
    describe("CREATE ROLE", () => {
      it("supports plain CREATE ROLE name", () => {
        testWc("CREATE ROLE my_role");
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

    describe("ALTER ROLE", () => {
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
      ].forEach((keyword) => {
        it(`supports ALTER ROLE name [WITH] ${keyword}`, () => {
          testWc(`ALTER ROLE my_role WITH ${keyword}`);
          testWc(`ALTER ROLE my_role ${keyword}`);
        });
      });

      it(`supports multiple options`, () => {
        testWc(`ALTER ROLE my_role WITH LOGIN CREATEDB NOREPLICATION`);
      });

      it(`supports special role functions`, () => {
        testWc(`ALTER ROLE CURRENT_USER WITH SUPERUSER`);
        testWc(`ALTER ROLE CURRENT_ROLE WITH SUPERUSER`);
        testWc(`ALTER ROLE SESSION_USER WITH SUPERUSER`);
      });

      it(`supports RENAME TO`, () => {
        testWc(`ALTER ROLE my_role RENAME TO new_role`);
      });

      it(`supports SET parameter TO value`, () => {
        testWc(`ALTER ROLE my_role SET something TO 128`);
        testWc(`ALTER ROLE my_role SET client_min_messages = DEBUG`);
        testWc(`ALTER ROLE my_role SET my_option TO DEFAULT`);
        testWc(`ALTER ROLE my_role IN DATABASE foo SET something TO 128`);
        testWc(`ALTER ROLE ALL IN DATABASE foo SET something TO 128`);
      });

      it(`supports SET parameter FROM CURRENT`, () => {
        testWc(`ALTER ROLE my_role SET something FROM CURRENT`);
        testWc(`ALTER ROLE my_role IN DATABASE foo SET something FROM CURRENT`);
        testWc(`ALTER ROLE ALL IN DATABASE foo SET something FROM CURRENT`);
      });

      it(`supports RESET parameter`, () => {
        testWc(`ALTER ROLE my_role RESET something`);
        testWc(`ALTER ROLE my_role IN DATABASE foo RESET something`);
        testWc(`ALTER ROLE ALL IN DATABASE foo RESET something`);
      });

      it(`supports RESET ALL`, () => {
        testWc(`ALTER ROLE my_role RESET ALL`);
        testWc(`ALTER ROLE my_role IN DATABASE foo RESET ALL`);
        testWc(`ALTER ROLE ALL IN DATABASE foo RESET ALL`);
      });
    });

    describe("DROP ROLE", () => {
      it("supports plain DROP ROLE name", () => {
        testWc("DROP ROLE my_role");
      });

      it("supports IF EXISTS name", () => {
        testWc("DROP ROLE IF EXISTS my_role");
      });

      it("supports multiple names", () => {
        testWc("DROP ROLE my_role, foo, bar");
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE ROLE", () => {
      expect(() => test("CREATE ROLE foo WITH LOGIN")).toThrowError();
    });
  });
});
