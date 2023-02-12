import { dialect } from "../test_utils";
import { parseAstSelect } from "./ast_test_utils";

describe("select..window", () => {
  it("parses SELECT with WINDOW clause", () => {
    expect(
      parseAstSelect("SELECT * FROM t WINDOW win1 AS (baseWin PARTITION BY col1 ORDER BY col2)")
    ).toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "type": "all_columns",
          },
        ],
        "from": {
          "name": "t",
          "type": "identifier",
        },
        "type": "select_stmt",
        "window": [
          {
            "name": {
              "name": "win1",
              "type": "identifier",
            },
            "type": "named_window",
            "window": {
              "baseWindowName": {
                "name": "baseWin",
                "type": "identifier",
              },
              "orderBy": [
                {
                  "name": "col2",
                  "type": "identifier",
                },
              ],
              "partitionBy": [
                {
                  "name": "col1",
                  "type": "identifier",
                },
              ],
              "type": "window_definition",
            },
          },
        ],
      }
    `);
  });

  describe("window frames", () => {
    const parseWindowFrame = (def: string) => {
      const { window } = parseAstSelect(`SELECT * FROM t WINDOW win1 AS (${def})`);
      if (!window) {
        throw new Error(`Expected a window clause`);
      }
      return window[0].window.frame;
    };

    it("parses ROWS CURRENT ROW", () => {
      expect(parseWindowFrame("ROWS CURRENT ROW")).toMatchInlineSnapshot(`
        {
          "extent": {
            "type": "frame_bound_current_row",
          },
          "type": "frame_clause",
          "unit": "rows",
        }
      `);
    });

    it("parses RANGE UNBOUNDED PRECEDING", () => {
      expect(parseWindowFrame("RANGE UNBOUNDED PRECEDING")).toMatchInlineSnapshot(`
        {
          "extent": {
            "expr": {
              "type": "frame_unbounded",
            },
            "type": "frame_bound_preceding",
          },
          "type": "frame_clause",
          "unit": "range",
        }
      `);
    });

    it("parses ROWS BETWEEN 1 PRECEDING AND 2 FOLLOWING", () => {
      expect(parseWindowFrame("ROWS BETWEEN 1 PRECEDING AND 2 FOLLOWING")).toMatchInlineSnapshot(`
        {
          "extent": {
            "begin": {
              "expr": {
                "type": "number_literal",
                "value": 1,
              },
              "type": "frame_bound_preceding",
            },
            "end": {
              "expr": {
                "type": "number_literal",
                "value": 2,
              },
              "type": "frame_bound_following",
            },
            "type": "frame_between",
          },
          "type": "frame_clause",
          "unit": "rows",
        }
      `);
    });

    dialect("sqlite", () => {
      it("parses GROUPS UNBOUNDED PRECEDING EXCLUDE CURRENT ROW", () => {
        expect(parseWindowFrame("GROUPS UNBOUNDED PRECEDING EXCLUDE CURRENT ROW"))
          .toMatchInlineSnapshot(`
          {
            "exclude": "current row",
            "extent": {
              "expr": {
                "type": "frame_unbounded",
              },
              "type": "frame_bound_preceding",
            },
            "type": "frame_clause",
            "unit": "groups",
          }
        `);
      });
    });
  });
});
