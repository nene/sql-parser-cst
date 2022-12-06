import { dialect, test } from "./test_utils";

describe("BigQuery specific statements", () => {
  dialect("bigquery", () => {
    ["CAPACITY", "RESERVATION", "ASSIGNMENT"].forEach((keyword) => {
      it(`supports CREATE ${keyword}`, () => {
        test(`CREATE ${keyword} project_id.location.commitment_id AS JSON '{}'`);
        test(`CREATE ${keyword} \`admin_project.region-us.my-commitment\` AS JSON '{}'`);
        test(`
          CREATE /*c1*/ ${keyword} /*c2*/ proj.loc.comid /*c3*/
          AS /*c4*/ JSON /*c5*/ '''{
            "slot_count": 100,
            "plan": "FLEX"
          }'''`);
      });

      it(`supports DROP ${keyword}`, () => {
        test(`DROP ${keyword} project_id.location.commitment_id`);
        test(`DROP ${keyword} \`admin_project.region-us.my-commitment\``);
        test(`DROP /*c1*/ ${keyword} /*c2*/ IF /*c3*/ EXISTS /*c4*/ proj.loc.comid`);
      });
    });
  });

  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
