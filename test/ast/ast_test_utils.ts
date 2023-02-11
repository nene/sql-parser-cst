import { ParserOptions } from "../../src/main";
import { cstToAst } from "../../src/cstToAst";
import { parse } from "../test_utils";

export function parseAst(sql: string, options: Partial<ParserOptions> = {}) {
  return cstToAst(parse(sql, options));
}
