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
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql"], () => {
    it("does not support RAISE statement", () => {
      expect(() => parse("RAISE")).toThrow();
    });
  });
});
