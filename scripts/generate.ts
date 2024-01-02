import peggy from "peggy";
import tspegjs from "ts-pegjs";
import fs from "fs";
import path from "path";
import { moveImports } from "./move-imports";
import { ruleTemplates } from "./rule-templates";

const source = fs.readFileSync(
  path.resolve(__dirname, "../src/parser.pegjs"),
  "utf-8"
);

console.log(`Generating parser...`);

const parser = peggy.generate(source, {
  plugins: [tspegjs, moveImports, ruleTemplates],
  output: "source",
  format: "commonjs",
  tspegjs: {
    // The type inference is pretty slow and we don't really rely on this feature.
    // At the time of writing, it adds about 30 seconds to the build time.
    skipTypeComputation: true,
  },
} as peggy.SourceBuildOptions<"source">);

fs.writeFileSync(path.resolve(__dirname, `../src/parser.ts`), parser);
