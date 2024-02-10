import { dialect, test, testWc } from "../test_utils";

describe("alter function/procedure", () => {
  function testAlterStatement(kind: "FUNCTION" | "PROCEDURE") {
    describe(`ALTER ${kind}`, () => {
      function testAlterClauseWc(clause: string) {
        testWc(`ALTER ${kind} foo() ${clause}`);
      }

      it(`supports basic ALTER ${kind} RENAME TO`, () => {
        testWc(`ALTER ${kind} foo RENAME TO bar`);
      });

      it("supports parameter list", () => {
        testWc(`ALTER ${kind} foo() RENAME TO bar`);
        testWc(`ALTER ${kind} foo (a INT, OUT b VARCHAR(100)) RENAME TO bar`);
      });

      it("supports OWNER TO", () => {
        testAlterClauseWc("OWNER TO john_doe");
      });

      it("supports SET SCHEMA", () => {
        testAlterClauseWc("SET SCHEMA bar");
      });

      it("supports [NO] DEPENDS ON EXTENSION", () => {
        testAlterClauseWc("DEPENDS ON EXTENSION bar");
        testAlterClauseWc("NO DEPENDS ON EXTENSION bar");
      });

      it("supports SET parameter clause", () => {
        testAlterClauseWc("SET log_destination = 'stderr'");
        testAlterClauseWc("SET log_destination TO 'stderr'");
        testAlterClauseWc("SET log_destination TO DEFAULT");
      });

      it("supports SET parameter FROM CURRENT clause", () => {
        testAlterClauseWc("SET search_path FROM CURRENT");
      });

      it("supports RESET parameter", () => {
        testAlterClauseWc("RESET search_path");
      });

      it("supports RESET ALL", () => {
        testAlterClauseWc("RESET ALL");
      });

      [
        "CALLED ON NULL INPUT",
        "RETURNS NULL ON NULL INPUT",
        "STRICT",
        "VOLATILE",
        "STABLE",
        "IMMUTABLE",
        "LEAKPROOF",
        "NOT LEAKPROOF",
        "SECURITY DEFINER",
        "SECURITY INVOKER",
        "EXTERNAL SECURITY DEFINER",
        "EXTERNAL SECURITY INVOKER",
        "PARALLEL UNSAFE",
        "PARALLEL RESTRICTED",
        "PARALLEL SAFE",
      ].forEach((attr) => {
        it(`supports function behavior attribute: ${attr}`, () => {
          testAlterClauseWc(attr);
        });
      });

      it("supports COST clause", () => {
        testAlterClauseWc("COST 125");
      });

      it("supports ROWS clause", () => {
        testAlterClauseWc("ROWS 5200");
      });

      it("supports SUPPORT clause", () => {
        testAlterClauseWc("SUPPORT my_func");
        testAlterClauseWc("SUPPORT schm.my_func");
      });

      it("supports [RESTRICT] after actions", () => {
        testAlterClauseWc("RESET ALL SET foo = 1 RESTRICT");
      });
    });
  }

  dialect("postgresql", () => {
    testAlterStatement("FUNCTION");
  });

  dialect(["mysql", "mariadb", "sqlite", "bigquery"], () => {
    it("does not support ALTER FUNCTION/PROCEDURE", () => {
      expect(() => test("ALTER FUNCTION foo() RENAME TO bar")).toThrowError();
      expect(() => test("ALTER PROCEDURE foo() RENAME TO bar")).toThrowError();
    });
  });
});
