import { dialect, parse, preserveAll, show, test } from "./test_utils";

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
        PRIMARY KEY (id),
        UNIQUE (id)
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

    it("UNIQUE", () => {
      testTblConst("UNIQUE (id)");
      testTblConst("UNIQUE KEY (id, name)");
      testTblConst("UNIQUE INDEX (id)");
      testTblConst("CONSTRAINT UNIQUE (id)");
      testTblConst("CONSTRAINT u_key UNIQUE KEY (id)");
      testTblConst(
        "CONSTRAINT /*c1*/ u_key /*c2*/ UNIQUE /*c3*/ KEY /*c4*/ ( /*c5*/ id /*c6*/,/*c7*/ name /*c8*/ )"
      );
    });

    it("CHECK", () => {
      testTblConst("CHECK (col > 10)");
      testTblConst("CONSTRAINT CHECK (true)");
      testTblConst("CONSTRAINT check_c CHECK (false)");
      testTblConst("CONSTRAINT /*c1*/ check_c /*c2*/ CHECK /*c3*/ (/*c4*/ true /*c5*/)");
    });

    describe("FOREIGN KEY", () => {
      it("basic FOREIGN KEY", () => {
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id)");
        testTblConst("FOREIGN KEY (id, name) REFERENCES tbl2 (id, name)");
        testTblConst("CONSTRAINT FOREIGN KEY (id) REFERENCES tbl2 (t2_id)");
        testTblConst("CONSTRAINT f_key FOREIGN KEY (id) REFERENCES tbl2 (id)");
        testTblConst(
          `CONSTRAINT /*c1*/ f_key /*c2*/
          FOREIGN /*c3*/ KEY /*c4*/ (/*c5*/ id /*c6*/) /*c7*/
          REFERENCES /*c8*/ tbl2 /*c9*/ (/*c10*/ t2id /*c11*/)`
        );
      });

      dialect("sqlite", () => {
        it("column names are optional in REFERENCES-clause", () => {
          testTblConst("FOREIGN KEY (id) REFERENCES tbl2");
        });
      });

      it("supports ON DELETE/UPDATE actions", () => {
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) ON UPDATE RESTRICT");
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE CASCADE");
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) ON UPDATE SET NULL");
        testTblConst(
          "FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE SET DEFAULT ON UPDATE NO ACTION"
        );
        testTblConst(
          `FOREIGN KEY (id) REFERENCES tbl2 (id)
          ON /*c1*/ DELETE /*c2*/ SET /*c3*/ DEFAULT /*c4*/
          ON /*c5*/ UPDATE /*c6*/ NO /*c7*/ ACTION`
        );
      });

      it("supports MATCH types", () => {
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH FULL");
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH PARTIAL");
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH SIMPLE");
        testTblConst(`FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH /*c1*/ FULL`);
      });

      it("supports combining MATCH type and ON UPDATE/DELETE", () => {
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) MATCH FULL ON UPDATE CASCADE");
        testTblConst("FOREIGN KEY (id) REFERENCES tbl2 (id) ON DELETE SET NULL MATCH SIMPLE");
      });
    });
  });
});
