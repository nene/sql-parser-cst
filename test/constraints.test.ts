import { parse, preserveAll, show, test } from "./test_utils";

describe("constraints", () => {
  describe("column constraints", () => {
    it("parses multiple constraints after column data type", () => {
      test(`CREATE TABLE foo (
        id INT /*c1*/ NOT /*c2*/ NULL /*c3*/ DEFAULT /*c4*/ 5 /*c5*/
      )`);
    });

    function testColConst(constraint: string) {
      const sql = `CREATE TABLE t (id INT ${constraint})`;
      expect(show(parse(sql, preserveAll))).toBe(sql);
    }

    it("NULL / NOT NULL", () => {
      testColConst("NULL");
      testColConst("NOT NULL");
      testColConst("NOT /*c2*/ NULL");
    });

    it("DEFAULT", () => {
      testColConst("DEFAULT 10");
      testColConst("DEFAULT (5 + 6 > 0 AND true)");
      testColConst("DEFAULT /*c1*/ 10");
    });

    it("AUTO_INCREMENT", () => {
      testColConst("AUTO_INCREMENT");
      testColConst("AUTO_increment");
    });

    it("UNIQUE KEY / PRIMARY KEY", () => {
      testColConst("KEY");
      testColConst("UNIQUE");
      testColConst("UNIQUE KEY");
      testColConst("PRIMARY KEY");
      testColConst("UNIQUE /*c*/ KEY");
      testColConst("PRIMARY /*c*/ KEY");
    });

    it("COMMENT", () => {
      testColConst("COMMENT 'Hello, world!'");
      testColConst("COMMENT /*c*/ 'Hi'");
    });
  });

  describe("table constraints", () => {
    it("supports multiple table constraints inside CREATE TABLE", () => {
      test(`CREATE TABLE tbl (
        id INT,
        PRIMARY KEY (id)
      )`);
    });

    function testTblConst(constraint: string) {
      const sql = `CREATE TABLE t (${constraint})`;
      expect(show(parse(sql, preserveAll))).toBe(sql);
    }

    it("PRIMARY KEY", () => {
      testTblConst("PRIMARY KEY (id)");
      testTblConst("PRIMARY KEY (id, name)");
      testTblConst("CONSTRAINT PRIMARY KEY (id)");
      testTblConst("CONSTRAINT prim_key PRIMARY KEY (id)");
      testTblConst(
        "CONSTRAINT /*c1*/ prim_key /*c2*/ PRIMARY /*c3*/ KEY /*c4*/ ( /*c5*/ id /*c6*/,/*c7*/ name /*c8*/ )"
      );
    });
  });
});
