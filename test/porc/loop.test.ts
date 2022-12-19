import { dialect, parse, testWc } from "../test_utils";

describe("LOOP", () => {
  dialect(["bigquery", "mysql"], () => {
    it("supports basic infinite LOOP", () => {
      testWc(`
        LOOP
          SET x = x + 1;
        END LOOP
      `);
    });

    it("supports begin label", () => {
      testWc(`
        my_label: LOOP
          SELECT 1;
        END LOOP
      `);
    });

    it("supports end label", () => {
      testWc(`
        my_label: LOOP
          SELECT 1;
        END LOOP my_label
      `);
    });

    it("supports breaking out of LOOP with LEAVE", () => {
      testWc(`
        LOOP
          SET x = x + 1;
          if x > 10 THEN
            LEAVE;
          END IF;
        END LOOP
      `);
    });

    dialect("bigquery", () => {
      it("supports breaking out of LOOP with BREAK", () => {
        testWc(`
          LOOP
            SET x = x + 1;
            if x > 10 THEN
              BREAK;
            END IF;
          END LOOP
        `);
      });
    });

    it("supports continuing LOOP with ITERATE", () => {
      testWc(`
        LOOP
          SET x = x + 1;
          if x = 10 THEN
            ITERATE;
          END IF;
        END LOOP
      `);
    });

    dialect("bigquery", () => {
      it("supports continuing LOOP with CONTINUE", () => {
        testWc(`
          LOOP
            SET x = x + 1;
            if x = 10 THEN
              CONTINUE;
            END IF;
          END LOOP
        `);
      });
    });
  });

  dialect("sqlite", () => {
    it("does not support LOOP statement", () => {
      expect(() => parse("LOOP SELECT 1; END LOOP")).toThrowError();
    });
  });
});
