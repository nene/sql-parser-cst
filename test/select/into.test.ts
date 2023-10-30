import { dialect, testWc } from "../test_utils";

describe("select INTO", () => {
  dialect(["mysql", "mariadb"], () => {
    it("supports INTO @varname", () => {
      testWc("SELECT col FROM t INTO @var");
      testWc("SELECT 1 INTO @var1, @var2, @var3");
    });

    it("supports INTO DUMPFILE", () => {
      testWc("SELECT * FROM t INTO DUMPFILE '/file/name.txt'");
    });

    it("supports INTO OUTFILE", () => {
      testWc("SELECT * FROM t INTO OUTFILE '/file/name.txt'");
    });

    it("supports INTO OUTFILE with fields/lines options", () => {
      testWc(`
        SELECT * FROM t
        INTO OUTFILE '/file/name.txt'
          FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '^'
          LINES STARTING BY '!' TERMINATED BY '\\n'
      `);
      testWc(`
        SELECT * FROM t
        INTO OUTFILE '/file/name.txt'
          COLUMNS OPTIONALLY ENCLOSED BY '"'
      `);
      testWc(`
        SELECT * FROM t
        INTO OUTFILE '/file/name.txt'
          LINES TERMINATED BY 'x'
      `);
    });

    it("supports INTO OUTFILE with charset", () => {
      testWc(`
        SELECT * FROM t INTO OUTFILE '/file/name.txt'
        CHARACTER SET utf8 COLUMNS TERMINATED BY ','
      `);
    });
  });

  dialect("postgresql", () => {
    it("supports INTO [TABLE] tablename", () => {
      testWc("SELECT col INTO new_table FROM source_table");
      testWc("SELECT 1,2,3 INTO TABLE my_table");
    });

    it("supports INTO TEMPORARY TABLE", () => {
      testWc("SELECT col INTO TEMP my_table FROM source_table");
      testWc("SELECT col INTO TEMPORARY my_table FROM source_table");
      testWc("SELECT col INTO TEMPORARY TABLE my_table FROM source_table");
    });

    it("supports INTO UNLOGGED TABLE", () => {
      testWc("SELECT col INTO UNLOGGED my_table FROM source_table");
      testWc("SELECT col INTO UNLOGGED TABLE my_table FROM source_table");
    });
  });

  dialect(["bigquery", "sqlite"], () => {
    it("does not support INTO clause", () => {
      expect(() => testWc("SELECT 1 INTO @varname")).toThrowError();
    });
  });
});
