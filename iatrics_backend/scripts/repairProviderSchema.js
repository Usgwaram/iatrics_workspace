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
