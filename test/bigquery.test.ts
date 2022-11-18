import { dialect, test } from "./test_utils";

describe("BigQuery bugs in node-sql-formatter", () => {
  dialect("bigquery", () => {
    it.skip(`accessing array elements`, () => {
      test(`
        select whatever[OFFSET(1)] as elt1
        from sequences
      `);
    });

    it.skip(`accessing array elements in a function return value`, () => {
      test(`
        select split('To - be - split', ' - ')[OFFSET(0)]
      `);
    });

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

    it.skip(`"qualify" clause`, () => {
      test(`
        SELECT
          item,
          RANK() OVER (PARTITION BY category ORDER BY purchases DESC) as rank
        FROM Produce
        WHERE Produce.category = 'vegetable'
        QUALIFY rank <= 3
      `);
    });

    it.skip(`when a CTE is named with some keyword (table)`, () => {
      test(`
        with table as (
            select *
            from unnest(array[1, 2])
        )
        select * from table
      `);
    });

    it.skip(`function "right"`, () => {
      test(`
        select
          right(
            'lorem ipsum',
            2
          )
      `);
    });

    it.skip(`"extract(year from ...)"`, () => {
      test(`
        select extract(year from current_date())
      `);
    });

    it.skip(`trailing commas"`, () => {
      test(`SELECT foo, bar, FROM invoice`);
    });
  });

  // This is need for the non-BigQuery case, otherwise Jest will fail because of empty test suite
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
