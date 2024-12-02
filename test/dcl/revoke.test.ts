import { dialect, includeAll, parse, testWc } from "../test_utils";

describe("REVOKE", () => {
  dialect("bigquery", () => {
    it("supports revoking single role of a single user", () => {
      testWc("REVOKE `roles/bigquery.dataViewer` ON TABLE foo FROM 'user:tom@example.com'");
    });

    it("supports revoking multiple roles of multiple users", () => {
      testWc(`
        REVOKE \`roles/bigquery.dataViewer\` , \`roles/bigquery.rowAccessPolicies.create\`
        ON TABLE my_proj.my_schema.my_table
        FROM 'user:tom@example.com' , "user:sara@example.com"
      `);
    });

    ["TABLE", "SCHEMA", "VIEW", "EXTERNAL TABLE"].forEach((type) => {
      it(`supports ${type} resource type`, () => {
        testWc(`REVOKE \`roles/bigquery.dataViewer\` ON ${type} foo FROM 'user:tom@example.com'`);
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
      it(`supports REVOKE ${privilege} ON TABLE ... FROM role`, () => {
        testWc(`REVOKE ${privilege} ON TABLE schm.tbl FROM john_doe`);
      });
    });

    it(`supports revoking multiple privileges`, () => {
      testWc(`REVOKE SELECT, UPDATE, INSERT ON TABLE tbl FROM john`);
    });

    it(`supports REVOKE ALL PRIVILEGES ON TABLE ... FROM role`, () => {
      testWc(`REVOKE ALL ON TABLE schm.tbl FROM john_doe`);
      testWc(`REVOKE ALL PRIVILEGES ON TABLE schm.tbl FROM john_doe`);
    });

    it(`supports ALL TABLES IN SCHEMA`, () => {
      testWc(`REVOKE INSERT ON ALL TABLES IN SCHEMA my_schema FROM peter_pan`);
      testWc(`REVOKE INSERT ON ALL TABLES IN SCHEMA schm1, schm2 FROM peter_pan`);
    });

    it(`supports multiple tables and roles`, () => {
      testWc(`REVOKE UPDATE ON TABLE tbl1, tbl2, tbl3 FROM john_doe, mary_jane`);
    });

    it(`supports optional TABLE keyword`, () => {
      testWc(`REVOKE DELETE ON tbl FROM johnny`);
    });

    ["SELECT", "INSERT", "UPDATE", "REFERENCES"].forEach((privilege) => {
      it(`supports REVOKE ${privilege} (cols) ON TABLE ... FROM role`, () => {
        testWc(`REVOKE ${privilege} (col1, col2) ON TABLE my_tbl FROM john`);
      });
    });

    it(`supports granting multiple privileges per column`, () => {
      testWc(`REVOKE SELECT (col1, col2), UPDATE (col1, col2) ON TABLE my_tbl FROM john`);
    });

    it(`supports granting all privileges on columns`, () => {
      testWc(`REVOKE ALL (col1, col2) ON TABLE my_tbl FROM john`);
      testWc(`REVOKE ALL PRIVILEGES (col1) ON TABLE my_tbl FROM john`);
    });

    ["USAGE", "SELECT", "UPDATE"].forEach((privilege) => {
      it(`supports REVOKE ${privilege} ON SEQUENCE ... FROM role`, () => {
        testWc(`REVOKE ${privilege} ON SEQUENCE schm.seq1, seq2 FROM john_doe`);
      });
    });

    it(`supports ALL SEQUENCES IN SCHEMA`, () => {
      testWc(`REVOKE USAGE ON ALL SEQUENCES IN SCHEMA my_schema FROM peter_pan`);
      testWc(`REVOKE USAGE, UPDATE ON ALL SEQUENCES IN SCHEMA schm1, schm2 FROM peter_pan`);
    });

    ["CREATE", "CONNECT", "TEMPORARY", "TEMP"].forEach((privilege) => {
      it(`supports REVOKE ${privilege} ON DATABASE ... FROM role`, () => {
        testWc(`REVOKE ${privilege} ON DATABASE db1, db2 FROM john_doe`);
      });
    });

    it(`supports REVOKE USAGE ON DOMAIN ... FROM role`, () => {
      testWc(`REVOKE USAGE ON DOMAIN schm.dom1, dom2 FROM john_doe`);
    });

    it(`supports REVOKE USAGE ON FOREIGN DATA WRAPPER ... FROM role`, () => {
      testWc(`REVOKE USAGE ON FOREIGN DATA WRAPPER wrap1, wrap2 FROM john_doe`);
    });

    it(`supports REVOKE USAGE ON FOREIGN SERVER ... FROM role`, () => {
      testWc(`REVOKE USAGE ON FOREIGN SERVER serv1, serv2 FROM john_doe`);
    });

    ["FUNCTION", "PROCEDURE", "ROUTINE"].forEach((functionKw) => {
      it(`supports REVOKE EXECUTE ON ${functionKw} ... FROM role`, () => {
        testWc(`REVOKE EXECUTE ON ${functionKw} fibo, fobo FROM john`);
        testWc(`REVOKE EXECUTE ON ${functionKw} fn() FROM john`);
        testWc(`REVOKE EXECUTE ON ${functionKw} schm.fn (INT, FLOAT) FROM john`);
        testWc(`REVOKE EXECUTE ON ${functionKw} fn(a INT, b INT) FROM john`);
        testWc(`REVOKE EXECUTE ON ${functionKw} fn(IN a INT, OUT b INT, INOUT c INT) FROM john`);
      });
    });

    ["FUNCTIONS", "PROCEDURES", "ROUTINES"].forEach((functionKw) => {
      it(`supports REVOKE EXECUTE ON ALL ${functionKw} IN SCHEMA ... FROM role`, () => {
        testWc(`REVOKE EXECUTE ON ALL ${functionKw} IN SCHEMA my_schema FROM john`);
        testWc(`REVOKE EXECUTE ON ALL ${functionKw} IN SCHEMA schm1, schm2 FROM john`);
      });
    });

    it(`supports REVOKE USAGE ON LANGUAGE ... FROM role`, () => {
      testWc(`REVOKE USAGE ON LANGUAGE php, perl FROM script_kiddie`);
    });

    ["SELECT", "UPDATE"].forEach((privilege) => {
      it(`supports REVOKE ${privilege} ON LARGE OBJECT ... FROM role`, () => {
        testWc(`REVOKE ${privilege} ON LARGE OBJECT 128, 920 FROM john_doe`);
      });
    });
    it(`supports REVOKE ... ON LARGE OBJECT with parameter`, () => {
      testWc(`REVOKE UPDATE ON LARGE OBJECT :oid FROM john_doe`, {
        ...includeAll,
        paramTypes: [":name"],
      });
    });

    ["SET", "ALTER SYSTEM"].forEach((privilege) => {
      it(`supports REVOKE ${privilege} ON PARAMETER ... FROM role`, () => {
        testWc(`REVOKE ${privilege} ON PARAMETER foo, bar FROM john_doe`);
      });
    });

    ["CREATE", "USAGE"].forEach((privilege) => {
      it(`supports REVOKE ${privilege} ON SCHEMA ... FROM role`, () => {
        testWc(`REVOKE ${privilege} ON SCHEMA foo, bar FROM john_doe`);
      });
    });

    it(`supports REVOKE CREATE ON TABLESPACE ... FROM role`, () => {
      testWc(`REVOKE CREATE ON TABLESPACE spc1, spc2 FROM john_doe`);
    });

    it(`supports REVOKE USAGE ON TYPE ... FROM role`, () => {
      testWc(`REVOKE USAGE ON TYPE schm.typ1, typ2 FROM john_doe`);
    });

    it(`supports GRANT OPTION FOR clause`, () => {
      testWc(`REVOKE GRANT OPTION FOR DELETE ON tbl FROM johnny`);
    });

    it(`supports GRANTED BY clause`, () => {
      testWc(`REVOKE DELETE ON tbl FROM johnny GRANTED BY happy_admin`);
    });

    it(`supports RESTRICT/CASCADE`, () => {
      testWc(`REVOKE DELETE ON tbl FROM johnny RESTRICT`);
      testWc(`REVOKE DELETE ON tbl FROM johnny GRANTED BY foo CASCADE`);
    });

    ["CURRENT_ROLE", "CURRENT_USER", "SESSION_USER", "PUBLIC", "GROUP foo"].forEach((role) => {
      it(`supports revoking from ${role}`, () => {
        testWc(`REVOKE SELECT ON tbl FROM ${role}`);
        testWc(`REVOKE DELETE ON tbl FROM johnny GRANTED BY ${role}`);
      });
    });

    describe("REVOKE role", () => {
      it("support basic REVOKE role", () => {
        testWc(`REVOKE admin FROM joe`);
        testWc(`REVOKE manager, moderator FROM mary, alice, jane`);
      });

      ["CURRENT_ROLE", "CURRENT_USER", "SESSION_USER", "PUBLIC", "GROUP foo"].forEach((role) => {
        it(`supports revoking from ${role}`, () => {
          testWc(`REVOKE admin FROM ${role}`);
        });
      });

      it(`supports GRANTED BY clause`, () => {
        testWc(`REVOKE some_role FROM johnny GRANTED BY happy_admin`);
      });

      it(`supports RESTRICT/CASCASE`, () => {
        testWc(`REVOKE some_role FROM johnny RESTRICT`);
        testWc(`REVOKE some_role FROM johnny CASCADE`);
      });
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support REVOKE", () => {
      expect(() => parse("REVOKE `role` ON TABLE foo FROM 'user:blah'")).toThrowError();
    });
  });
});
