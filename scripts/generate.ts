import peggy from "peggy";
import tspegjs from "ts-pegjs";
import fs from "fs";
import path from "path";
import { moveImports } from "./move-imports";

const source = fs.readFileSync(
  path.resolve(__dirname, "../src/parser.pegjs"),
  "utf-8"
);

console.log(`Generating parser...`);

const parser = peggy.generate(source, {
  plugins: [tspegjs, moveImports],
  output: "source",
  format: "commonjs",
} as peggy.SourceBuildOptions<"source">);

fs.writeFileSync(path.resolve(__dirname, `../src/parser.ts`), parser);
