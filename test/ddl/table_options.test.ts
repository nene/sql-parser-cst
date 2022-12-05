import { dialect, parse, preserveAll, show } from "../test_utils";

describe("table options", () => {
  function testOpts(options: string) {
    const sql = `CREATE TABLE t (id INT) ${options}`;
    expect(show(parse(sql, preserveAll))).toBe(sql);
  }

  dialect("sqlite", () => {
    it("supports CREATE TABLE with STRICT & WITHOUT ROWID options", () => {
      testOpts("STRICT");
      testOpts("WITHOUT ROWID");
      testOpts("STRICT, WITHOUT ROWID");
      testOpts("/*c0*/ STRICT /*c1*/,/*c2*/ WITHOUT /*c3*/ ROWID");
    });
  });

  dialect("mysql", () => {
    (
      [
        ["AUTOEXTEND_SIZE", ["15"]],
        ["AUTO_INCREMENT", ["24"]],
        ["AVG_ROW_LENGTH", ["100"]],
        ["DEFAULT CHARACTER SET", ["utf8"]],
        ["CHARACTER SET", ["latin1"]],
        ["CHECKSUM", ["1", "0"]],
        ["DEFAULT COLLATE", ["utf8mb4_bin"]],
        ["COLLATE", ["utf8mb4_bin"]],
        ["COMMENT", ["'Hello'", '"world"']],
        ["COMPRESSION", ["'ZLIB'", "'LZ4'", "'NONE'"]],
        ["CONNECTION", ["'some connect string'"]],
        ["DATA DIRECTORY", ["'/path/to/dir'"]],
        ["INDEX DIRECTORY", ["'/path/to/dir'"]],
        ["DELAY_KEY_WRITE", ["0", "1"]],
        ["ENCRYPTION", ["'Y'", "'N'"]],
        ["ENGINE", ["INNODB", "MYISAM", "MEMORY"]],
        ["ENGINE_ATTRIBUTE", ["'some_attr'"]],
        ["INSERT_METHOD", ["NO", "FIRST", "LAST"]],
        ["KEY_BLOCK_SIZE", ["100"]],
        ["MAX_ROWS", ["9999"]],
        ["MIN_ROWS", ["10"]],
        ["PACK_KEYS", ["0", "1", "DEFAULT"]],
        ["PASSWORD", ["'santa-clause123'"]],
        ["ROW_FORMAT", ["DEFAULT", "DYNAMIC", "FIXED", "COMPRESSED", "REDUNDANT", "COMPACT"]],
        ["SECONDARY_ENGINE_ATTRIBUTE", ["'some_attr'"]],
        ["STATS_AUTO_RECALC", ["0", "1", "DEFAULT"]],
        ["STATS_PERSISTENT", ["0", "1", "DEFAULT"]],
        ["STATS_SAMPLE_PAGES", ["18"]],
      ] as [string, string[]][]
    ).forEach(([name, values]) => {
      values.forEach((value) => {
        it(`${name} = ${value}`, () => {
          testOpts(`${name} = ${value}`);
          testOpts(`${name} ${value}`);
          testOpts(`${name} /*c1*/ = /*c2*/ ${value}`);
        });
      });
    });

    it("supports START TRANSACTION option", () => {
      testOpts(`START TRANSACTION`);
      testOpts(`START /*c1*/ TRANSACTION`);
    });

    // TODO: TABLESPACE tablespace_name [STORAGE {DISK | MEMORY}]
    // TODO: UNION [=] (tbl_name[,tbl_name]...)
  });

  dialect("bigquery", () => {
    it.skip("supports DEFAULT COLLATE option", () => {
      testOpts(`DEFAULT COLLATE 'und:ci'`);
    });
    it("supports OPTIONS()", () => {
      testOpts(`OPTIONS(description = 'Hello', friendly_name = 'Blah')`);
    });
  });
});
