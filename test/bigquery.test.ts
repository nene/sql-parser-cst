import { dialect, test } from "./test_utils";

describe("BigQuery bugs in node-sql-formatter", () => {
  dialect("bigquery", () => {
    it.skip(`unnest in a "from" clause that also involves regular tables`, () => {
      test(`
        select *
        from product.organization, unnest(array[1,2])
        limit 10
      `);
    });

    it.skip(`"pivot" clause`, () => {
      test(`
        select *
        from by_plan pivot (sum(cnt) for plan in ('FREE','STARTER', 'PRO'))
      `);
    });
  });

  // This is need for the non-BigQuery case, otherwise Jest will fail because of empty test suite
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
