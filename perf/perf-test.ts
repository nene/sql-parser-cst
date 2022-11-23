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

const testData = {
  sqlite: getTestData("sqlite"),
  mysql: getTestData("mysql"),
  bigquery: getTestData("bigquery"),
};

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
