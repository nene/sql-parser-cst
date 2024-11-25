import { dialect, parse, testWc } from "../test_utils";

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
