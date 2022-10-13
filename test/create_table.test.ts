import { test } from "./test_utils";

describe("create table", () => {
  it("parses simple CREATE TABLE statement", () => {
    test("CREATE TABLE foo");
    test("CREATE TEMPORARY TABLE foo");
    test("CREATE TABLE IF NOT EXISTS foo");
    test("create /*c1*/ temporary /*c2*/ table /*c3*/ if /*c4*/ not /*c5*/ exists /*c6*/ foo");
  });
});
