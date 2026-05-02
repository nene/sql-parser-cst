import { dialect, testWc } from "../test_utils";

describe("exiting block statements", () => {
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

    it("supports conditional breaking out with EXIT WHEN", () => {
      testWc(`
        <<my_block>> BEGIN
          IF x > 10 THEN
            EXIT my_block WHEN x > 10;
          ELSE
            EXIT WHEN x > 10;
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

    dialect("plpgsql", () => {
      it("supports conditional continuing with CONTINUE WHEN", () => {
        testWc(`
          BEGIN
            IF x = 10 THEN
              CONTINUE my_block WHEN x = 10;
            ELSE
              CONTINUE WHEN x = 10;
            END IF;
          END
        `);
      });
    });
  });

  dialect(["sqlite", "postgresql"], () => {
    it("does not support blocks", () => {
      expect(() => test(`BEGIN SELECT 1; END`)).toThrow();
    });
  });
});
