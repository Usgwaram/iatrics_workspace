process.env.NODE_ENV = "test";
process.env.EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "console";
process.env.AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX || "1000";

const db = require("../src/models");

function currentTestUsesDatabase() {
  const testPath = expect.getState().testPath || "";
  return !testPath.includes("/tests/email/") && !testPath.includes("\\tests\\email\\");
}

beforeAll(async () => {
  if (!currentTestUsesDatabase()) return;
  await db.sequelize.authenticate();
});

beforeEach(async () => {
  if (!currentTestUsesDatabase()) return;
  global.testTransaction =
    await db.sequelize.transaction();
});

afterEach(async () => {
  if (!currentTestUsesDatabase()) return;
  if (global.testTransaction) {
    await global.testTransaction.rollback();
    global.testTransaction = null;
  }
});

afterAll(async () => {
  if (!currentTestUsesDatabase()) return;
  await db.sequelize.close();
});
