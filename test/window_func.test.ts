import { test } from "./test_utils";

describe("window functions", () => {
  it("supports empty window specification", () => {
    test(`SELECT row_number() OVER ()`);
    test(`SELECT row_number() OVER (/*c*/)`);
  });

  it("supports ORDER BY", () => {
    test(`SELECT row_number() OVER (ORDER BY col)`);
    test(`SELECT row_number() /*c1*/ OVER /*c2*/ ( /*c3*/ ORDER BY col /*c4*/ )`);
  });
});
