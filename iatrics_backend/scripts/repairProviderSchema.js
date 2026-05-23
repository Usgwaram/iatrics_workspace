require("dotenv").config();

const db = require("../src/models");

async function repairProviderSchema() {
  const queryInterface = db.sequelize.getQueryInterface();
  const Sequelize = db.Sequelize;

  await db.sequelize.authenticate();

  const table = await queryInterface.describeTable("providers");

  if (!table.languages) {
    await queryInterface.addColumn("providers", "languages", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: ["English"],
    });
    console.log("Added providers.languages");
  } else {
    console.log("providers.languages already exists");
  }

  if (!table.isOnline) {
    await queryInterface.addColumn("providers", "isOnline", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    console.log("Added providers.isOnline");
  } else {
    console.log("providers.isOnline already exists");
  }

  if (!table.bankCode) {
    await queryInterface.addColumn("providers", "bankCode", {
      type: Sequelize.STRING,
    });
    console.log("Added providers.bankCode");
  } else {
    console.log("providers.bankCode already exists");
  }

  if (!table.accountNumber) {
    await queryInterface.addColumn("providers", "accountNumber", {
      type: Sequelize.STRING,
    });
    console.log("Added providers.accountNumber");
  } else {
    console.log("providers.accountNumber already exists");
  }

  if (!table.accountName) {
    await queryInterface.addColumn("providers", "accountName", {
      type: Sequelize.STRING,
    });
    console.log("Added providers.accountName");
  } else {
    console.log("providers.accountName already exists");
  }
}

repairProviderSchema()
  .then(async () => {
    await db.sequelize.close();
    console.log("Provider schema repair complete");
  })
  .catch(async (error) => {
    console.error("Provider schema repair failed:", error);
    await db.sequelize.close();
    process.exit(1);
  });
