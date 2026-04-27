import { dialect, parse, test, testWc } from "../test_utils";

describe("RAISE", () => {
  dialect(["bigquery", "plpgsql"], () => {
    it("supports RAISE statement", () => {
      test(`RAISE`);
    });

    it("supports USING MESSAGE", () => {
      testWc(`RAISE USING MESSAGE = 'AnError!'`);
    });
  });

  dialect(["plpgsql"], () => {
    ["DETAIL", "HINT", "ERRCODE", "COLUMN", "CONSTRAINT", "DATATYPE", "TABLE", "SCHEMA"].forEach(
      (option) => {
        it(`supports USING ${option}`, () => {
          testWc(`RAISE USING ${option} = 42`);
        });
      }
    );

    it("supports multiple USING options", () => {
      testWc(`RAISE USING MESSAGE = 'AnError!', ERRCODE = 25 + 8, HINT = 'Haha'`);
    });

    it("supports := operator", () => {
      testWc(`RAISE USING MESSAGE := 'AnError!'`);
    });

    it("supports RAISE with level", () => {
      testWc(`RAISE DEBUG USING MESSAGE = 'foo'`);
      testWc(`RAISE LOG USING MESSAGE = 'foo'`);
      testWc(`RAISE INFO USING MESSAGE = 'foo'`);
      testWc(`RAISE NOTICE USING MESSAGE = 'foo'`);
      testWc(`RAISE WARNING USING MESSAGE = 'foo'`);
      testWc(`RAISE EXCEPTION USING MESSAGE = 'foo'`);
    });

    it("supports RAISE SQLSTATE", () => {
      testWc(`RAISE SQLSTATE '22012'`);
      testWc(`RAISE WARNING SQLSTATE '22012' USING MESSAGE = 'Division by zero'`);
    });

    it("supports RAISE condition_name", () => {
      testWc(`RAISE division_by_zero`);
      testWc(`RAISE WARNING division_by_zero USING MESSAGE = 'Division by zero'`);
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("does not support RAISE statement", () => {
      expect(() => parse("RAISE")).toThrow();
    });
  });
});
