import { dialect, parse, testWc, test } from "./test_utils";

describe("prepared statements", () => {
  dialect("mysql", () => {
    it("supports EXECUTE", () => {
      testWc(`EXECUTE my_stmt`);
    });
  });

  dialect("bigquery", () => {
    it("supports EXECUTE IMMEDIATE", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT 1'`);
    });

    it("supports EXECUTE IMMEDIATE with more complex expression", () => {
      test(`EXECUTE IMMEDIATE 'SELECT 1' || ', 2'`);
    });

    it("supports USING with positional values", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT ?, ?' USING 1, 2`);
    });

    it("supports USING with labeled values", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT @a, @b' USING 1 as b , 2 as a`);
    });

    it("supports INTO with single variable", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT 1' INTO my_var`);
    });

    it("supports INTO with multiple variables", () => {
      testWc(`EXECUTE IMMEDIATE 'SELECT 1, 2' INTO var1, var2`);
    });

    it("supports INTO + USING", () => {
      test(`EXECUTE IMMEDIATE 'SELECT ?' INTO var1 USING 8`);
    });
  });

  dialect("sqlite", () => {
    it("does not support EXECUTE statement", () => {
      expect(() => parse(`EXECUTE my_stmt`)).toThrowError();
    });
  });
});
