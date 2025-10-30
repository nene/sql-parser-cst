import { dialect, notDialect, parse, parseStmt, testWc } from "../test_utils";

describe("parameters", () => {
  dialect("postgresql", () => {
    it("supports SET parameter = value", () => {
      testWc("SET foo = 10");
      testWc("SET foo = TRUE");
      testWc("SET foo = NULL");
      testWc("SET foo = 'hello'");
      testWc("SET foo = some_identifier");
      testWc("SET foo = DEFAULT");
      testWc("SET foo = 1, 2, 3");
    });

    it("parses SET as set_parameter_stmt", () => {
      expect(parseStmt("SET x = 10").type).toBe("set_parameter_stmt");
    });

    it("supports SET parameter TO value", () => {
      testWc("SET foo TO 10");
    });

    it("supports ON value", () => {
      testWc("SET foo = ON");
      testWc("SET foo TO ON");
    });

    it("supports OFF value", () => {
      testWc("SET foo = OFF");
      testWc("SET foo TO OFF");
    });

    it("parses ON value as literal", () => {
      expect(parseParameterValue("SET x = ON")).toEqual({
        type: "boolean_on_off_literal",
        valueKw: { type: "keyword", name: "ON", text: "ON" },
        value: true,
      });
    });

    it("parses OFF value as literal", () => {
      expect(parseParameterValue("SET x = OFF")).toEqual({
        type: "boolean_on_off_literal",
        valueKw: { type: "keyword", name: "OFF", text: "OFF" },
        value: false,
      });
    });

    it("supports [LOCAL | SESSION] modifier", () => {
      testWc("SET LOCAL foo = 10");
      testWc("SET SESSION foo = 10");
    });

    it("supports SET TIME ZONE", () => {
      testWc("SET TIME ZONE 'UTC'");
      testWc("SET SESSION TIME ZONE -5");
      testWc("SET LOCAL TIME ZONE DEFAULT");
      testWc("SET LOCAL TIME ZONE LOCAL");
      testWc("SET TIME ZONE INTERVAL '-08:00'");
    });

    it("supports RESET", () => {
      testWc("RESET foo");
    });

    it("supports RESET ALL", () => {
      testWc("RESET ALL");
    });

    it("supports SHOW", () => {
      testWc("SHOW foo");
    });

    it("supports SHOW ALL", () => {
      testWc("SHOW ALL");
    });
  });

  notDialect("postgresql", () => {
    it("does not support SET .. TO statement", () => {
      expect(() => parse("SET x TO 10")).toThrowError();
    });
  });
});

function parseParameterValue(sql: string) {
  const stmt = parseStmt(sql);
  if (stmt.type !== "set_parameter_stmt") {
    throw new Error("Expected set_parameter_stmt");
  }
  if (stmt.value.type !== "list_expr") {
    throw new Error("Expected list_expr");
  }
  return stmt.value.items[0];
}
