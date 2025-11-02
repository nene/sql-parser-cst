import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("PUBLICATION", () => {
  dialect("postgresql", () => {
    describe("CREATE PUBLICATION", () => {
      it("supports CREATE PUBLICATION", () => {
        testWc(`CREATE PUBLICATION foo`);
      });

      it("supports FOR ALL TABLES / SEQUENCES", () => {
        testWc(`CREATE PUBLICATION foo FOR ALL TABLES`);
        testWc(`CREATE PUBLICATION foo FOR ALL SEQUENCES`);
        testWc(`CREATE PUBLICATION foo FOR ALL TABLES, ALL SEQUENCES`);
      });

      it("supports FOR TABLE", () => {
        testWc(`CREATE PUBLICATION foo FOR TABLE schm1.tbl1`);
        testWc(`CREATE PUBLICATION foo FOR TABLE ONLY tbl1`);
        testWc(`CREATE PUBLICATION foo FOR TABLE tbl1 *`);
      });

      it("supports FOR TABLE with columns", () => {
        testWc(`CREATE PUBLICATION foo FOR TABLE tbl1 (col1, col2)`);
      });

      it("supports FOR TABLE with WHERE clause", () => {
        testWc(`CREATE PUBLICATION foo FOR TABLE tbl1 WHERE (x > 1)`);
        testWc(`CREATE PUBLICATION foo FOR TABLE tbl1 (col1) WHERE (1)`);
      });

      it("supports FOR TABLES IN SCHEMA", () => {
        testWc(`CREATE PUBLICATION foo FOR TABLES IN SCHEMA schm1`);
        testWc(`CREATE PUBLICATION foo FOR TABLES IN SCHEMA CURRENT_SCHEMA`);
      });

      it("supports multiple TABLE-s in FOR clause", () => {
        testWc(
          `CREATE PUBLICATION foo FOR TABLE tbl1, TABLE tbl2 (col1) WHERE (1), TABLES IN SCHEMA blah`
        );
      });
    });

    describe("ALTER PUBLICATION", () => {
      it("supports OWNER TO", () => {
        testWc(`ALTER PUBLICATION foo OWNER TO johnny`);
        testWc(`ALTER PUBLICATION foo OWNER TO CURRENT_USER`);
        testWc(`ALTER PUBLICATION foo OWNER TO CURRENT_ROLE`);
        testWc(`ALTER PUBLICATION foo OWNER TO SESSION_USER`);
      });

      it("supports RENAME TO", () => {
        testWc(`ALTER PUBLICATION foo RENAME TO bar`);
      });

      it("supports SET (options...)", () => {
        testWc(`ALTER PUBLICATION foo SET (publish = 'true', foo = 'bar')`);
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
