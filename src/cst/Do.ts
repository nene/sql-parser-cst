import { BaseNode, Keyword } from "./Base";
import { StringLiteral } from "./Literal";
import { LanguageClause } from "./ProcClause";

export interface DoStmt extends BaseNode {
  type: "do_stmt";
  doKw: Keyword<"DO">;
  language: LanguageClause;
  body: StringLiteral;
}
