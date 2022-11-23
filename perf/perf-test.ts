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
    return {
      sqlite: "SELECT foo(bar(baz()))",
      mysql: "SELECT foo(bar(baz()))",
      bigquery: "SELECT foo(bar(baz()))",
    };
  } else if (variant === "big") {
    return {
      sqlite: getTestData("sqlite"),
      mysql: getTestData("mysql"),
      bigquery: getTestData("bigquery"),
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
  console.log(`    Mean: ${event.target.stats?.mean.toFixed(4)} seconds`);
});
suite.run();
