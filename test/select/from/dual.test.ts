import { dialect, notDialect, parseFrom, testWc } from "../../test_utils";

describe("select FROM DUAL", () => {
  dialect(["mysql", "mariadb"], () => {
    it("supports FROM DUAL", () => {
      testWc("SELECT 1 FROM DUAL");
    });

    it("parses FROM DUAL", () => {
      expect(parseFrom("DUAL")).toMatchInlineSnapshot(`
        {
          "dualKw": {
            "name": "DUAL",
            "text": "DUAL",
            "type": "keyword",
          },
          "type": "dual_table",
        }
      `);
    });
  });

  notDialect(["mysql", "mariadb"], () => {
    it("parses DUAL as ordinary identifier", () => {
      expect(parseFrom("DUAL")).toMatchInlineSnapshot(`
        {
          "name": "DUAL",
          "text": "DUAL",
          "type": "identifier",
        }
      `);
    });
  });
});
