import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("COMMENT ON", () => {
  dialect("postgresql", () => {
    [
      "ACCESS METHOD my_am",
      "COLLATION my_collation",
      "COLUMN my_table.my_column",
      "CONSTRAINT my_constraint ON my_table",
      "CONSTRAINT my_constraint ON DOMAIN my_domain",
      "CONVERSION my_conversion",
      "DATABASE my_database",
      "DOMAIN my_domain",
      "EXTENSION my_extension",
      "EVENT TRIGGER my_event_trigger",
      "FOREIGN DATA WRAPPER my_fdw",
      "FOREIGN TABLE my_foreign_table",
      "INDEX my_index",
      "MATERIALIZED VIEW my_mat_view",
      "POLICY my_policy ON my_table",
      "LANGUAGE my_language",
      "PROCEDURAL LANGUAGE my_language",
      "PUBLICATION my_publication",
      "ROLE my_role",
      "RULE my_rule ON my_table",
      "SCHEMA my_schema",
      "SEQUENCE my_sequence",
      "SERVER my_server",
      "STATISTICS my_statistics",
      "SUBSCRIPTION my_subscription",
      "TABLE my_table",
      "TABLESPACE my_tablespace",
      "TEXT SEARCH CONFIGURATION my_tscfg",
      "TEXT SEARCH DICTIONARY my_tsdict",
      "TEXT SEARCH PARSER my_tsparser",
      "TEXT SEARCH TEMPLATE my_tstemplate",
      "TRANSFORM FOR my_type LANGUAGE my_language",
      "TRIGGER my_trigger ON my_table",
      "TYPE my_type",
      "VIEW my_view",
    ].forEach((target) => {
      it(`supports COMMENT ON ${target}`, () => {
        testWc(`COMMENT ON ${target} IS 'This is a comment'`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support COMMENT ON", () => {
      expect(() => parse(`COMMENT ON TABLE my_table IS 'This is a comment'`)).toThrow();
    });
  });
});
