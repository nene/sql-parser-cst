import { cstVisitor } from "../src/parser";
import { parse, preserveAll, show } from "./test_utils";

describe("cstVisitor", () => {
  it("allows visiting all table and column names", () => {
    const tables: string[] = [];
    const columns: string[] = [];

    const visit = cstVisitor({
      table_ref: (tbl) => {
        tables.push(tbl.table.text);
      },
      column_ref: (col) => {
        if (col.column.type === "identifier") {
          columns.push(col.column.text);
        }
      },
    });
    visit(parse("SELECT name, job_name FROM employees NATURAL LEFT JOIN jobs"));

    expect(tables).toEqual(["employees", "jobs"]);
    expect(columns).toEqual(["name", "job_name"]);
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
