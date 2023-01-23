import { includeAll, test } from "./test_utils";

describe("bound parameters", () => {
  describe("by default no parameters are supported", () => {
    it("no support for ? parameters", () => {
      expect(() => test("SELECT * FROM foo WHERE x = ?")).toThrowError();
    });
    it("no support for ?nr parameters", () => {
      expect(() => test("SELECT * FROM foo WHERE x = ?5")).toThrowError();
    });
    it("no support for :name parameters", () => {
      expect(() => test("SELECT * FROM foo WHERE x = :foo")).toThrowError();
    });
    it("no support for @name parameters", () => {
      expect(() => test("SELECT * FROM foo WHERE x = @foo")).toThrowError();
    });
    it("no support for $name parameters", () => {
      expect(() => test("SELECT * FROM foo WHERE x = $foo")).toThrowError();
    });
  });

  describe("when paramTypes includes '?'", () => {
    it("supports ? parameter placeholders", () => {
      test("SELECT * FROM foo WHERE x = ? AND y = ?", { paramTypes: ["?"], ...includeAll });
    });
  });

  describe("when paramTypes includes '?nr'", () => {
    it("supports ?nr parameter placeholders", () => {
      test("SELECT * FROM foo WHERE x = ?1 AND y = ?2", { paramTypes: ["?nr"], ...includeAll });
    });
  });

  describe("when paramTypes includes ':name'", () => {
    it("supports :name parameter placeholders", () => {
      test("SELECT * FROM foo WHERE x = :foo AND y = :bar", {
        paramTypes: [":name"],
        ...includeAll,
      });
    });
  });

  describe("when paramTypes includes '@name'", () => {
    it("supports @name parameter placeholders", () => {
      test("SELECT * FROM foo WHERE x = @foo AND y = @bar", {
        paramTypes: ["@name"],
        ...includeAll,
      });
    });
  });

  describe("when paramTypes includes '$name'", () => {
    it("supports $name parameter placeholders", () => {
      test("SELECT * FROM foo WHERE x = $foo AND y = $bar", {
        paramTypes: ["$name"],
        ...includeAll,
      });
    });
  });
});
