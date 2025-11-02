import { dialect, notDialect, parse, testWc } from "../test_utils";

describe("SUBSCRIPTION", () => {
  dialect("postgresql", () => {
    describe("CREATE SUBSCRIPTION", () => {
      it("supports CREATE SUBSCRIPTION", () => {
        testWc(`
          CREATE SUBSCRIPTION mysub
          CONNECTION 'host=192.168.1.50 port=5432 user=foo dbname=foodb'
          PUBLICATION mypublication, insert_only
        `);
      });

      it("supports WITH (options)", () => {
        testWc(`
          CREATE SUBSCRIPTION mysub
          CONNECTION 'connstr'
          PUBLICATION mypublication
          WITH (connect = true, slot_name = 'myslot')
        `);
      });
    });

    describe("DROP SUBSCRIPTION", () => {
      it("supports DROP SUBSCRIPTION", () => {
        testWc(`DROP SUBSCRIPTION foo`);
      });

      it("supports IF EXISTS", () => {
        testWc(`DROP SUBSCRIPTION IF EXISTS foo`);
      });

      it("supports CASCADE and RESTRICT", () => {
        testWc(`DROP SUBSCRIPTION foo CASCADE`);
        testWc(`DROP SUBSCRIPTION foo RESTRICT`);
      });
    });
  });

  notDialect("postgresql", () => {
    it("does not support DROP SUBSCRIPTION", () => {
      expect(() => parse("DROP SUBSCRIPTION foo")).toThrowError();
    });
  });
});
