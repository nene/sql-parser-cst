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
  });

  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
