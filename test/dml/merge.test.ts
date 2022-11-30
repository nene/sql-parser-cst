import { dialect, parse, test } from "../test_utils";

describe("merge into", () => {
  dialect("bigquery", () => {
    it("supports MERGE", () => {
      test("MERGE foo USING bar ON x = y WHEN MATCHED THEN DELETE");
    });

    it("supports MERGE INTO", () => {
      test("MERGE INTO foo USING bar ON x = y WHEN MATCHED THEN DELETE");
      test(`
        MERGE /*c1*/ INTO /*c2*/ foo /*c3*/ USING /*c4*/ bar /*c5*/
        ON /*c6*/ x=y /*c7*/
        WHEN /*c8*/ MATCHED /*c9*/ THEN /*c10*/ DELETE /*c11*/
      `);
    });

    it("supports aliasing of target table", () => {
      test("MERGE foo AS f USING bar ON x = y WHEN MATCHED THEN DELETE");
      test("MERGE foo f USING bar ON x = y WHEN MATCHED THEN DELETE");
      test("MERGE foo /*c1*/ AS /*c2*/ f /*c3*/ USING bar ON x=y WHEN MATCHED THEN DELETE");
    });

    it("supports aliasing of source table", () => {
      test("MERGE foo USING bar AS b ON x = y WHEN MATCHED THEN DELETE");
      test("MERGE foo USING bar b ON x = y WHEN MATCHED THEN DELETE");
      test("MERGE foo USING bar /*c1*/ AS /*c2*/ b /*c3*/ ON x=y WHEN MATCHED THEN DELETE");
    });

    it("supports subquery as source", () => {
      test("MERGE foo USING (SELECT * FROM bar) ON x = y WHEN MATCHED THEN DELETE");
      test("MERGE foo USING (SELECT * FROM bar) AS t ON x = y WHEN MATCHED THEN DELETE");
      test("MERGE foo USING (SELECT * FROM bar) t ON x = y WHEN MATCHED THEN DELETE");
    });

    describe("when condition", () => {
      it("supports WHEN MATCHED", () => {
        test("MERGE foo USING bar ON x=y WHEN MATCHED THEN DELETE");
      });

      it("supports WHEN MATCHED AND condition", () => {
        test("MERGE foo USING bar ON x=y WHEN MATCHED AND col>10 THEN DELETE");
        test("MERGE foo USING bar ON x=y WHEN MATCHED /*c1*/ AND /*c2*/ col>10 /*c3*/ THEN DELETE");
      });

      it("supports WHEN NOT MATCHED", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED THEN DELETE");
      });

      it("supports WHEN NOT MATCHED AND condition", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED AND col>10 THEN DELETE");
      });

      it("supports WHEN NOT MATCHED BY TARGET", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED BY TARGET THEN DELETE");
      });

      it("supports WHEN NOT MATCHED BY TARGET AND condition", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED BY TARGET AND col>10 THEN DELETE");
        test(`
          MERGE foo USING bar ON x=y /*c1*/
          WHEN /*c2*/ NOT /*c3*/ MATCHED /*c4*/ BY /*c5*/ TARGET /*c6*/
          AND /*c7*/ col>10 /*c8*/ THEN DELETE
        `);
      });

      it("supports WHEN NOT MATCHED BY SOURCE", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED BY SOURCE THEN DELETE");
      });

      it("supports WHEN NOT MATCHED BY SOURCE AND condition", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED BY SOURCE AND col>10 THEN DELETE");
        test(`
          MERGE foo USING bar ON x=y /*c1*/
          WHEN /*c2*/ NOT /*c3*/ MATCHED /*c4*/ BY /*c5*/ SOURCE /*c6*/
          AND /*c7*/ col>10 /*c8*/ THEN DELETE
        `);
      });
    });

    describe("actions", () => {
      it("supports UPDATE SET", () => {
        test("MERGE foo USING bar ON x=y WHEN MATCHED THEN UPDATE SET col1 = 15, col2 = 'hi'");
        test(`
          MERGE foo USING bar ON x=y
          WHEN MATCHED THEN /*c1*/
          UPDATE /*c2*/ SET /*c3*/
            col1 /*c5*/ = /*c6*/ 15 /*c7*/,/*c8*/
            col2 /*c9*/ = /*c10*/ 'hi'
        `);
      });

      it("supports INSERT VALUES", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT VALUES (1, 2), (3, 4)");
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT (c1, c1) VALUES (1, 2)");
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT (c1) VALUES (DEFAULT)");
        test(`
          MERGE foo USING bar ON x=y
          WHEN NOT MATCHED THEN
          INSERT /*c1*/ (/*c2*/ c1 /*c3*/,/*c4*/ c2 /*c5*/) /*c6*/
          VALUES /*c7*/ (/*c8*/ 15 /*c9*/,/*c10*/ 28 /*c11*/)
        `);
      });

      it("supports INSERT ROW", () => {
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT ROW");
        test("MERGE foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT (col1, col2) ROW");
      });
    });

    it("supports multiple when-clauses", () => {
      // example from BigQuery docs
      test(`
        MERGE dataset.DetailedInventory T
        USING dataset.Inventory S
        ON T.product = S.product
        WHEN NOT MATCHED AND quantity < 20 THEN
          INSERT(product, quantity, supply_constrained, comments)
          VALUES(product, quantity, true, ['2016-01-01', 'comment1'])
        WHEN NOT MATCHED THEN
          INSERT(product, quantity, supply_constrained)
          VALUES(product, quantity, false)
      `);
    });
  });

  dialect(["sqlite", "mysql"], () => {
    it("does not support MERGE statement", () => {
      expect(() => parse("MERGE foo USING bar ON x = y WHEN MATCHED THEN DELETE")).toThrowError();
    });
  });
});
