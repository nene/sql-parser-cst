import { cstVisitor, VisitorAction } from "../src/main";
import { parse, includeAll, show } from "./test_utils";

describe("cstVisitor", () => {
  it("allows visiting all identifiers", () => {
    const tables: string[] = [];

    const visit = cstVisitor({
      identifier: (id) => {
        tables.push(id.name);
      },
    });
    visit(parse("SELECT name, job_name FROM employees JOIN jobs"));

    expect(tables).toEqual(["name", "job_name", "employees", "jobs"]);
  });

  it("allows mutating all keywords", () => {
    const toUpper = cstVisitor({
      keyword: (kw) => {
        kw.text = kw.text.toUpperCase();
      },
    });

    const cst = parse("select * from jobs where payment_done = true", includeAll);
    toUpper(cst);

    expect(show(cst)).toEqual("SELECT * FROM jobs WHERE payment_done = TRUE");
  });

  it("allows injecting AS keywords to aliases", () => {
    const makeAliasesExplicit = cstVisitor({
      alias: (node) => {
        if (!node.asKw) {
          node.asKw = {
            type: "keyword",
            name: "AS",
            text: "AS",
            trailing: [{ type: "space", text: " " }],
          };
        }
      },
    });

    const cst = parse("SELECT t.firstname fname, t.lastname lname FROM my_table t", includeAll);
    makeAliasesExplicit(cst);

    expect(show(cst)).toEqual(
      "SELECT t.firstname AS fname, t.lastname AS lname FROM my_table AS t"
    );
  });

  // Regression test for issue #9
  it("allows visiting null_literal", () => {
    const nulls: string[] = [];
    const visit = cstVisitor({
      null_literal: (node) => {
        nulls.push(node.nullKw.text);
      },
    });

    visit(parse("SELECT * FROM employees WHERE id IS NULL"));
    expect(nulls).toEqual(["NULL"]);
  });

  it("allows skipping child nodes", () => {
    let topLevelSelects = 0;
    const visit = cstVisitor({
      select_stmt: () => {
        topLevelSelects++;
        return VisitorAction.SKIP;
      },
    });

    visit(parse("SELECT (SELECT (SELECT 1)); SELECT 2;"));
    expect(topLevelSelects).toBe(2);
  });
});
