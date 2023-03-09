import { dialect, test, withComments } from "../test_utils";

describe("table options", () => {
  function testOptsWc(options: string) {
    test(`CREATE TABLE t (id INT) ${withComments(options)}`);
  }

  dialect("sqlite", () => {
    it("supports CREATE TABLE with STRICT & WITHOUT ROWID options", () => {
      testOptsWc("STRICT");
      testOptsWc("WITHOUT ROWID");
      testOptsWc("STRICT, WITHOUT ROWID");
    });
  });

  dialect(["mysql", "mariadb"], () => {
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
          testOptsWc(`${name} = ${value}`);
          testOptsWc(`${name} ${value}`);
        });
      });
    });

    it("supports START TRANSACTION option", () => {
      testOptsWc(`START TRANSACTION`);
    });

    // TODO: TABLESPACE tablespace_name [STORAGE {DISK | MEMORY}]
    // TODO: UNION [=] (tbl_name[,tbl_name]...)
  });

  dialect("bigquery", () => {
    it("supports DEFAULT COLLATE option", () => {
      testOptsWc(`DEFAULT COLLATE 'und:ci'`);
    });

    it("supports OPTIONS()", () => {
      testOptsWc(`OPTIONS(description = 'Hello', friendly_name = 'Blah')`);
    });

    it("supports PARTITION BY", () => {
      testOptsWc(`PARTITION BY DATE(_PARTITIONTIME)`);
      testOptsWc(`PARTITION BY _PARTITIONTIME`);
    });

    it("supports CLUSTER BY", () => {
      testOptsWc(`CLUSTER BY col1, col2, col3`);
    });
  });
});
