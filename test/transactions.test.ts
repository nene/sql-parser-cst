import { dialect, testWc } from "./test_utils";

describe("transactions", () => {
  describe("starting transaction", () => {
    // standard syntax
    dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
      it("supports START TRANSACTION", () => {
        testWc("START TRANSACTION");
      });
    });

    it("supports BEGIN", () => {
      testWc("BEGIN");
    });

    dialect(["sqlite", "bigquery", "postgresql", "plpgsql"], () => {
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

    dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
      it("supports BEGIN WORK", () => {
        testWc("BEGIN WORK");
      });
    });

    dialect(["postgresql", "plpgsql"], () => {
      it("supports [NOT] DEFERRABLE", () => {
        testWc("BEGIN NOT DEFERRABLE");
        testWc("BEGIN DEFERRABLE");
      });

      it("supports READ {WRITE | ONLY}", () => {
        testWc("BEGIN READ WRITE");
        testWc("BEGIN READ ONLY");
      });

      it("supports ISOLATION LEVEL", () => {
        testWc("BEGIN ISOLATION LEVEL SERIALIZABLE");
        testWc("BEGIN ISOLATION LEVEL REPEATABLE READ");
        testWc("BEGIN ISOLATION LEVEL READ COMMITTED");
        testWc("BEGIN ISOLATION LEVEL READ UNCOMMITTED");
      });

      it("supports multiple transaction modes", () => {
        testWc("BEGIN READ ONLY, ISOLATION LEVEL SERIALIZABLE, DEFERRABLE");
      });
    });
  });

  describe("committing transaction", () => {
    // standard syntax
    it("supports COMMIT", () => {
      testWc("COMMIT");
    });

    dialect(["sqlite", "bigquery", "postgresql", "plpgsql"], () => {
      it("supports COMMIT TRANSACTION", () => {
        testWc("COMMIT TRANSACTION");
      });
    });

    dialect(["sqlite", "postgresql", "plpgsql"], () => {
      it("supports END [TRANSACTION]", () => {
        testWc("END TRANSACTION");
        testWc("END");
      });
    });
    dialect(["postgresql", "plpgsql"], () => {
      it("supports END WORK", () => {
        testWc("END WORK");
      });
    });

    dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
      it("supports COMMIT WORK", () => {
        testWc("COMMIT WORK");
      });
    });

    dialect(["postgresql", "plpgsql"], () => {
      it("supports AND [NO] CHAIN", () => {
        testWc("COMMIT AND CHAIN");
        testWc("COMMIT AND NO CHAIN");
        testWc("COMMIT TRANSACTION AND NO CHAIN");
        testWc("END TRANSACTION AND NO CHAIN");
      });
    });
  });

  describe("rolling back a transaction", () => {
    // standard syntax
    it("supports ROLLBACK", () => {
      testWc("ROLLBACK");
    });

    dialect(["sqlite", "bigquery", "postgresql", "plpgsql"], () => {
      it("supports ROLLBACK TRANSACTION", () => {
        testWc("ROLLBACK TRANSACTION");
      });
    });

    dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
      it("supports ROLLBACK WORK", () => {
        testWc("ROLLBACK WORK");
      });
    });

    dialect(["postgresql", "plpgsql"], () => {
      it("supports AND [NO] CHAIN", () => {
        testWc("ROLLBACK AND CHAIN");
        testWc("ROLLBACK AND NO CHAIN");
        testWc("ROLLBACK TRANSACTION AND NO CHAIN");
      });
    });
  });

  dialect(["postgresql", "plpgsql"], () => {
    describe("ABORT as alias for ROLLBACK", () => {
      it("supports ABORT", () => {
        testWc("ABORT");
        testWc("ABORT WORK");
        testWc("ABORT TRANSACTION");
        testWc("ABORT AND CHAIN");
        testWc("ABORT AND NO CHAIN");
      });
    });
  });

  dialect(["mysql", "mariadb", "sqlite", "postgresql", "plpgsql"], () => {
    describe("creating savepoints", () => {
      it("supports SAVEPOINT", () => {
        testWc("SAVEPOINT my_sp");
      });
    });

    describe("removing savepoints", () => {
      it("supports RELEASE SAVEPOINT", () => {
        testWc("RELEASE SAVEPOINT my_sp");
      });

      dialect(["sqlite", "postgresql", "plpgsql"], () => {
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

      dialect(["sqlite", "postgresql", "plpgsql"], () => {
        it("supports ROLLBACK TRANSACTION TO [SAVEPOINT]", () => {
          testWc("ROLLBACK TRANSACTION TO SAVEPOINT my_savepoint");
          testWc("ROLLBACK TRANSACTION TO my_savepoint");
        });
      });

      dialect(["mysql", "mariadb", "postgresql", "plpgsql"], () => {
        it("supports ROLLBACK WORK TO [SAVEPOINT]", () => {
          testWc("ROLLBACK WORK TO SAVEPOINT my_savepoint");
          testWc("ROLLBACK WORK TO my_savepoint");
        });
      });
    });
  });
});
