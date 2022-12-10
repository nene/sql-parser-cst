import { dialect, testWc } from "./test_utils";

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

    describe("CREATE ROW ACCESS POLICY", () => {
      it("supports CREATE ROW ACCESS POLICY", () => {
        testWc(`
          CREATE ROW ACCESS POLICY policy_name ON my_table
          FILTER USING ( SESSION_USER() )
        `);
      });

      it("supports OR REPLACE", () => {
        testWc(`
          CREATE OR REPLACE ROW ACCESS POLICY policy_name ON my_table
          FILTER USING (TRUE)
        `);
      });

      it("supports IF NOT EXISTS", () => {
        testWc(`
          CREATE ROW ACCESS POLICY IF NOT EXISTS policy_name ON my_table
          FILTER USING (TRUE)
        `);
      });

      it("supports GRANT TO", () => {
        testWc(`
          CREATE ROW ACCESS POLICY policy_name ON proj.dataSet.my_table
          GRANT TO (
            "user:alice@example.com" ,
            "group:admins@example.com",
            "user:sales@example.com"
          )
          FILTER USING (TRUE)
        `);
      });
    });

    describe("DROP ROW ACCESS POLICY", () => {
      it("supports DROP ROW ACCESS POLICY", () => {
        testWc(`DROP ROW ACCESS POLICY policy_name ON my_table`);
      });

      it("supports IF EXISTS", () => {
        testWc(`DROP ROW ACCESS POLICY IF EXISTS policy_name ON db.my_table`);
      });

      it("supports DROP ALL ROW ACCESS POLICIES", () => {
        testWc(`DROP ALL ROW ACCESS POLICIES ON my_table`);
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
