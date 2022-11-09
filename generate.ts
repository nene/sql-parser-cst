import peggy from "peggy";
import tspegjs from "ts-pegjs";
import fs from "fs";
import path from "path";

const source = fs.readFileSync(
  path.resolve(__dirname, "./src/parser.pegjs"),
  "utf-8"
);

console.log(`Generating parser...`);

const parser = peggy.generate(source, {
  plugins: [tspegjs],
  output: "source",
  format: "commonjs",
  tspegjs: {
    customHeader: `
      import {
        setRangeFunction,
        setOptionsFunction,
        identity,
        trailing,
        surrounding,
        createBinaryExprChain,
        createBinaryExpr,
        createJoinExprChain,
        createPrefixOpExpr,
        createPostfixOpExpr,
        createKeyword,
        read,
        readCommaSepList,
        readSpaceSepList,
        createIdentifier,
        createAlias,
        createParenExpr,
        createExprList,
        hasParamType,
        isEnabledWhitespace,
        loc,
        isReservedKeyword,
        isSqlite,
        isMysql,
      } from "./grammar_utils";
    `,
  },
} as peggy.SourceBuildOptions<"source">);

fs.writeFileSync(path.resolve(__dirname, `./src/parser.ts`), parser);
