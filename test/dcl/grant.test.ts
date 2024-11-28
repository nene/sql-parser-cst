import { dialect, includeAll, parse, testWc } from "../test_utils";

describe("GRANT", () => {
  dialect("bigquery", () => {
    it("supports granting single role to single user", () => {
      testWc("GRANT `roles/bigquery.dataViewer` ON TABLE foo TO 'user:tom@example.com'");
    });

    it("supports granting multiple roles to multiple users", () => {
      testWc(`
        GRANT \`roles/bigquery.dataViewer\` , \`roles/bigquery.rowAccessPolicies.create\`
        ON TABLE my_proj.my_schema.my_table
        TO 'user:tom@example.com' , "user:sara@example.com"
      `);
    });

    ["TABLE", "SCHEMA", "VIEW", "EXTERNAL TABLE"].forEach((type) => {
      it(`supports ${type} resource type`, () => {
        testWc(`GRANT \`roles/bigquery.dataViewer\` ON ${type} foo TO 'user:tom@example.com'`);
      });
    });
  });

  dialect("postgresql", () => {
    [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "TRUNCATE",
      "REFERENCES",
      "TRIGGER",
      "MAINTAIN",
    ].forEach((privilege) => {
      it(`supports GRANT ${privilege} ON TABLE ... TO role`, () => {
        testWc(`GRANT ${privilege} ON TABLE schm.tbl TO john_doe`);
      });
    });

    it(`supports granting multiple privileges`, () => {
      testWc(`GRANT SELECT, UPDATE, INSERT ON TABLE tbl TO john`);
    });

    it(`supports GRANT ALL PRIVILEGES ON TABLE ... TO role`, () => {
      testWc(`GRANT ALL ON TABLE schm.tbl TO john_doe`);
      testWc(`GRANT ALL PRIVILEGES ON TABLE schm.tbl TO john_doe`);
    });

    it(`supports ALL TABLES IN SCHEMA`, () => {
      testWc(`GRANT INSERT ON ALL TABLES IN SCHEMA my_schema TO peter_pan`);
      testWc(`GRANT INSERT ON ALL TABLES IN SCHEMA schm1, schm2 TO peter_pan`);
    });

    it(`supports multiple tables and roles`, () => {
      testWc(`GRANT UPDATE ON TABLE tbl1, tbl2, tbl3 TO john_doe, mary_jane`);
    });

    it(`supports optional TABLE keyword`, () => {
      testWc(`GRANT DELETE ON tbl TO johnny`);
    });

    ["SELECT", "INSERT", "UPDATE", "REFERENCES"].forEach((privilege) => {
      it(`supports GRANT ${privilege} (cols) ON TABLE ... TO role`, () => {
        testWc(`GRANT ${privilege} (col1, col2) ON TABLE my_tbl TO john`);
      });
    });

    it(`supports granting multiple privileges per column`, () => {
      testWc(`GRANT SELECT (col1, col2), UPDATE (col1, col2) ON TABLE my_tbl TO john`);
    });

    it(`supports granting all privileges on columns`, () => {
      testWc(`GRANT ALL (col1, col2) ON TABLE my_tbl TO john`);
      testWc(`GRANT ALL PRIVILEGES (col1) ON TABLE my_tbl TO john`);
    });

    ["USAGE", "SELECT", "UPDATE"].forEach((privilege) => {
      it(`supports GRANT ${privilege} ON SEQUENCE ... TO role`, () => {
        testWc(`GRANT ${privilege} ON SEQUENCE schm.seq1, seq2 TO john_doe`);
      });
    });

    it(`supports ALL SEQUENCES IN SCHEMA`, () => {
      testWc(`GRANT USAGE ON ALL SEQUENCES IN SCHEMA my_schema TO peter_pan`);
      testWc(`GRANT USAGE, UPDATE ON ALL SEQUENCES IN SCHEMA schm1, schm2 TO peter_pan`);
    });

    ["CREATE", "CONNECT", "TEMPORARY", "TEMP"].forEach((privilege) => {
      it(`supports GRANT ${privilege} ON DATABASE ... TO role`, () => {
        testWc(`GRANT ${privilege} ON DATABASE db1, db2 TO john_doe`);
      });
    });

    it(`supports GRANT USAGE ON DOMAIN ... TO role`, () => {
      testWc(`GRANT USAGE ON DOMAIN schm.dom1, dom2 TO john_doe`);
    });

    it(`supports GRANT USAGE ON FOREIGN DATA WRAPPER ... TO role`, () => {
      testWc(`GRANT USAGE ON FOREIGN DATA WRAPPER wrap1, wrap2 TO john_doe`);
    });

    it(`supports GRANT USAGE ON FOREIGN SERVER ... TO role`, () => {
      testWc(`GRANT USAGE ON FOREIGN SERVER serv1, serv2 TO john_doe`);
    });

    ["FUNCTION", "PROCEDURE", "ROUTINE"].forEach((functionKw) => {
      it(`supports GRANT EXECUTE ON ${functionKw} ... TO role`, () => {
        testWc(`GRANT EXECUTE ON ${functionKw} fibo, fobo TO john`);
        testWc(`GRANT EXECUTE ON ${functionKw} fn() TO john`);
        testWc(`GRANT EXECUTE ON ${functionKw} schm.fn (INT, FLOAT) TO john`);
        testWc(`GRANT EXECUTE ON ${functionKw} fn(a INT, b INT) TO john`);
        testWc(`GRANT EXECUTE ON ${functionKw} fn(IN a INT, OUT b INT, INOUT c INT) TO john`);
      });
    });

    ["FUNCTIONS", "PROCEDURES", "ROUTINES"].forEach((functionKw) => {
      it(`supports GRANT EXECUTE ON ALL ${functionKw} IN SCHEMA ... TO role`, () => {
        testWc(`GRANT EXECUTE ON ALL ${functionKw} IN SCHEMA my_schema TO john`);
        testWc(`GRANT EXECUTE ON ALL ${functionKw} IN SCHEMA schm1, schm2 TO john`);
      });
    });

    it(`supports GRANT USAGE ON LANGUAGE ... TO role`, () => {
      testWc(`GRANT USAGE ON LANGUAGE php, perl TO script_kiddie`);
    });

    ["SELECT", "UPDATE"].forEach((privilege) => {
      it(`supports GRANT ${privilege} ON LARGE OBJECT ... TO role`, () => {
        testWc(`GRANT ${privilege} ON LARGE OBJECT 128, 920 TO john_doe`);
      });
    });
    it(`supports GRANT ... ON LARGE OBJECT with parameter`, () => {
      testWc(`GRANT UPDATE ON LARGE OBJECT :oid TO john_doe`, {
        ...includeAll,
        paramTypes: [":name"],
      });
    });

    ["SET", "ALTER SYSTEM"].forEach((privilege) => {
      it(`supports GRANT ${privilege} ON PARAMETER ... TO role`, () => {
        testWc(`GRANT ${privilege} ON PARAMETER foo, bar TO john_doe`);
      });
    });

    ["CREATE", "USAGE"].forEach((privilege) => {
      it(`supports GRANT ${privilege} ON SCHEMA ... TO role`, () => {
        testWc(`GRANT ${privilege} ON SCHEMA foo, bar TO john_doe`);
      });
    });

    it(`supports GRANT CREATE ON TABLESPACE ... TO role`, () => {
      testWc(`GRANT CREATE ON TABLESPACE spc1, spc2 TO john_doe`);
    });

    it(`supports GRANT USAGE ON TYPE ... TO role`, () => {
      testWc(`GRANT USAGE ON TYPE schm.typ1, typ2 TO john_doe`);
    });

    it(`supports WITH GRANT OPTION clause`, () => {
      testWc(`GRANT DELETE ON tbl TO johnny WITH GRANT OPTION`);
    });

    it(`supports GRANTED BY clause`, () => {
      testWc(`GRANT DELETE ON tbl TO johnny GRANTED BY happy_admin`);
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support GRANT", () => {
      expect(() => parse("GRANT `role` ON TABLE foo TO 'user:blah'")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it.skip("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
