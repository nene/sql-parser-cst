import { dialect, testWc } from "../test_utils";

describe("BigQuery specific statements", () => {
  dialect("bigquery", () => {
    ["CAPACITY", "RESERVATION", "ASSIGNMENT"].forEach((keyword) => {
      it(`supports CREATE ${keyword}`, () => {
        testWc(`CREATE ${keyword} project_id.location.commitment_id AS JSON '{}'`);
        testWc(`CREATE ${keyword} \`admin_project.region-us.my-commitment\` AS JSON '{}'`);
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

    describe("ALTER BI_CAPACITY", () => {
      it("supports ALTER BI_CAPACITY SET OPTIONS(..)", () => {
        testWc("ALTER BI_CAPACITY `my-project.region-us.default` SET OPTIONS(size_gb=28)");
      });
    });
  });

  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
