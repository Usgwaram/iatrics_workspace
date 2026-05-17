const db = require("../src/models");

beforeAll(async () => {
  await db.sequelize.authenticate();
});

beforeEach(async () => {
  global.testTransaction =
    await db.sequelize.transaction();
});

afterEach(async () => {
  if (global.testTransaction) {
    await global.testTransaction.rollback();
  }
});

afterAll(async () => {
  await db.sequelize.close();
});