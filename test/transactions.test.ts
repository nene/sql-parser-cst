import { dialect, testWc } from "./test_utils";

describe("transactions", () => {
  describe("starting transaction", () => {
    // standard syntax
    dialect(["mysql", "mariadb", "postgresql"], () => {
      it("supports START TRANSACTION", () => {
        testWc("START TRANSACTION");
      });
    });

    it("supports BEGIN", () => {
      testWc("BEGIN");
    });

    dialect(["sqlite", "bigquery", "postgresql"], () => {
      it("supports BEGIN TRANSACTION", () => {
        testWc("BEGIN TRANSACTION");
      });
    });

    dialect("sqlite", () => {
      it("supports BEGIN kind TRANSACTION", () => {
        testWc("BEGIN DEFERRED TRANSACTION");
        testWc("BEGIN IMMEDIATE TRANSACTION");
        testWc("BEGIN EXCLUSIVE TRANSACTION");
      });
    });

    dialect(["mysql", "mariadb", "postgresql"], () => {
      it("supports BEGIN WORK", () => {
        testWc("BEGIN WORK");
      });
    });
  });

  describe("committing transaction", () => {
    // standard syntax
    it("supports COMMIT", () => {
      testWc("COMMIT");
    });

    dialect(["sqlite", "bigquery"], () => {
      it("supports COMMIT TRANSACTION", () => {
        testWc("COMMIT TRANSACTION");
      });
    });

    dialect("sqlite", () => {
      it("supports END [TRANSACTION]", () => {
        testWc("END TRANSACTION");
        testWc("END");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("supports COMMIT WORK", () => {
        testWc("COMMIT WORK");
      });
    });
  });

  describe("rolling back a transaction", () => {
    // standard syntax
    it("supports ROLLBACK", () => {
      testWc("ROLLBACK");
    });

    dialect(["sqlite", "bigquery"], () => {
      it("supports ROLLBACK TRANSACTION", () => {
        testWc("ROLLBACK TRANSACTION");
      });
    });

    dialect(["mysql", "mariadb"], () => {
      it("supports ROLLBACK WORK", () => {
        testWc("ROLLBACK WORK");
      });
    });
  });

  dialect(["mysql", "mariadb", "sqlite"], () => {
    describe("creating savepoints", () => {
      it("supports SAVEPOINT", () => {
        testWc("SAVEPOINT my_sp");
      });
    });

    describe("removing savepoints", () => {
      it("supports RELEASE SAVEPOINT", () => {
        testWc("RELEASE SAVEPOINT my_sp");
      });

      dialect("sqlite", () => {
        it("supports RELEASE", () => {
          testWc("RELEASE my_sp");
        });
      });
    });

    describe("rolling back to savepoints", () => {
      it("supports ROLLBACK TO [SAVEPOINT]", () => {
        testWc("ROLLBACK TO SAVEPOINT my_savepoint");
        testWc("ROLLBACK TO my_savepoint");
      });

      dialect("sqlite", () => {
        it("supports ROLLBACK TRANSACTION TO [SAVEPOINT]", () => {
          testWc("ROLLBACK TRANSACTION TO SAVEPOINT my_savepoint");
          testWc("ROLLBACK TRANSACTION TO my_savepoint");
        });
      });

      dialect(["mysql", "mariadb"], () => {
        it("supports ROLLBACK WORK TO [SAVEPOINT]", () => {
          testWc("ROLLBACK WORK TO SAVEPOINT my_savepoint");
          testWc("ROLLBACK WORK TO my_savepoint");
        });
      });
    });
  });
});
