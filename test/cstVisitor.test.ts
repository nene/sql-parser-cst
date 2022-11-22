import { cstVisitor } from "../src/main";
import { parse, preserveAll, show } from "./test_utils";

describe("cstVisitor", () => {
  it("allows visiting all table names", () => {
    const tables: string[] = [];

    const visit = cstVisitor({
      table_ref: (tbl) => {
        tables.push(tbl.table.text);
      },
    });
    visit(parse("SELECT name, job_name FROM employees JOIN jobs"));

    expect(tables).toEqual(["employees", "jobs"]);
  });

  it("allows mutating all keywords", () => {
    const toUpper = cstVisitor({
      keyword: (kw) => {
        kw.text = kw.text.toUpperCase();
      },
    });

    const cst = parse("select * from jobs where salary > 1000", preserveAll);
    toUpper(cst);

    expect(show(cst)).toEqual("SELECT * FROM jobs WHERE salary > 1000");
  });
});
