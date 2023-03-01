import { dialect, testExpr, testExprWc } from "../test_utils";

describe("string operators", () => {
  it("supports [NOT] LIKE operator", () => {
    testExprWc(`'foobar' LIKE 'foo%'`);
    testExprWc(`'foobar' NOT LIKE 'foo%'`);
  });

  dialect(["mysql", "sqlite"], () => {
    it("supports LIKE with ESCAPE", () => {
      testExprWc(`'foobar' LIKE 'percentage|%' ESCAPE '|'`);
      testExprWc(`'foobar' NOT LIKE 'foo^_bar' ESCAPE '^'`);
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("supports [NOT] REGEXP operator", () => {
      testExprWc(`'foooo' REGEXP 'fo*'`);
      testExprWc(`'foooo' NOT REGEXP 'fo*'`);
    });
  });

  dialect("sqlite", () => {
    it("supports [NOT] GLOB operator", () => {
      testExprWc(`col GLOB 'fo*'`);
      testExprWc(`col NOT GLOB 'fo*'`);
    });
    it("supports [NOT] MATCH operator", () => {
      testExprWc(`col MATCH 'fo*'`);
      testExprWc(`col NOT MATCH 'fo*'`);
    });
  });

  dialect("mysql", () => {
    it("supports [NOT] RLIKE operator", () => {
      testExprWc(`'foooo' RLIKE 'fo*'`);
      testExprWc(`'foooo' NOT RLIKE 'fo*'`);
    });
  });

  dialect(["sqlite", "bigquery"], () => {
    it("treats || as concatenation operator", () => {
      testExprWc(`'hello' || '_' || 'world'`);
    });
  });

  dialect(["sqlite", "mysql"], () => {
    it("supports JSON operators", () => {
      testExpr(`col->'items[0].id'`);
      testExprWc(`x -> 'op'`);

      testExpr(`col->>'items[0].id'`);
      testExprWc(`x ->> 'op'`);
    });

    it("supports chain of JSON operators", () => {
      testExpr(`col->'items'->'[0]'->'id'`);
    });
  });
});
