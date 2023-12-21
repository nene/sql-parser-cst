import { dialect, parseExpr, testExpr, testExprWc } from "../test_utils";

describe("JSON operators", () => {
  dialect(["mysql", "sqlite", "postgresql"], () => {
    it("supports common JSON operators", () => {
      testExpr(`col->'items[0].id'`);
      testExprWc(`x -> 'op'`);

      testExpr(`col->>'items[0].id'`);
      testExprWc(`x ->> 'op'`);
    });

    it("supports chain of JSON operators", () => {
      testExpr(`col->'items'->'[0]'->'id'`);
    });
  });

  dialect("postgresql", () => {
    it("supports additional JSON operators", () => {
      testExprWc(`x #> 'op'`);
      testExprWc(`x #>> 'op'`);
    });
  });

  dialect(["mariadb", "bigquery"], () => {
    it("does not support JSON operators", () => {
      expect(() => parseExpr(`col->'op'`)).toThrowError();
    });
  });
});
