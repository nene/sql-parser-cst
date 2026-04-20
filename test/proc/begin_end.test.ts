import { dialect, parse, test, testWc } from "../test_utils";

describe("BEGIN..END", () => {
  dialect(["mysql", "mariadb", "bigquery", "plpgsql"], () => {
    it("supports BEGIN..END block", () => {
      testWc(`
        BEGIN
          SELECT 1;
          SELECT 2;
        END
      `);
    });

    it("supports nested BEGIN..END block", () => {
      testWc(`
        BEGIN
          SELECT 1;
          BEGIN
            SELECT 2;
          END;
        END
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports transactions inside BEGIN..END", () => {
      testWc(`
        BEGIN
          BEGIN;
          SELECT 1;
          COMMIT;
        END
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports begin label: (with colon)", () => {
      test(`
        my_label: BEGIN
          SELECT 1;
        END
      `);
      testWc(`
        my_label : BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports end label", () => {
      testWc(`
        my_label: BEGIN
          SELECT 1;
        END my_label
      `);
    });
  });

  dialect(["plpgsql"], () => {
    it("supports begin <<label>> (with chevrons)", () => {
      test(`
        <<my_label>> BEGIN
          SELECT 1;
        END
      `);
      testWc(`
        << my_label >> BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports end label", () => {
      testWc(`
        <<my_label>> BEGIN
          SELECT 1;
        END my_label
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports breaking out with LEAVE", () => {
      testWc(`
        BEGIN
          IF x > 10 THEN
            LEAVE;
          END IF;
        END
      `);
    });

    it("supports breaking out with labeled LEAVE", () => {
      testWc(`
        my_block: BEGIN
          IF x > 10 THEN
            LEAVE my_block;
          END IF;
        END
      `);
    });
  });

  dialect("bigquery", () => {
    it("supports breaking out with BREAK", () => {
      testWc(`
        BEGIN
          IF x > 10 THEN
            BREAK;
          END IF;
        END
      `);
    });

    it("supports breaking out with labeled BREAK", () => {
      testWc(`
        my_block: BEGIN
          IF x > 10 THEN
            BREAK my_block;
          END IF;
        END
      `);
    });
  });

  dialect("plpgsql", () => {
    it("supports breaking out with EXIT", () => {
      testWc(`
        BEGIN
          IF x > 10 THEN
            EXIT;
          END IF;
        END
      `);
    });

    it("supports breaking out with labeled EXIT", () => {
      testWc(`
        <<my_block>> BEGIN
          IF x > 10 THEN
            EXIT my_block;
          END IF;
        END
      `);
    });
  });

  dialect(["mysql", "mariadb", "bigquery"], () => {
    it("supports continuing with ITERATE", () => {
      testWc(`
        BEGIN
          IF x = 10 THEN
            ITERATE;
          END IF;
        END
      `);
    });

    it("supports continuing with labeled ITERATE", () => {
      testWc(`
        my_block: BEGIN
          IF x = 10 THEN
            ITERATE my_block;
          END IF;
        END
      `);
    });
  });

  dialect(["bigquery", "plpgsql"], () => {
    it("supports continuing with CONTINUE", () => {
      testWc(`
        BEGIN
          IF x = 10 THEN
            CONTINUE;
          END IF;
        END
      `);
    });

    it("supports continuing with labeled CONTINUE", () => {
      testWc(`
        BEGIN
          IF x = 10 THEN
            CONTINUE my_block;
          END IF;
        END
      `);
    });
  });

  dialect(["bigquery", "plpgsql"], () => {
    it("supports empty BEGIN..END", () => {
      testWc(`BEGIN END;`);
    });
  });

  dialect("bigquery", () => {
    it("supports BEGIN..EXCEPTION..END", () => {
      testWc(`
        BEGIN
          SELECT 1;
          SELECT 2;
        EXCEPTION WHEN ERROR THEN
          SELECT 'err1';
          SELECT 'err2';
        END
      `);
    });

    it("supports empty EXCEPTION block", () => {
      testWc(`BEGIN SELECT 1; EXCEPTION WHEN ERROR THEN END;`);
    });

    it("supports empty EXCEPTION within empty BEGIN..END", () => {
      testWc(`BEGIN EXCEPTION WHEN ERROR THEN END;`);
    });
  });

  dialect("plpgsql", () => {
    it("supports DECLARE..BEGIN..END", () => {
      testWc(`
        DECLARE
          my_var INT;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports DECLARE with DEFAULT", () => {
      testWc(`
        DECLARE
          my_var1 INT DEFAULT 1;
          my_var2 TEXT := 'hello';
          my_var3 BOOLEAN = TRUE;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it("supports CONSTANT", () => {
      testWc(`
        DECLARE
          my_var1 CONSTANT INT;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it.skip("supports NOT NULL", () => {
      testWc(`
        DECLARE
          my_var1 INT NOT NULL;
        BEGIN
          SELECT 1;
        END
      `);
    });

    it.skip("supports COLLATE", () => {
      testWc(`
        DECLARE
          my_var1 TEXT COLLATE "utf8_general_ci";
        BEGIN
          SELECT 1;
        END
      `);
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support BEGIN..END block", () => {
      expect(() => parse("BEGIN SELECT 1; END")).toThrow();
    });
  });
});
