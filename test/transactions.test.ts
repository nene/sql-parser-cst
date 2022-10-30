import { dialect, test } from "./test_utils";

describe("transactions", () => {
  describe("starting transaction", () => {
    // standard syntax
    dialect("mysql", () => {
      it("supports START TRANSACTION", () => {
        test("START TRANSACTION");
        test("START /*c1*/ TRANSACTION");
      });
    });

    it("supports BEGIN", () => {
      test("BEGIN");
    });

    dialect("sqlite", () => {
      it("supports BEGIN TRANSACTION", () => {
        test("BEGIN TRANSACTION");
        test("BEGIN /*c1*/ TRANSACTION");
      });

      it("supports BEGIN kind TRANSACTION", () => {
        test("BEGIN DEFERRED TRANSACTION");
        test("BEGIN IMMEDIATE TRANSACTION");
        test("BEGIN EXCLUSIVE TRANSACTION");
        test("BEGIN /*c1*/ EXCLUSIVE /*c2*/ TRANSACTION");
      });
    });

    dialect("mysql", () => {
      it("supports BEGIN WORK", () => {
        test("BEGIN WORK");
        test("BEGIN /**/ WORK");
      });
    });
  });

  describe("committing transaction", () => {
    // standard syntax
    it("supports COMMIT", () => {
      test("COMMIT");
    });

    dialect("sqlite", () => {
      it("supports COMMIT TRANSACTION", () => {
        test("COMMIT TRANSACTION");
        test("COMMIT /*c1*/ TRANSACTION");
      });

      it("supports END [TRANSACTION]", () => {
        test("END TRANSACTION");
        test("END");
        test("END /*c1*/ TRANSACTION");
      });
    });

    dialect("mysql", () => {
      it("supports COMMIT WORK", () => {
        test("COMMIT WORK");
        test("COMMIT /*c1*/ WORK");
      });
    });
  });

  describe("rolling back a transaction", () => {
    // standard syntax
    it("supports ROLLBACK", () => {
      test("ROLLBACK");
    });

    dialect("sqlite", () => {
      it("supports ROLLBACK TRANSACTION", () => {
        test("ROLLBACK TRANSACTION");
        test("ROLLBACK /*c1*/ TRANSACTION");
      });
    });

    dialect("mysql", () => {
      it("supports ROLLBACK WORK", () => {
        test("ROLLBACK WORK");
        test("ROLLBACK /*c1*/ WORK");
      });
    });
  });

  // describe("supports savepoints", () => {
  //   it("supports ROLLBACK [TRANSACTION] TO [SAVEPOINT]", () => {
  //     test("ROLLBACK TRANSACTION");
  //     test("ROLLBACK TO SAVEPOINT my_savepoint");
  //     test("ROLLBACK TO my_savepoint");
  //     test("ROLLBACK /*c1*/ TRANSACTION /*c2*/ TO /*c3*/ my_savepoint");
  //   });
  // });
});
