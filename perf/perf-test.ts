import fs from "fs";
import path from "path";
import benchmark from "benchmark";
import { parse } from "../lib/main";

// Using test data from Chinook database
// https://github.com/lerocha/chinook-database
function getTestData(dialect: string) {
  return fs.readFileSync(
    path.resolve(__dirname, `./data-${dialect}.sql`),
    "utf-8"
  );
}

function createTestData(variant: string) {
  if (variant === "func") {
    const sql = "SELECT foo(bar(baz()))";
    return {
      sqlite: sql,
      mysql: sql,
      bigquery: sql,
    };
  } else if (variant === "paren") {
    const sql = "SELECT ((((((1))))))";
    return {
      sqlite: sql,
      mysql: sql,
      bigquery: sql,
    };
  } else if (variant === "list") {
    const sql = "SELECT ((1, 2, 3), (4, 5, 6), (7, 8, 9))";
    return {
      sqlite: sql,
      mysql: sql,
      bigquery: sql,
    };
  } else if (variant === "big") {
    return {
      sqlite: getTestData("sqlite"),
      mysql: getTestData("mysql"),
      bigquery: getTestData("bigquery"),
    };
  } else if (variant === "select") {
    return {
      sqlite: getTestData("select"),
      mysql: getTestData("select"),
      bigquery: getTestData("select"),
    };
  } else if (variant === "case") {
    return {
      sqlite: getTestData("case"),
      mysql: getTestData("case"),
      bigquery: getTestData("case"),
    };
  } else {
    throw new Error(`Unknown test data variant: ${variant}`);
  }
}

const testData = createTestData(process.argv[2]);

const suite = new benchmark.Suite();
suite.add("sqlite", () => {
  parse(testData.sqlite, { dialect: "sqlite" });
});
suite.add("mysql", () => {
  parse(testData.mysql, { dialect: "mysql" });
});
suite.add("bigquery", () => {
  parse(testData.bigquery, { dialect: "bigquery" });
});
suite.on("cycle", (event: benchmark.Event) => {
  console.log(String(event.target));
  console.log(`    Mean: ${event.target.stats?.mean.toFixed(4) || ""} seconds`);
});
suite.run();
