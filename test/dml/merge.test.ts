import { dialect, parse, testWc } from "../test_utils";

describe("merge into", () => {
  dialect(["bigquery", "postgresql"], () => {
    it("supports MERGE INTO", () => {
      testWc("MERGE INTO foo USING bar ON x = y WHEN MATCHED THEN DELETE");
    });

    dialect("bigquery", () => {
      it("supports MERGE without INTO", () => {
        testWc("MERGE foo USING bar ON x = y WHEN MATCHED THEN DELETE");
      });
    });

    it("supports aliasing of target table", () => {
      testWc("MERGE INTO foo AS f USING bar ON x = y WHEN MATCHED THEN DELETE");
      testWc("MERGE INTO foo f USING bar ON x = y WHEN MATCHED THEN DELETE");
    });

    it("supports aliasing of source table", () => {
      testWc("MERGE INTO foo USING bar AS b ON x = y WHEN MATCHED THEN DELETE");
      testWc("MERGE INTO foo USING bar b ON x = y WHEN MATCHED THEN DELETE");
    });

    it("supports subquery as source", () => {
      testWc("MERGE INTO foo USING (SELECT * FROM bar) ON x = y WHEN MATCHED THEN DELETE");
      testWc("MERGE INTO foo USING (SELECT * FROM bar) AS t ON x = y WHEN MATCHED THEN DELETE");
      testWc("MERGE INTO foo USING (SELECT * FROM bar) t ON x = y WHEN MATCHED THEN DELETE");
    });

    describe("when condition", () => {
      it("supports WHEN MATCHED", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN MATCHED THEN DELETE");
      });

      it("supports WHEN MATCHED AND condition", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN MATCHED AND col>10 THEN DELETE");
      });

      it("supports WHEN NOT MATCHED", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED THEN DELETE");
      });

      it("supports WHEN NOT MATCHED AND condition", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED AND col>10 THEN DELETE");
      });

      it("supports WHEN NOT MATCHED BY TARGET", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED BY TARGET THEN DELETE");
      });

      it("supports WHEN NOT MATCHED BY TARGET AND condition", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED BY TARGET AND col>10 THEN DELETE");
      });

      it("supports WHEN NOT MATCHED BY SOURCE", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED BY SOURCE THEN DELETE");
      });

      it("supports WHEN NOT MATCHED BY SOURCE AND condition", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED BY SOURCE AND col>10 THEN DELETE");
      });
    });

    describe("actions", () => {
      it("supports UPDATE SET", () => {
        testWc(
          "MERGE INTO foo USING bar ON x=y WHEN MATCHED THEN UPDATE SET col1 = 15, col2 = 'hi'"
        );
      });

      it("supports INSERT VALUES", () => {
        testWc(
          "MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT VALUES (1, 2), (3, 4)"
        );
        testWc(
          "MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT (c1, c1) VALUES (1, 2)"
        );
        testWc(
          "MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT (c1) VALUES (DEFAULT)"
        );
      });

      it("supports INSERT ROW", () => {
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT ROW");
        testWc("MERGE INTO foo USING bar ON x=y WHEN NOT MATCHED THEN INSERT (col1, col2) ROW");
      });
    });

    it("supports multiple when-clauses", () => {
      testWc(`
        MERGE INTO dataset.DetailedInventory T
        USING dataset.Inventory S
        ON T.product = S.product
        WHEN NOT MATCHED AND quantity < 20 THEN
          INSERT(product, quantity, supply_constrained, comments)
          VALUES(product, quantity, true, NULL)
        WHEN NOT MATCHED THEN
          INSERT(product, quantity, supply_constrained)
          VALUES(product, quantity, false)
      `);
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    it("does not support MERGE statement", () => {
      expect(() =>
        parse("MERGE INTO foo USING bar ON x = y WHEN MATCHED THEN DELETE")
      ).toThrowError();
    });
  });
});
