import fs from "fs";
import path from "path";
import benchmark from "benchmark";
import { parse } from "../lib/parser";

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
};

const suite = new benchmark.Suite();
suite.add("sqlite", () => {
  parse(testData.sqlite, { dialect: "sqlite" });
});
suite.add("mysql", () => {
  parse(testData.mysql, { dialect: "mysql" });
});
suite.on("cycle", (event: benchmark.Event) => {
  console.log(String(event.target));
  console.log(`    Mean: ${event.target.stats?.mean.toFixed(4)} seconds`);
});
suite.run();
