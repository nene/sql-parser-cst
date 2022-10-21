import { test } from "./test_utils";

describe("window functions", () => {
  it("supports referring to named window", () => {
    test(`SELECT row_number() OVER my_win`);
    test(`SELECT row_number() OVER /*c*/ my_win`);
  });

  it("supports empty window specification", () => {
    test(`SELECT row_number() OVER ()`);
    test(`SELECT row_number() OVER (/*c*/)`);
  });

  it("supports PARTITION BY", () => {
    test(`SELECT sum(profit) OVER (PARTITION BY product)`);
    test(
      `SELECT sum(profit) /*c1*/ OVER /*c2*/ ( /*c3*/ PARTITION /*c4*/ BY /*c5*/ product /*c6*/ )`
    );
  });

  it("supports ORDER BY", () => {
    test(`SELECT row_number() OVER (ORDER BY col)`);
    test(`SELECT row_number() /*c1*/ OVER /*c2*/ ( /*c3*/ ORDER BY col /*c4*/ )`);
  });

  it("supports base window", () => {
    test(`SELECT row_number() OVER (my_win)`);
    test(`SELECT row_number() OVER (my_win PARTITION BY product)`);
    test(`SELECT row_number() OVER (my_win PARTITION BY product ORDER BY price)`);
    test(`SELECT row_number() OVER (/*c1*/ my_win /*c2*/)`);
  });
});
