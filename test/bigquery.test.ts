import { dialect, test } from "./test_utils";

describe("BigQuery bugs in node-sql-formatter", () => {
  dialect("bigquery", () => {
    it(`"order by" in a CTE`, () => {
      test(`
        with cte as (
            select *
            from product.organization
            order by id
        )
        select *
        from cte
      `);
    });

    it(`accessing array elements`, () => {
      test(`
        select whatever[OFFSET(1)] as elt1
        from sequences
      `);
    });

    it(`accessing array elements in a function return value`, () => {
      test(`
        select split('To - be - split', ' - ')[OFFSET(0)]
      `);
    });

    it(`using an escaped keyword as identifier`, () => {
      test("select 1 as `from`");
    });

    it(`omitting "inner" in a "join" clause`, () => {
      test(`
        select *
        from organization
        join payment on organization_id = organization.id
      `);
    });

    it(`unnest in a "from" clause that also involves regular tables`, () => {
      test(`
        select *
        from product.organization, unnest(array[1,2])
        limit 10
      `);
    });

    it(`"pivot" clause`, () => {
      test(`
        select *
        from by_plan pivot (sum(cnt) for plan in ('FREE','STARTER', 'PRO'))
      `);
    });

    it(`window definition with "order by" and "rows"`, () => {
      test(`
        select
          date_week,
          avg(nb_users) over (
            order by date_week
            rows between 3 preceding and current row
        ) as nb_users_ma
        from active_users_per_week
      `);
    });

    it(`function "session_user"`, () => {
      test(`
        select session_user()
      `);
    });

    it(`"distinct" and "case"`, () => {
      test(`
        select count (
          distinct (
            case
              when order_purchase_timestamp between '2018-01-01' and '2018-12-31' then order_id
            end
          )
        ) as nb_orders
        from retail.orders
      `);
    });

    it(`select "*" together with specific columns`, () => {
      test(`
        select row_number() over (), * from retail.orders
      `);
    });

    it(`specify a project in a "from" clause`, () => {
      test(`
        select *
        from project.retail.customers
        limit 3
      `);
    });

    it(`"qualify" clause`, () => {
      test(`
        SELECT
          item,
          RAtest(NK() OVER (PARTITION BY category ORDER BY purchases DESC) as rank
        FROM Produce
        WHERE Produce.category = 'vegetable'
        QUALIFY rank <= 3
      `);
    });

    it(`"distinct case"`, () => {
      test(`
        SELECT
          COUNT(
            DISTINCT CASE WHEN active IS TRUE THEN id END
          ) AS nb_active
        FROM
          dataset.users
      `);
    });

    it(`when a column is named with some keyword (type)`, () => {
      test(`
        SELECT
          *
        FROM
          shop.clothes
        WHERE
          type = 'shoe'
      `);
    });

    it(`when a table is named with some keyword (session)`, () => {
      test(`
        select * from product.session
      `);
    });

    it(`when a CTE is named with some keyword (table)`, () => {
      test(`
        with table as (
            select *
            from unnest(array[1, 2])
        )
        select * from table
      `);
    });

    it(`function "right"`, () => {
      test(`
        select
          right(
            'lorem ipsum',
            2
          )
      `);
    });

    it(`when the select part involves an OR condition`, () => {
      test(`
        SELECT
          a OR b
        FROM
          ds.tbl
      `);
    });

    it(`"extract(year from ...)"`, () => {
      test(`
        select extract(year from current_date())
      `);
    });

    it(`"current_date"`, () => {
      test(`
        select current_date
      `);
    });

    it(`window function to "current row"`, () => {
      test(`
        SELECT MAX(amount) OVER (ORDER BY invoice_date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),
        FROM invoice
      `);
    });

    it(`window function to "3 preceding"`, () => {
      test(`
        SELECT MAX(amount) OVER (ORDER BY invoice_date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND 3 PRECEDING),
        FROM invoice
      `);
    });
  });

  // This is need for the non-BigQuery case, otherwise Jest will fail because of empty test suite
  it("ignore empty testsuite", () => {
    expect(true).toBeTruthy();
  });
});
