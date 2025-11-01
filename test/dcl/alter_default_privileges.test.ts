import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("ALTER DEFAULT PRIVILEGES", () => {
  dialect("postgresql", () => {
    const privilegesOnResources: [string[], string][] = [
      [
        ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER", "MAINTAIN"],
        "TABLES",
      ],
      [["USAGE", "SELECT", "UPDATE"], "SEQUENCES"],
      [["EXECUTE"], "FUNCTIONS"],
      [["EXECUTE"], "ROUTINES"],
      [["USAGE"], "TYPES"],
      [["USAGE", "CREATE"], "SCHEMAS"],
      [["SELECT", "UPDATE"], "LARGE OBJECTS"],
    ];

    privilegesOnResources.forEach(([privileges, resources]) => {
      describe(`grant on ${resources}`, () => {
        it(`supports GRANT ALL`, () => {
          testWc(`ALTER DEFAULT PRIVILEGES GRANT ALL ON ${resources} TO john`);
          testWc(`ALTER DEFAULT PRIVILEGES GRANT ALL PRIVILEGES ON ${resources} TO john`);
        });

        it(`supports GRANT on multiple priveleges`, () => {
          testWc(`ALTER DEFAULT PRIVILEGES GRANT ${privileges.join(", ")} ON ${resources} TO john`);
        });

        privileges.forEach((privilege) => {
          it(`supports GRANT ${privilege} ON ${resources} TO GROUP`, () => {
            testWc(
              `ALTER DEFAULT PRIVILEGES GRANT ${privilege} ON ${resources} TO GROUP moderator`
            );
          });

          it(`supports GRANT ${privilege} ON ${resources} TO role`, () => {
            testWc(`ALTER DEFAULT PRIVILEGES GRANT ${privilege} ON ${resources} TO moderator`);
          });

          it(`supports GRANT ${privilege} ON ${resources} TO PUBLIC`, () => {
            testWc(`ALTER DEFAULT PRIVILEGES GRANT ${privilege} ON ${resources} TO PUBLIC`);
          });
        });

        it(`supports WITH GRANT OPTION`, () => {
          testWc(`ALTER DEFAULT PRIVILEGES GRANT ALL ON ${resources} TO john WITH GRANT OPTION`);
        });
      });

      describe(`revoke on ${resources}`, () => {
        it(`supports REVOKE ALL`, () => {
          testWc(`ALTER DEFAULT PRIVILEGES REVOKE ALL ON ${resources} FROM john`);
          testWc(`ALTER DEFAULT PRIVILEGES REVOKE ALL PRIVILEGES ON ${resources} FROM john`);
        });

        it(`supports REVOKE on multiple priveleges`, () => {
          testWc(
            `ALTER DEFAULT PRIVILEGES REVOKE ${privileges.join(", ")} ON ${resources} FROM john`
          );
        });

        privileges.forEach((privilege) => {
          it(`supports REVOKE ${privilege} ON ${resources} FROM GROUP`, () => {
            testWc(
              `ALTER DEFAULT PRIVILEGES REVOKE ${privilege} ON ${resources} FROM GROUP moderator`
            );
          });

          it(`supports REVOKE ${privilege} ON ${resources} FROM role`, () => {
            testWc(`ALTER DEFAULT PRIVILEGES REVOKE ${privilege} ON ${resources} FROM moderator`);
          });

          it(`supports REVOKE ${privilege} ON ${resources} FROM PUBLIC`, () => {
            testWc(`ALTER DEFAULT PRIVILEGES REVOKE ${privilege} ON ${resources} FROM PUBLIC`);
          });
        });

        it(`supports GRANT OPTION FOR`, () => {
          testWc(`ALTER DEFAULT PRIVILEGES REVOKE GRANT OPTION FOR ALL ON ${resources} FROM john`);
        });

        it(`supports CASCADE/RESTRICT`, () => {
          testWc(`ALTER DEFAULT PRIVILEGES REVOKE ALL ON ${resources} FROM john CASCADE`);
          testWc(`ALTER DEFAULT PRIVILEGES REVOKE ALL ON ${resources} FROM john RESTRICT`);
        });
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support ALTER DEFAULT PRIVILEGES", () => {
      expect(() => parse("ALTER DEFAULT PRIVILEGES GRANT SELECT ON TABLES TO john")).toThrowError();
    });
  });
});
