import { dialect, parse, test, testWc } from "../test_utils";

describe("BEGIN..END", () => {
  dialect(["mysql", "mariadb", "bigquery"], () => {
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

    it("supports transactions inside BEGIN..END", () => {
      testWc(`
        BEGIN
          BEGIN;
          SELECT 1;
          COMMIT;
        END
      `);
    });

    it("supports begin label", () => {
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

    it("supports breaking out with LEAVE", () => {
      testWc(`
        BEGIN
          if x > 10 THEN
            LEAVE;
          END IF;
        END
      `);
    });

    it("supports breaking out with labeled LEAVE", () => {
      testWc(`
        my_block: BEGIN
          if x > 10 THEN
            LEAVE my_block;
          END IF;
        END
      `);
    });

    dialect("bigquery", () => {
      it("supports breaking out with BREAK", () => {
        testWc(`
          BEGIN
            if x > 10 THEN
              BREAK;
            END IF;
          END
        `);
      });

      it("supports breaking out with labeled BREAK", () => {
        testWc(`
          my_block: BEGIN
            if x > 10 THEN
              BREAK my_block;
            END IF;
          END
        `);
      });
    });

    it("supports continuing with ITERATE", () => {
      testWc(`
        BEGIN
          if x = 10 THEN
            ITERATE;
          END IF;
        END
      `);
    });

    it("supports continuing with labeled ITERATE", () => {
      testWc(`
        my_block: BEGIN
          if x = 10 THEN
            ITERATE my_block;
          END IF;
        END
      `);
    });

    dialect("bigquery", () => {
      it("supports continuing with CONTINUE", () => {
        testWc(`
          BEGIN
            if x = 10 THEN
              CONTINUE;
            END IF;
          END
        `);
      });

      it("supports continuing with labeled CONTINUE", () => {
        testWc(`
          my_block: BEGIN
            if x = 10 THEN
              CONTINUE my_block;
            END IF;
          END
        `);
      });
    });
  });

  dialect("bigquery", () => {
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

  dialect("sqlite", () => {
    it("does not support BEGIN..END block", () => {
      expect(() => parse("BEGIN SELECT 1; END")).toThrowError();
    });
  });

  dialect("postgresql", () => {
    it("TODO:postgres", () => {
      expect(true).toBe(true);
    });
  });
});
