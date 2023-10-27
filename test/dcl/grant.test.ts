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

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support GRANT", () => {
      expect(() => parse("GRANT `role` ON TABLE foo TO 'user:blah'")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
