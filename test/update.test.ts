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

  // This is seemingly ambiguous syntax,
  // which was explicitly not supported in the original parser code.
  // But there's actually no ambiguity and its supported by actual databases.
  it("supports comparison inside assignment expression", () => {
    test("UPDATE tbl SET flag = col=1 OR col=2");
  });

  it("supports updating multiple tables", () => {
    test("UPDATE items, month SET items.price = month.price");
    test("UPDATE items /*c1*/,/*c2*/ month SET items.price = month.price");
  });

  it("supports aliased table names", () => {
    test("UPDATE items AS i SET price = 0");
    test("UPDATE items i SET price = 0");
    test("UPDATE items /*c1*/ AS /*c2*/ i SET price = 0");
  });

  dialect("sqlite", () => {
    it("supports INDEXED BY & NOT INDEXED modifiers on table name", () => {
      test("UPDATE my_table INDEXED BY my_idx SET x=1");
      test("UPDATE my_table NOT INDEXED SET x=1");
    });
  });

  dialect("mysql", () => {
    it("supports setting explicit default values", () => {
      test("UPDATE person SET age = DEFAULT");
    });
  });

  dialect("mysql", () => {
    it("supports LOW_PRIORITY option", () => {
      test("UPDATE LOW_PRIORITY tbl SET x=1");
    });
    it("supports IGNORE option", () => {
      test("UPDATE IGNORE tbl SET x=1");
      test("UPDATE /*c1*/ LOW_PRIORITY /*c2*/ IGNORE /*c3*/ tbl SET x=1");
    });
  });

  dialect("sqlite", () => {
    it("supports UPDATE OR ... options", () => {
      test("UPDATE OR ABORT tbl SET x=1");
      test("UPDATE OR FAIL tbl SET x=1");
      test("UPDATE OR IGNORE tbl SET x=1");
      test("UPDATE OR REPLACE tbl SET x=1");
      test("UPDATE OR ROLLBACK tbl SET x=1");
      test("UPDATE /*c1*/ OR /*c2*/ ABORT /*c3*/ tbl SET x=1");
    });
  });

  dialect("sqlite", () => {
    it("supports assigning list of values to list of columns", () => {
      test("UPDATE tbl SET (id, name) = (1, 'John')");
    });
  });

  dialect("sqlite", () => {
    it("supports WITH ... UPDATE ...", () => {
      test("WITH subsel AS (SELECT 1) UPDATE tbl SET col1 = 2");
      test("WITH subsel AS (SELECT 1) /*c*/ UPDATE tbl SET col1 = 2");
    });
  });

  dialect("sqlite", () => {
    it("supports UPDATE ... FROM ...", () => {
      test("UPDATE tbl SET col1 = 2 FROM foo JOIN bar USING (id) WHERE foo.age > 0");
      test("UPDATE tbl SET col1 = 2 /*c1*/ FROM foo /*c2*/ WHERE true");
    });
  });

  dialect("sqlite", () => {
    it("supports UPDATE ... RETURNING ...", () => {
      test("UPDATE tbl SET col1 = 2 RETURNING col1, col2");
      test("UPDATE tbl SET col1 = 2 RETURNING *");
      test("UPDATE tbl SET col1 = 2 /*c1*/ RETURNING /*c2*/ *");
    });
  });

  dialect(["mysql", "sqlite"], () => {
    it("supports UPDATE ... ORDER BY ...", () => {
      test("UPDATE tbl SET col1 = 2 ORDER BY col1");
      test("UPDATE tbl SET col1 = 2 /*c1*/ ORDER BY col1");
    });
    it("supports UPDATE ... LIMIT ...", () => {
      test("UPDATE tbl SET col1 = 2 LIMIT 20");
      test("UPDATE tbl SET col1 = 2 /*c1*/ LIMIT 20");
    });
  });
});
