import { dialect, notDialect, testWc } from "../test_utils";

describe("policy", () => {
  dialect("postgresql", () => {
    describe("CREATE POLICY", () => {
      it("supports CREATE POLICY .. ON ..", () => {
        testWc("CREATE POLICY foo ON my_table");
        testWc("CREATE POLICY foo ON my_schema.my_table");
      });

      it("supports PERMISSIVE/RESTRICTIVE", () => {
        testWc("CREATE POLICY foo ON my_table AS PERMISSIVE");
        testWc("CREATE POLICY foo ON my_table AS RESTRICTIVE");
      });

      ["ALL", "SELECT", "INSERT", "UPDATE", "DELETE"].forEach((command) => {
        it(`supports FOR ${command} clause`, () => {
          testWc(`CREATE POLICY foo ON my_table FOR ${command}`);
        });
      });

      it(`supports TO role clause`, () => {
        testWc(`CREATE POLICY foo ON my_table TO my_role`);
        testWc(`CREATE POLICY foo ON my_table TO PUBLIC`);
        testWc(`CREATE POLICY foo ON my_table TO CURRENT_USER`);
        testWc(`CREATE POLICY foo ON my_table TO CURRENT_ROLE`);
        testWc(`CREATE POLICY foo ON my_table TO SESSION_USER`);
        testWc(`CREATE POLICY foo ON my_table TO bar, baz, SESSION_USER`);
      });

      it(`supports USING () clause`, () => {
        testWc(`CREATE POLICY foo ON my_table USING (age > 10)`);
      });

      it(`supports WITH CHECK () clause`, () => {
        testWc(`CREATE POLICY foo ON my_table WITH CHECK (name <> '')`);
      });

      it("supports multiple clauses", () => {
        testWc(`
          CREATE POLICY johnny_is_admin ON company_user
          AS PERMISSIVE
          FOR SELECT
          TO johnny
          USING (is_admin)
          WITH CHECK (is_admin)
        `);
      });
    });

    describe("ALTER POLICY", () => {
      it("supports ALTER POLICY .. RENAME TO", () => {
        testWc("ALTER POLICY foo ON my_table RENAME TO bar");
        testWc("ALTER POLICY foo ON my_schema.my_table RENAME TO bar");
      });

      it("supports ALTER POLICY .. TO role", () => {
        testWc("ALTER POLICY foo ON my_table TO my_role");
        testWc("ALTER POLICY foo ON my_table TO PUBLIC");
        testWc("ALTER POLICY foo ON my_table TO CURRENT_USER");
        testWc("ALTER POLICY foo ON my_table TO CURRENT_ROLE");
        testWc("ALTER POLICY foo ON my_table TO SESSION_USER");
        testWc("ALTER POLICY foo ON my_table TO bar, baz, SESSION_USER");
      });

      it("supports ALTER POLICY .. USING ()", () => {
        testWc("ALTER POLICY foo ON my_table USING (age > 10)");
      });

      it("supports ALTER POLICY .. WITH CHECK ()", () => {
        testWc("ALTER POLICY foo ON my_table WITH CHECK (name <> '')");
      });

      it("supports combination of ALTER POLICY-s", () => {
        testWc(`
          ALTER POLICY foo ON my_table
          TO my_role
          USING (age > 10)
          WITH CHECK (FALSE)
        `);
      });
    });

    describe("DROP POLICY", () => {
      it("supports DROP POLICY .. ON ..", () => {
        testWc("DROP POLICY foo ON my_table");
        testWc("DROP POLICY foo ON my_schema.my_table");
      });

      it("supports IF EXISTS", () => {
        testWc("DROP POLICY IF EXISTS foo ON my_table");
      });

      it("supports CASCADE/RESTRICT", () => {
        testWc("DROP POLICY foo ON my_table CASCADE");
        testWc("DROP POLICY foo ON my_table RESTRICT");
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support CREATE POLICY", () => {
      expect(() => test("CREATE POLICY my_pol ON tbl")).toThrowError();
    });
  });
});
