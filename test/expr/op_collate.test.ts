import { dialect, parseExpr, testExprWc } from "../test_utils";

describe("COLLATE operator", () => {
  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("supports COLLATE operator", () => {
      // MySQL style collation identifiers
      testExprWc(`'foobar' COLLATE utf8`);
    });
    dialect("postgresql", () => {
      it("supports COLLATE with quoted collation identifier", () => {
        testExprWc(`'foobar' COLLATE "C"`);
      });
    });

    it("supports nested COLLATE operator", () => {
      testExprWc(`'foobar' COLLATE utf8mb4_bin COLLATE utf8mb4_general_ci`);
    });

    it("parses COLLATE operator to syntax tree", () => {
      expect(parseExpr("my_col COLLATE utf8")).toMatchInlineSnapshot(`
        {
          "left": {
            "name": "my_col",
            "text": "my_col",
            "type": "identifier",
          },
          "operator": {
            "name": "COLLATE",
            "text": "COLLATE",
            "type": "keyword",
          },
          "right": {
            "name": "utf8",
            "text": "utf8",
            "type": "identifier",
          },
          "type": "binary_expr",
        }
      `);
    });
  });

  dialect(["mysql", "mariadb"], () => {
    it("supports BINARY operator", () => {
      testExprWc(`BINARY 'foobar'`);
    });

    it("supports nested BINARY operator", () => {
      testExprWc(`BINARY BINARY 'foobar'`);
    });

    it("parses BINARY operator to syntax tree", () => {
      expect(parseExpr("BINARY col")).toMatchInlineSnapshot(`
        {
          "expr": {
            "name": "col",
            "text": "col",
            "type": "identifier",
          },
          "operator": {
            "name": "BINARY",
            "text": "BINARY",
            "type": "keyword",
          },
          "type": "prefix_op_expr",
        }
      `);
    });
  });

  dialect("bigquery", () => {
    it("does not support COLLATE operator", () => {
      expect(() => parseExpr(`'foobar' COLLATE utf8`)).toThrowError();
    });

    it("does not support BINARY operator", () => {
      expect(() => parseExpr(`BINARY 'foobar'`)).toThrowError();
    });
  });
});
