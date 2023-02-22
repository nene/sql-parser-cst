import { dialect, parseExpr, testExpr } from "./test_utils";

describe("variable", () => {
  dialect("bigquery", () => {
    it("supports BigQuery @@system_variables", () => {
      testExpr("@@error");
      testExpr("@@error.message");
      testExpr("@@script.bytes_billed");
    });

    it("parses @@system_variable into type:variable", () => {
      expect(parseExpr("@@error.message")).toMatchInlineSnapshot(`
        {
          "object": {
            "name": "@@error",
            "text": "@@error",
            "type": "variable",
          },
          "property": {
            "name": "message",
            "text": "message",
            "type": "identifier",
          },
          "type": "member_expr",
        }
      `);
    });
  });

  dialect(["sqlite", "mysql"], () => {
    it("does not support @@variables", () => {
      expect(() => parseExpr("@@my_var")).toThrowError();
    });
  });
});
