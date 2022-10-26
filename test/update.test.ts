import { dialect, test } from "./test_utils";

describe("update", () => {
  it("supports UPDATE .. SET without where", () => {
    test("UPDATE tbl SET col1 = 15, col2 = 'hello'");
    test("UPDATE db.tbl SET x=2");
  });

  it("supports UPDATE .. SET .. WHERE", () => {
    test("UPDATE tbl SET x=1, y=2, z=3 WHERE id = 8");
    test(
      "UPDATE /*c1*/ tbl /*c2*/ SET /*c3*/ x/*c4*/=/*c5*/1/*c6*/, /*c7*/y/*c8*/=/*c9*/2/*c10*/ WHERE /*c11*/ true"
    );
  });

  dialect("sqlite", () => {
    it("supports updating multiple tables", () => {
      test("UPDATE tbl1, tbl2, tbl3 SET x=2");
    });
  });
});
