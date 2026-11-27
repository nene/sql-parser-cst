import { moveImports } from "./build/plugins/move-imports.js";
import { ruleTemplates } from "./build/plugins/rule-templates.js";

export default {
  dts: true,
  format: "es",
  input: "src/parser.pegjs",
  plugins: [moveImports, ruleTemplates],
};
