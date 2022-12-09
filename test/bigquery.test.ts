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
  });

  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
