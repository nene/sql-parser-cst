import { dialect, notDialect, testWc } from "../test_utils";

describe("BigQuery specific statements", () => {
  dialect("bigquery", () => {
    ["CAPACITY", "RESERVATION", "ASSIGNMENT"].forEach((keyword) => {
      it(`supports CREATE ${keyword}`, () => {
        testWc(`CREATE ${keyword} project_id.location.commitment_id OPTIONS (foo = 'bar')`);
        testWc(`CREATE ${keyword} \`admin_project.region-us.my-commitment\` OPTIONS (foo = 'bar')`);
      });

      it(`supports DROP ${keyword}`, () => {
        testWc(`DROP ${keyword} project_id.location.commitment_id`);
        testWc(`DROP ${keyword} IF EXISTS \`admin_project.region-us.my-commitment\``);
      });
    });

    describe("ALTER ORGANIZATION", () => {
      it("supports ALTER ORGANIZATION SET OPTIONS(..)", () => {
        testWc(`ALTER ORGANIZATION SET OPTIONS(default_time_zone = "America/Chicago")`);
      });

      it("supports ALTER ORGANIZATION SET OPTIONS(..) with region prefixes", () => {
        testWc(`
          ALTER ORGANIZATION SET OPTIONS(
            \`region-us.default_time_zone\` = "America/Chicago",
            \`region-us.default_job_query_timeout_ms\` = 3600000
          )
        `);
      });
    });

    describe("ALTER PROJECT", () => {
      it("supports ALTER PROJECT SET OPTIONS(..)", () => {
        testWc(`ALTER PROJECT my_project SET OPTIONS(default_kms_key_name=NULL)`);
      });

      it("supports ALTER PROJECT SET OPTIONS(..) with region prefixes", () => {
        testWc(`
          ALTER PROJECT awesome_project SET OPTIONS(
            \`region-us.default_time_zone\` = "America/New_York",
            \`region-us.default_job_query_timeout_ms\` = 1800000
          )
        `);
      });
    });

    ["BI_CAPACITY", "CAPACITY", "RESERVATION"].forEach((keyword) => {
      describe(`ALTER ${keyword}`, () => {
        it(`supports ALTER ${keyword} SET OPTIONS(..)`, () => {
          testWc(`ALTER ${keyword} my_project.regionUS.default SET OPTIONS(size_gb=28)`);
        });
      });
    });
  });

  notDialect("bigquery", () => {
    it("does not support CREATE CAPACITY", () => {
      expect(() => testWc("CREATE CAPACITY foo OPTIONS (foo = 'bar')")).toThrowError();
    });
    it("does not support DROP CAPACITY", () => {
      expect(() => testWc("DROP CAPACITY foo")).toThrowError();
    });
    it("does not support ALTER ORGANIZATION", () => {
      expect(() => testWc("ALTER ORGANIZATION SET OPTIONS(foo='bar')")).toThrowError();
    });
    it("does not support ALTER PROJECT", () => {
      expect(() => testWc("ALTER PROJECT my_project SET OPTIONS(foo='bar')")).toThrowError();
    });
    it("does not support ALTER CAPACITY", () => {
      expect(() => testWc("ALTER CAPACITY foo SET OPTIONS(size_gb=10)")).toThrowError();
    });
  });
});
