import { dialect, parse, testWc } from "../test_utils";

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

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support REVOKE", () => {
      expect(() => parse("REVOKE `role` ON TABLE foo FROM 'user:blah'")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
